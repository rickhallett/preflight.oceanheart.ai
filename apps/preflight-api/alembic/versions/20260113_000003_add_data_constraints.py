"""Add data integrity constraints

Revision ID: 20260113_000003
Revises: 20260113_000002
Create Date: 2026-01-13

Adds check constraints for data integrity:
- Run status validation
- CoachingSession status validation
- CoachTurn role validation
- Temperature bounds
- Token count non-negative
"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "20260113_000003"
down_revision: Union[str, None] = "20260113_000002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Run status constraint
    op.create_check_constraint(
        "ck_runs_status",
        "runs",
        "status IN ('in_progress', 'completed', 'abandoned')",
    )

    # CoachingSession status constraint
    op.create_check_constraint(
        "ck_coaching_sessions_status",
        "coaching_sessions",
        "status IN ('active', 'completed', 'abandoned')",
    )

    # CoachingSession rounds constraints
    op.create_check_constraint(
        "ck_coaching_sessions_current_round",
        "coaching_sessions",
        "current_round >= 0",
    )
    op.create_check_constraint(
        "ck_coaching_sessions_max_rounds",
        "coaching_sessions",
        "max_rounds >= 1 AND max_rounds <= 20",
    )

    # CoachTurn role constraint
    op.create_check_constraint(
        "ck_coach_turns_role",
        "coach_turns",
        "role IN ('user', 'assistant', 'system')",
    )

    # CoachTurn turn_number constraint
    op.create_check_constraint(
        "ck_coach_turns_turn_number",
        "coach_turns",
        "turn_number >= 0",
    )

    # Token count non-negative
    op.create_check_constraint(
        "ck_coach_turns_prompt_tokens",
        "coach_turns",
        "prompt_tokens IS NULL OR prompt_tokens >= 0",
    )
    op.create_check_constraint(
        "ck_coach_turns_completion_tokens",
        "coach_turns",
        "completion_tokens IS NULL OR completion_tokens >= 0",
    )

    # PromptPipeline temperature bounds (0-200 for 0.0-2.0)
    op.create_check_constraint(
        "ck_prompt_pipelines_temperature",
        "prompt_pipelines",
        "temperature >= 0 AND temperature <= 200",
    )

    # PromptPipeline max_tokens bounds
    op.create_check_constraint(
        "ck_prompt_pipelines_max_tokens",
        "prompt_pipelines",
        "max_tokens >= 1 AND max_tokens <= 8192",
    )


def downgrade() -> None:
    # PromptPipeline constraints
    op.drop_constraint("ck_prompt_pipelines_max_tokens", "prompt_pipelines")
    op.drop_constraint("ck_prompt_pipelines_temperature", "prompt_pipelines")

    # CoachTurn constraints
    op.drop_constraint("ck_coach_turns_completion_tokens", "coach_turns")
    op.drop_constraint("ck_coach_turns_prompt_tokens", "coach_turns")
    op.drop_constraint("ck_coach_turns_turn_number", "coach_turns")
    op.drop_constraint("ck_coach_turns_role", "coach_turns")

    # CoachingSession constraints
    op.drop_constraint("ck_coaching_sessions_max_rounds", "coaching_sessions")
    op.drop_constraint("ck_coaching_sessions_current_round", "coaching_sessions")
    op.drop_constraint("ck_coaching_sessions_status", "coaching_sessions")

    # Run constraints
    op.drop_constraint("ck_runs_status", "runs")
