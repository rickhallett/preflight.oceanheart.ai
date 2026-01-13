"""Database models for coaching and prompt pipeline system."""

from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Boolean, Text, Index
from sqlalchemy.orm import relationship

from .base import Base
from .forms import GUID, JSONType


class PromptPipeline(Base):
    """Prompt pipeline definition for coaching conversations."""

    __tablename__ = "prompt_pipelines"

    id = Column(GUID(), primary_key=True, default=uuid4)
    name = Column(String(100), nullable=False, unique=True)
    version = Column(String(20), nullable=False, default="1.0.0")
    description = Column(Text, nullable=True)

    # Pipeline configuration (JSON structure)
    pipeline = Column(JSONType(), nullable=False)

    # Model configuration
    provider = Column(String(20), nullable=False, default="openai")
    model = Column(String(100), nullable=False, default="gpt-4-turbo")
    temperature = Column(Integer, nullable=False, default=70)  # Stored as int (0-100)
    max_tokens = Column(Integer, nullable=False, default=150)

    # Status
    is_active = Column(Boolean, nullable=False, default=True)

    # Timestamps
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    coaching_sessions = relationship("CoachingSession", back_populates="pipeline")

    @property
    def temperature_float(self) -> float:
        """Get temperature as float (0.0-1.0)."""
        return self.temperature / 100.0


class CoachingSession(Base):
    """A coaching session tied to a survey run."""

    __tablename__ = "coaching_sessions"
    __table_args__ = (
        Index("ix_coaching_sessions_run_id", "run_id"),
        Index("ix_coaching_sessions_pipeline_id", "pipeline_id"),
        Index("ix_coaching_sessions_status", "status"),
    )

    id = Column(GUID(), primary_key=True, default=uuid4)
    run_id = Column(GUID(), ForeignKey("runs.id"), nullable=False)
    pipeline_id = Column(GUID(), ForeignKey("prompt_pipelines.id"), nullable=False)

    # Session state
    status = Column(
        String(20), nullable=False, default="active"
    )  # active, completed, abandoned
    current_round = Column(Integer, nullable=False, default=0)
    max_rounds = Column(Integer, nullable=False, default=4)

    # Timestamps
    started_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    completed_at = Column(DateTime(timezone=True), nullable=True)
    last_activity_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # Metadata
    total_tokens_used = Column(Integer, nullable=False, default=0)
    total_cost_usd = Column(Integer, nullable=False, default=0)  # Stored as microdollars

    # Relationships
    run = relationship("Run", back_populates="coaching_session")
    pipeline = relationship("PromptPipeline", back_populates="coaching_sessions")
    turns = relationship(
        "CoachTurn", back_populates="session", order_by="CoachTurn.turn_number"
    )

    @property
    def total_cost_dollars(self) -> float:
        """Get total cost as dollars."""
        return self.total_cost_usd / 1_000_000.0


class CoachTurn(Base):
    """A single turn in a coaching conversation."""

    __tablename__ = "coach_turns"
    __table_args__ = (
        Index("ix_coach_turns_session_id", "session_id"),
        Index("ix_coach_turns_session_turn", "session_id", "turn_number"),
    )

    id = Column(GUID(), primary_key=True, default=uuid4)
    session_id = Column(GUID(), ForeignKey("coaching_sessions.id"), nullable=False)

    # Turn data
    turn_number = Column(Integer, nullable=False)
    role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)

    # Metadata (for assistant turns)
    model_used = Column(String(100), nullable=True)
    pipeline_version = Column(String(20), nullable=True)
    prompt_tokens = Column(Integer, nullable=True)
    completion_tokens = Column(Integer, nullable=True)
    response_time_ms = Column(Integer, nullable=True)

    # Timestamps
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    session = relationship("CoachingSession", back_populates="turns")
