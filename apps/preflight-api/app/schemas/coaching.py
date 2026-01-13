"""Pydantic schemas for coaching and prompt pipeline system."""

from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


# Pipeline schemas
class PipelineRoundConfig(BaseModel):
    """Configuration for a single round in the pipeline."""

    round_number: int
    system_prompt: Optional[str] = None
    user_prompt_template: Optional[str] = None
    assistant_prompt_template: Optional[str] = None


class PipelineDefinition(BaseModel):
    """Full pipeline definition structure."""

    rounds: list[PipelineRoundConfig]
    variables: list[str] = Field(default_factory=list)
    safety_prompts: list[str] = Field(default_factory=list)


class PromptPipelineBase(BaseModel):
    """Base schema for prompt pipeline."""

    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    provider: str = Field(default="openai")
    model: str = Field(default="gpt-4-turbo")
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(default=150, ge=1, le=4096)


class PromptPipelineCreate(PromptPipelineBase):
    """Schema for creating a prompt pipeline."""

    version: str = Field(default="1.0.0")
    pipeline: PipelineDefinition


class PromptPipelineUpdate(BaseModel):
    """Schema for updating a prompt pipeline."""

    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    provider: Optional[str] = None
    model: Optional[str] = None
    temperature: Optional[float] = Field(None, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(None, ge=1, le=4096)
    pipeline: Optional[PipelineDefinition] = None
    is_active: Optional[bool] = None


class PromptPipelineResponse(PromptPipelineBase):
    """Schema for prompt pipeline response."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    version: str
    pipeline: dict[str, Any]
    is_active: bool
    created_at: datetime
    updated_at: datetime


# Coaching session schemas
class CoachingSessionBase(BaseModel):
    """Base schema for coaching session."""

    pipeline_id: UUID


class CoachingSessionCreate(CoachingSessionBase):
    """Schema for creating a coaching session."""

    max_rounds: int = Field(default=4, ge=1, le=10)


class CoachingSessionResponse(BaseModel):
    """Schema for coaching session response."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    run_id: UUID
    pipeline_id: UUID
    status: str
    current_round: int
    max_rounds: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    last_activity_at: datetime


class CoachingSessionDetail(CoachingSessionResponse):
    """Detailed coaching session with turns."""

    turns: list["CoachTurnResponse"]
    total_tokens_used: int
    total_cost_dollars: float


# Coach turn schemas
class CoachTurnBase(BaseModel):
    """Base schema for coach turn."""

    content: str = Field(..., min_length=1, max_length=10000)


class CoachTurnCreate(CoachTurnBase):
    """Schema for creating a coach turn (user message)."""

    pass


class CoachTurnResponse(BaseModel):
    """Schema for coach turn response."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    session_id: UUID
    turn_number: int
    role: str
    content: str
    model_used: Optional[str] = None
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None
    response_time_ms: Optional[int] = None
    created_at: datetime


# Coaching API schemas
class SendMessageRequest(BaseModel):
    """Request to send a message to the coach."""

    message: str = Field(..., min_length=1, max_length=5000)


class SendMessageResponse(BaseModel):
    """Response from sending a message."""

    user_turn: CoachTurnResponse
    assistant_turn: CoachTurnResponse
    session_status: str
    current_round: int
    max_rounds: int
    remaining_rounds: int


class StartCoachingRequest(BaseModel):
    """Request to start a coaching session."""

    pipeline_name: Optional[str] = Field(default="default")


class StartCoachingResponse(BaseModel):
    """Response from starting a coaching session."""

    session: CoachingSessionResponse
    initial_message: CoachTurnResponse


class ConversationHistoryResponse(BaseModel):
    """Response containing conversation history."""

    session: CoachingSessionResponse
    turns: list[CoachTurnResponse]


# Update forward references
CoachingSessionDetail.model_rebuild()
