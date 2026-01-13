"""Run and answers API endpoints."""
import secrets
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..dependencies import get_db
from ..models.forms import Answer, FormDefinition, Run
from ..schemas.forms import (
    AnswersSave,
    AnswersSaveResponse,
    AnswerSummary,
    RFC7807Error,
    RunCompleteResponse,
    RunCreate,
    RunResponse,
    RunSummaryResponse,
)

router = APIRouter(prefix="/runs", tags=["runs"])


def generate_session_token() -> str:
    """Generate a secure session token."""
    return secrets.token_urlsafe(32)


@router.post(
    "",
    response_model=RunResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        404: {"model": RFC7807Error, "description": "Form not found"},
    },
)
async def create_run(
    run_data: RunCreate,
    db: Session = Depends(get_db),
) -> RunResponse:
    """
    Create a new survey run.

    Creates a new run instance for the specified form and returns the run ID
    and session token for subsequent requests.
    """
    query = select(FormDefinition).where(
        FormDefinition.name == run_data.form_name,
        FormDefinition.is_active.is_(True),
    )

    if run_data.version:
        query = query.where(FormDefinition.version == run_data.version)
    else:
        query = query.order_by(FormDefinition.created_at.desc())

    form_def = db.execute(query).scalar_one_or_none()

    if not form_def:
        raise HTTPException(
            status_code=404,
            detail={
                "type": "https://preflight.oceanheart.ai/errors/form-not-found",
                "title": "Form Not Found",
                "status": 404,
                "detail": f"Form '{run_data.form_name}' with version '{run_data.version or 'latest'}' not found",
                "instance": "/runs",
            },
        )

    run = Run(
        form_definition_id=form_def.id,
        session_token=generate_session_token(),
        status="in_progress",
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    return RunResponse(
        run_id=run.id,
        form_version=form_def.version,
        started_at=run.started_at,
    )


@router.get(
    "/{run_id}",
    response_model=RunSummaryResponse,
    responses={
        404: {"model": RFC7807Error, "description": "Run not found"},
    },
)
async def get_run(
    run_id: UUID,
    db: Session = Depends(get_db),
) -> RunSummaryResponse:
    """
    Get a run with its answers.

    Returns the run status, last page visited, and all saved answers.
    """
    run = db.execute(select(Run).where(Run.id == run_id)).scalar_one_or_none()

    if not run:
        raise HTTPException(
            status_code=404,
            detail={
                "type": "https://preflight.oceanheart.ai/errors/run-not-found",
                "title": "Run Not Found",
                "status": 404,
                "detail": f"Run '{run_id}' not found",
                "instance": f"/runs/{run_id}",
            },
        )

    answers_query = (
        select(Answer)
        .where(Answer.run_id == run_id)
        .order_by(Answer.saved_at.desc())
    )
    answers = db.execute(answers_query).scalars().all()

    last_page = None
    if answers:
        last_page = answers[0].page_id

    return RunSummaryResponse(
        run_id=run.id,
        status=run.status,
        last_page=last_page,
        started_at=run.started_at,
        completed_at=run.completed_at,
        answers=[
            AnswerSummary(
                page_id=a.page_id,
                field_name=a.field_name,
                value=a.value,
                saved_at=a.saved_at,
            )
            for a in answers
        ],
    )


@router.patch(
    "/{run_id}/answers",
    response_model=AnswersSaveResponse,
    responses={
        404: {"model": RFC7807Error, "description": "Run not found"},
        422: {"model": RFC7807Error, "description": "Validation error"},
    },
)
async def save_answers(
    run_id: UUID,
    data: AnswersSave,
    db: Session = Depends(get_db),
) -> AnswersSaveResponse:
    """
    Save answers for a page (autosave endpoint).

    This endpoint is idempotent - saving the same page_id and field_name
    will update the existing answer rather than creating duplicates.
    """
    run = db.execute(select(Run).where(Run.id == run_id)).scalar_one_or_none()

    if not run:
        raise HTTPException(
            status_code=404,
            detail={
                "type": "https://preflight.oceanheart.ai/errors/run-not-found",
                "title": "Run Not Found",
                "status": 404,
                "detail": f"Run '{run_id}' not found",
                "instance": f"/runs/{run_id}/answers",
            },
        )

    if run.status == "completed":
        raise HTTPException(
            status_code=422,
            detail={
                "type": "https://preflight.oceanheart.ai/errors/run-completed",
                "title": "Run Already Completed",
                "status": 422,
                "detail": "Cannot save answers to a completed run",
                "instance": f"/runs/{run_id}/answers",
            },
        )

    saved_at = datetime.now(timezone.utc)

    for field_name, value in data.answers.items():
        existing = db.execute(
            select(Answer).where(
                Answer.run_id == run_id,
                Answer.page_id == data.page_id,
                Answer.field_name == field_name,
            )
        ).scalar_one_or_none()

        if existing:
            existing.value = value
            existing.saved_at = saved_at
        else:
            answer = Answer(
                run_id=run_id,
                page_id=data.page_id,
                field_name=field_name,
                value=value,
                saved_at=saved_at,
            )
            db.add(answer)

    db.commit()

    return AnswersSaveResponse(saved_at=saved_at)


@router.post(
    "/{run_id}/complete",
    response_model=RunCompleteResponse,
    responses={
        404: {"model": RFC7807Error, "description": "Run not found"},
        422: {"model": RFC7807Error, "description": "Run already completed"},
    },
)
async def complete_run(
    run_id: UUID,
    db: Session = Depends(get_db),
) -> RunCompleteResponse:
    """
    Mark a run as completed.

    Once completed, no further answers can be saved to this run.
    """
    run = db.execute(select(Run).where(Run.id == run_id)).scalar_one_or_none()

    if not run:
        raise HTTPException(
            status_code=404,
            detail={
                "type": "https://preflight.oceanheart.ai/errors/run-not-found",
                "title": "Run Not Found",
                "status": 404,
                "detail": f"Run '{run_id}' not found",
                "instance": f"/runs/{run_id}/complete",
            },
        )

    if run.status == "completed":
        raise HTTPException(
            status_code=422,
            detail={
                "type": "https://preflight.oceanheart.ai/errors/run-completed",
                "title": "Run Already Completed",
                "status": 422,
                "detail": "Run has already been completed",
                "instance": f"/runs/{run_id}/complete",
            },
        )

    completed_at = datetime.now(timezone.utc)
    run.status = "completed"
    run.completed_at = completed_at
    db.commit()

    return RunCompleteResponse(
        status="completed",
        completed_at=completed_at,
    )
