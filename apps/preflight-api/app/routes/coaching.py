"""API routes for coaching system."""

import logging
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.middleware import (
    CurrentUser,
    get_current_user,
    require_admin,
    coaching_rate_limit,
)
from app.models.coaching import CoachingSession, CoachTurn, PromptPipeline
from app.models.forms import Run
from app.schemas.coaching import (
    CoachingSessionResponse,
    CoachTurnResponse,
    ConversationHistoryResponse,
    SendMessageRequest,
    SendMessageResponse,
    StartCoachingRequest,
    StartCoachingResponse,
    PromptPipelineResponse,
    PromptPipelineCreate,
)
from app.services.pipeline import PipelineEngine
from app.services.llm import LLMConfig

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/runs/{run_id}/coach", tags=["coaching"])


async def get_run_or_404(run_id: UUID, db: AsyncSession) -> Run:
    """Get a run by ID or raise 404."""
    result = await db.execute(
        select(Run).where(Run.id == run_id).options(selectinload(Run.answers))
    )
    run = result.scalar_one_or_none()
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Run {run_id} not found",
        )
    return run


async def get_session_or_404(
    run_id: UUID, db: AsyncSession, load_turns: bool = False
) -> CoachingSession:
    """Get a coaching session by run ID or raise 404."""
    query = select(CoachingSession).where(CoachingSession.run_id == run_id)
    if load_turns:
        query = query.options(selectinload(CoachingSession.turns))

    result = await db.execute(query)
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No coaching session found for run {run_id}",
        )
    return session


async def get_default_pipeline(db: AsyncSession) -> PromptPipeline:
    """Get the default active pipeline."""
    result = await db.execute(
        select(PromptPipeline)
        .where(PromptPipeline.is_active == True)
        .order_by(PromptPipeline.created_at.desc())
        .limit(1)
    )
    pipeline = result.scalar_one_or_none()
    if not pipeline:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No active coaching pipeline configured",
        )
    return pipeline


@router.post("/start", response_model=StartCoachingResponse)
async def start_coaching(
    run_id: UUID,
    request: StartCoachingRequest = StartCoachingRequest(),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    _rate_limit: None = Depends(coaching_rate_limit),
):
    """Start a new coaching session for a run.

    Creates a coaching session and generates the initial AI message.
    """
    logger.info(f"User {current_user.id} starting coaching session for run {run_id}")

    async with db.begin():
        # Get the run
        run = await get_run_or_404(run_id, db)

        # Check if session already exists
        existing = await db.execute(
            select(CoachingSession).where(CoachingSession.run_id == run_id)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Coaching session already exists for this run",
            )

        # Get pipeline
        if request.pipeline_name and request.pipeline_name != "default":
            result = await db.execute(
                select(PromptPipeline).where(
                    PromptPipeline.name == request.pipeline_name,
                    PromptPipeline.is_active == True,
                )
            )
            pipeline = result.scalar_one_or_none()
            if not pipeline:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Pipeline '{request.pipeline_name}' not found or inactive",
                )
        else:
            pipeline = await get_default_pipeline(db)

        # Create session
        session = CoachingSession(
            run_id=run_id,
            pipeline_id=pipeline.id,
            status="active",
            current_round=1,
            max_rounds=4,
        )
        db.add(session)
        await db.flush()

        # Create context from survey answers
        engine = PipelineEngine()
        answers_data = [
            {"page_id": a.page_id, "field_name": a.field_name, "value": a.value}
            for a in run.answers
        ]
        context = engine.create_context_from_run(answers_data)

        # Generate initial message
        config = LLMConfig(
            model=pipeline.model,
            temperature=pipeline.temperature_float,
            max_tokens=pipeline.max_tokens,
        )
        result = await engine.generate_initial_message(pipeline.pipeline, context, config)

        if not result.success:
            logger.error(f"Failed to generate initial message: {result.error}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Failed to generate initial message. Please try again.",
            )

        # Save initial turn
        initial_turn = CoachTurn(
            session_id=session.id,
            turn_number=1,
            role="assistant",
            content=result.response,
            model_used=result.llm_response.model if result.llm_response else None,
            pipeline_version=pipeline.version,
            prompt_tokens=result.llm_response.prompt_tokens if result.llm_response else None,
            completion_tokens=(
                result.llm_response.completion_tokens if result.llm_response else None
            ),
            response_time_ms=(
                result.llm_response.response_time_ms if result.llm_response else None
            ),
        )
        db.add(initial_turn)

        # Update session metrics
        if result.llm_response:
            session.total_tokens_used = result.llm_response.total_tokens
            session.total_cost_usd = int(result.llm_response.estimated_cost_usd * 1_000_000)

        await db.flush()
        await db.refresh(session)
        await db.refresh(initial_turn)

    logger.info(f"Coaching session {session.id} started for run {run_id}")

    return StartCoachingResponse(
        session=CoachingSessionResponse.model_validate(session),
        initial_message=CoachTurnResponse.model_validate(initial_turn),
    )


@router.post("/message", response_model=SendMessageResponse)
async def send_message(
    run_id: UUID,
    request: SendMessageRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    _rate_limit: None = Depends(coaching_rate_limit),
):
    """Send a message to the coach and get a response.

    Validates round limits and generates an AI response.
    """
    logger.info(f"User {current_user.id} sending message for run {run_id}")

    async with db.begin():
        # Get session with turns
        session = await get_session_or_404(run_id, db, load_turns=True)

        # Check session status
        if session.status != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Coaching session is {session.status}",
            )

        # Check round limit
        if session.current_round >= session.max_rounds:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Maximum rounds ({session.max_rounds}) reached",
            )

        # Get pipeline
        result = await db.execute(
            select(PromptPipeline).where(PromptPipeline.id == session.pipeline_id)
        )
        pipeline = result.scalar_one()

        # Get run for context
        run = await get_run_or_404(run_id, db)

        # Build conversation history
        history = [{"role": t.role, "content": t.content} for t in session.turns]

        # Create context
        engine = PipelineEngine()
        answers_data = [
            {"page_id": a.page_id, "field_name": a.field_name, "value": a.value}
            for a in run.answers
        ]
        context = engine.create_context_from_run(answers_data)

        # Get next turn number
        next_turn = len(session.turns) + 1

        # Save user turn
        user_turn = CoachTurn(
            session_id=session.id,
            turn_number=next_turn,
            role="user",
            content=request.message,
        )
        db.add(user_turn)
        await db.flush()

        # Execute pipeline round
        config = LLMConfig(
            model=pipeline.model,
            temperature=pipeline.temperature_float,
            max_tokens=pipeline.max_tokens,
        )
        exec_result = await engine.execute_round(
            pipeline.pipeline, context, history, request.message, config
        )

        if not exec_result.success:
            logger.error(f"Failed to generate response: {exec_result.error}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Failed to generate response. Please try again.",
            )

        # Save assistant turn
        assistant_turn = CoachTurn(
            session_id=session.id,
            turn_number=next_turn + 1,
            role="assistant",
            content=exec_result.response,
            model_used=exec_result.llm_response.model if exec_result.llm_response else None,
            pipeline_version=pipeline.version,
            prompt_tokens=(
                exec_result.llm_response.prompt_tokens if exec_result.llm_response else None
            ),
            completion_tokens=(
                exec_result.llm_response.completion_tokens
                if exec_result.llm_response
                else None
            ),
            response_time_ms=(
                exec_result.llm_response.response_time_ms
                if exec_result.llm_response
                else None
            ),
        )
        db.add(assistant_turn)

        # Update session
        session.current_round += 1
        session.last_activity_at = datetime.now(timezone.utc)
        if exec_result.llm_response:
            session.total_tokens_used += exec_result.llm_response.total_tokens
            session.total_cost_usd += int(
                exec_result.llm_response.estimated_cost_usd * 1_000_000
            )

        # Check if this was the last round
        remaining = session.max_rounds - session.current_round
        if remaining <= 0:
            session.status = "completed"
            session.completed_at = datetime.now(timezone.utc)

        await db.flush()
        await db.refresh(user_turn)
        await db.refresh(assistant_turn)
        await db.refresh(session)

    return SendMessageResponse(
        user_turn=CoachTurnResponse.model_validate(user_turn),
        assistant_turn=CoachTurnResponse.model_validate(assistant_turn),
        session_status=session.status,
        current_round=session.current_round,
        max_rounds=session.max_rounds,
        remaining_rounds=remaining,
    )


@router.get("/history", response_model=ConversationHistoryResponse)
async def get_conversation_history(
    run_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Get the full conversation history for a coaching session."""
    session = await get_session_or_404(run_id, db, load_turns=True)

    return ConversationHistoryResponse(
        session=CoachingSessionResponse.model_validate(session),
        turns=[CoachTurnResponse.model_validate(t) for t in session.turns],
    )


@router.post("/end")
async def end_coaching(
    run_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """End a coaching session early."""
    logger.info(f"User {current_user.id} ending coaching session for run {run_id}")

    async with db.begin():
        session = await get_session_or_404(run_id, db)

        if session.status == "completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Session already completed",
            )

        session.status = "completed"
        session.completed_at = datetime.now(timezone.utc)

    return {"status": "completed", "message": "Coaching session ended"}


# Pipeline management endpoints (admin)
pipeline_router = APIRouter(prefix="/pipelines", tags=["pipelines"])


@pipeline_router.get("", response_model=list[PromptPipelineResponse])
async def list_pipelines(
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """List all prompt pipelines."""
    query = select(PromptPipeline)
    if active_only:
        query = query.where(PromptPipeline.is_active == True)
    query = query.order_by(PromptPipeline.name)

    result = await db.execute(query)
    pipelines = result.scalars().all()

    return [PromptPipelineResponse.model_validate(p) for p in pipelines]


@pipeline_router.get("/{pipeline_id}", response_model=PromptPipelineResponse)
async def get_pipeline(
    pipeline_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Get a specific pipeline by ID."""
    result = await db.execute(
        select(PromptPipeline).where(PromptPipeline.id == pipeline_id)
    )
    pipeline = result.scalar_one_or_none()
    if not pipeline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pipeline {pipeline_id} not found",
        )
    return PromptPipelineResponse.model_validate(pipeline)


@pipeline_router.post("", response_model=PromptPipelineResponse)
async def create_pipeline(
    request: PromptPipelineCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_admin),
):
    """Create a new prompt pipeline (admin only)."""
    logger.info(f"Admin {current_user.id} creating pipeline: {request.name}")

    async with db.begin():
        # Check for duplicate name
        existing = await db.execute(
            select(PromptPipeline).where(PromptPipeline.name == request.name)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Pipeline '{request.name}' already exists",
            )

        pipeline = PromptPipeline(
            name=request.name,
            version=request.version,
            description=request.description,
            pipeline=request.pipeline.model_dump(),
            provider=request.provider,
            model=request.model,
            temperature=int(request.temperature * 100),
            max_tokens=request.max_tokens,
            is_active=True,
        )
        db.add(pipeline)
        await db.flush()
        await db.refresh(pipeline)

    return PromptPipelineResponse.model_validate(pipeline)
