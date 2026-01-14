"""SQLAlchemy models for form system."""
import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, ForeignKey, Index, JSON, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import CHAR, TypeDecorator

from .base import Base


class GUID(TypeDecorator):
    """Platform-independent GUID type.

    Uses PostgreSQL's UUID type, otherwise uses CHAR(36), storing as stringified hex values.
    """

    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(UUID(as_uuid=True))
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == "postgresql":
            return value
        else:
            if isinstance(value, uuid.UUID):
                return str(value)
            else:
                return str(uuid.UUID(value))

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        if isinstance(value, uuid.UUID):
            return value
        return uuid.UUID(value)


class JSONType(TypeDecorator):
    """Platform-independent JSON type.

    Uses PostgreSQL's JSONB type for better performance, otherwise uses JSON.
    """

    impl = JSON
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(JSONB)
        else:
            return dialect.type_descriptor(JSON)


class FormDefinition(Base):
    __tablename__ = "form_definitions"
    __table_args__ = (
        Index("ix_form_definitions_name_active", "name", "is_active"),
        Index("ix_form_definitions_created_at", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    version: Mapped[str] = mapped_column(String(50), nullable=False)
    definition: Mapped[dict[str, Any]] = mapped_column(JSONType, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now(), nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, server_default="true")

    runs: Mapped[list["Run"]] = relationship("Run", back_populates="form_definition")


class Run(Base):
    __tablename__ = "runs"
    __table_args__ = (
        Index("ix_runs_form_definition_id", "form_definition_id"),
        Index("ix_runs_status", "status"),
        Index("ix_runs_session_token", "session_token"),
        Index("ix_runs_started_at", "started_at"),
        Index("ix_runs_form_status", "form_definition_id", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    form_definition_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("form_definitions.id"), nullable=False
    )
    session_token: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(50), server_default="in_progress")
    started_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), nullable=False
    )
    completed_at: Mapped[datetime | None] = mapped_column(nullable=True)
    metadata_: Mapped[dict[str, Any] | None] = mapped_column(
        "metadata", JSONType, nullable=True
    )

    form_definition: Mapped["FormDefinition"] = relationship(
        "FormDefinition", back_populates="runs"
    )
    answers: Mapped[list["Answer"]] = relationship("Answer", back_populates="run")
    coaching_session: Mapped["CoachingSession"] = relationship(
        "CoachingSession", back_populates="run", uselist=False
    )


# Forward reference for CoachingSession
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .coaching import CoachingSession


class Answer(Base):
    __tablename__ = "answers"
    __table_args__ = (
        Index("ix_answers_run_id", "run_id"),
        Index("ix_answers_run_page", "run_id", "page_id"),
        Index("ix_answers_run_field", "run_id", "field_name"),
    )

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    run_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("runs.id"), nullable=False
    )
    page_id: Mapped[str] = mapped_column(String(255), nullable=False)
    field_name: Mapped[str] = mapped_column(String(255), nullable=False)
    value: Mapped[Any] = mapped_column(JSONType, nullable=False)
    saved_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), nullable=False
    )

    run: Mapped["Run"] = relationship("Run", back_populates="answers")
