from alembic import op
import sqlalchemy as sa


revision = "20250912_000001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")

    op.create_table(
        "form_definitions",
        sa.Column("id", sa.dialects.postgresql.UUID(), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False, unique=True),
        sa.Column("version", sa.String(50), nullable=False),
        sa.Column("definition", sa.dialects.postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.TIMESTAMP(), server_default=sa.func.now()),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
    )

    op.create_table(
        "runs",
        sa.Column("id", sa.dialects.postgresql.UUID(), primary_key=True),
        sa.Column("form_definition_id", sa.dialects.postgresql.UUID(), sa.ForeignKey("form_definitions.id")),
        sa.Column("session_token", sa.String(255)),
        sa.Column("status", sa.String(50), server_default=sa.text("'in_progress'")),
        sa.Column("started_at", sa.TIMESTAMP(), server_default=sa.func.now()),
        sa.Column("completed_at", sa.TIMESTAMP()),
        sa.Column("metadata", sa.dialects.postgresql.JSONB(astext_type=sa.Text())),
    )

    op.create_table(
        "answers",
        sa.Column("id", sa.dialects.postgresql.UUID(), primary_key=True),
        sa.Column("run_id", sa.dialects.postgresql.UUID(), sa.ForeignKey("runs.id")),
        sa.Column("page_id", sa.String(255), nullable=False),
        sa.Column("field_name", sa.String(255), nullable=False),
        sa.Column("value", sa.dialects.postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("saved_at", sa.TIMESTAMP(), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("answers")
    op.drop_table("runs")
    op.drop_table("form_definitions")

