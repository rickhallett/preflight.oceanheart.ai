"""Add performance indexes

Revision ID: 20260113_000002
Revises: 20260113_000001
Create Date: 2026-01-13

Adds indexes for common query patterns:
- FormDefinition: name+active, created_at
- Run: form_definition_id, status, session_token, started_at, composite
- Answer: run_id, run+page, run+field
"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "20260113_000002"
down_revision: Union[str, None] = "20260113_000001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # FormDefinition indexes
    op.create_index(
        "ix_form_definitions_name_active",
        "form_definitions",
        ["name", "is_active"],
        unique=False,
    )
    op.create_index(
        "ix_form_definitions_created_at",
        "form_definitions",
        ["created_at"],
        unique=False,
    )

    # Run indexes
    op.create_index(
        "ix_runs_form_definition_id",
        "runs",
        ["form_definition_id"],
        unique=False,
    )
    op.create_index(
        "ix_runs_status",
        "runs",
        ["status"],
        unique=False,
    )
    op.create_index(
        "ix_runs_session_token",
        "runs",
        ["session_token"],
        unique=False,
    )
    op.create_index(
        "ix_runs_started_at",
        "runs",
        ["started_at"],
        unique=False,
    )
    op.create_index(
        "ix_runs_form_status",
        "runs",
        ["form_definition_id", "status"],
        unique=False,
    )

    # Answer indexes
    op.create_index(
        "ix_answers_run_id",
        "answers",
        ["run_id"],
        unique=False,
    )
    op.create_index(
        "ix_answers_run_page",
        "answers",
        ["run_id", "page_id"],
        unique=False,
    )
    op.create_index(
        "ix_answers_run_field",
        "answers",
        ["run_id", "field_name"],
        unique=False,
    )


def downgrade() -> None:
    # Answer indexes
    op.drop_index("ix_answers_run_field", table_name="answers")
    op.drop_index("ix_answers_run_page", table_name="answers")
    op.drop_index("ix_answers_run_id", table_name="answers")

    # Run indexes
    op.drop_index("ix_runs_form_status", table_name="runs")
    op.drop_index("ix_runs_started_at", table_name="runs")
    op.drop_index("ix_runs_session_token", table_name="runs")
    op.drop_index("ix_runs_status", table_name="runs")
    op.drop_index("ix_runs_form_definition_id", table_name="runs")

    # FormDefinition indexes
    op.drop_index("ix_form_definitions_created_at", table_name="form_definitions")
    op.drop_index("ix_form_definitions_name_active", table_name="form_definitions")
