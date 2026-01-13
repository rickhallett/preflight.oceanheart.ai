"""Pydantic schemas for form system endpoints."""
from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class RFC7807Error(BaseModel):
    """RFC 7807 Problem Details for HTTP APIs."""

    type: str = Field(default="about:blank", description="URI reference identifying the problem type")
    title: str = Field(description="Short human-readable summary of the problem")
    status: int = Field(description="HTTP status code")
    detail: str | None = Field(default=None, description="Human-readable explanation")
    instance: str | None = Field(default=None, description="URI reference identifying the specific occurrence")


# Form Definition Schemas
class FormPageBlock(BaseModel):
    """A block within a form page."""

    type: str
    name: str | None = None
    label: str | None = None
    content: str | None = None
    options: list[Any] | None = None
    required: bool = False


class FormPage(BaseModel):
    """A page within a form."""

    id: str
    title: str
    blocks: list[FormPageBlock]


class FormNavigation(BaseModel):
    """Navigation configuration for a form."""

    style: str = "pager"
    autosave: bool = True


class FormMeta(BaseModel):
    """Metadata for a form."""

    version: str


class FormDefinitionResponse(BaseModel):
    """Response schema for form definition."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    pages: list[FormPage]
    navigation: FormNavigation
    meta: FormMeta


# Run Schemas
class RunCreate(BaseModel):
    """Request schema for creating a new run."""

    form_name: str = Field(description="Name of the form to create a run for")
    version: str | None = Field(default=None, description="Optional specific version of the form")


class RunResponse(BaseModel):
    """Response schema for a newly created run."""

    model_config = ConfigDict(from_attributes=True)

    run_id: UUID
    form_version: str
    started_at: datetime


class AnswerSummary(BaseModel):
    """Summary of an answer."""

    page_id: str
    field_name: str
    value: Any
    saved_at: datetime


class RunSummaryResponse(BaseModel):
    """Response schema for run summary with answers."""

    model_config = ConfigDict(from_attributes=True)

    run_id: UUID
    status: str
    last_page: str | None = None
    started_at: datetime
    completed_at: datetime | None = None
    answers: list[AnswerSummary]


# Answers Schemas
class AnswersSave(BaseModel):
    """Request schema for saving answers."""

    page_id: str = Field(description="ID of the page these answers belong to")
    answers: dict[str, Any] = Field(description="Field name to value mapping")


class AnswersSaveResponse(BaseModel):
    """Response schema for saved answers."""

    saved_at: datetime


# Complete Run Schema
class RunCompleteResponse(BaseModel):
    """Response schema for completing a run."""

    status: str = "completed"
    completed_at: datetime
