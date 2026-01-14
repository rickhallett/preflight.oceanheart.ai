"""Seed default prompt pipelines.

Revision ID: 20260113_000001
Revises: 20250912_000001
Create Date: 2026-01-13
"""
from alembic import op
import sqlalchemy as sa
from uuid import uuid4
import json

# revision identifiers, used by Alembic.
revision = "20260113_000001"
down_revision = "20250912_000001"
branch_labels = None
depends_on = None


# Default coaching pipeline configuration
DEFAULT_PIPELINE = {
    "system_prompt": """You are an AI coach helping professionals prepare for AI integration in their work.

CONTEXT:
The user has completed a survey about their AI readiness and experiences. Use this context to personalize your coaching:
{{survey_responses}}

YOUR ROLE:
- Help the user explore their AI readiness challenges
- Ask thoughtful, open-ended questions to understand their situation
- Provide actionable insights based on their responses
- Maintain a warm, professional, and supportive tone

CONSTRAINTS:
- Keep responses concise (2-3 paragraphs maximum)
- Focus on one topic per exchange
- Never provide medical, legal, or financial advice
- If asked about topics outside your scope, redirect to the coaching focus

COACHING APPROACH:
1. Listen actively and reflect back what you hear
2. Ask clarifying questions to deepen understanding
3. Offer practical strategies when appropriate
4. Encourage the user to set concrete next steps""",

    "initial_prompt": """Based on the survey responses provided, introduce yourself warmly as an AI coach.
Acknowledge one specific thing from their responses that stood out.
Then ask an open-ended question about their biggest challenge or goal with AI adoption.
Keep your introduction brief and focused.""",
}

# Focused problem-solving pipeline
FOCUSED_PIPELINE = {
    "system_prompt": """You are a focused AI coach specializing in structured problem-solving.

CONTEXT:
{{survey_responses}}

YOUR ROLE:
- Guide users through a systematic approach to their challenges
- Help them break down complex problems into manageable steps
- Provide frameworks and action items

APPROACH:
1. Identify the core problem
2. Explore potential solutions
3. Help prioritize actions
4. Create concrete next steps""",

    "initial_prompt": """Review the survey responses and identify the most pressing challenge mentioned.
Ask the user to confirm this is what they'd like to focus on, or invite them to choose a different topic.
Be direct and action-oriented in your communication.""",
}


def upgrade() -> None:
    """Seed default prompt pipelines."""
    conn = op.get_bind()

    # Check if prompt_pipelines table exists
    inspector = sa.inspect(conn)
    if 'prompt_pipelines' not in inspector.get_table_names():
        # Create the table if it doesn't exist
        op.create_table(
            'prompt_pipelines',
            sa.Column('id', sa.dialects.postgresql.UUID(), primary_key=True),
            sa.Column('name', sa.String(255), nullable=False, unique=True),
            sa.Column('version', sa.String(50), nullable=False),
            sa.Column('description', sa.Text()),
            sa.Column('pipeline', sa.dialects.postgresql.JSONB(astext_type=sa.Text()), nullable=False),
            sa.Column('provider', sa.String(50), nullable=False),
            sa.Column('model', sa.String(100), nullable=False),
            sa.Column('temperature', sa.Integer(), default=70),  # Stored as int 0-100
            sa.Column('max_tokens', sa.Integer(), default=200),
            sa.Column('is_active', sa.Boolean(), server_default=sa.text('true')),
            sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.func.now()),
            sa.Column('updated_at', sa.TIMESTAMP(), server_default=sa.func.now()),
        )

    # Insert default pipeline
    conn.execute(sa.text("""
        INSERT INTO prompt_pipelines
        (id, name, version, description, pipeline, provider, model, temperature, max_tokens, is_active)
        VALUES
        (:id, :name, :version, :description, CAST(:pipeline AS jsonb), :provider, :model, :temperature, :max_tokens, :is_active)
        ON CONFLICT (name) DO NOTHING
    """), {
        'id': str(uuid4()),
        'name': 'default',
        'version': '1.0.0',
        'description': 'Default coaching pipeline for AI readiness exploration',
        'pipeline': json.dumps(DEFAULT_PIPELINE),
        'provider': 'openai',
        'model': 'gpt-4-turbo',
        'temperature': 70,
        'max_tokens': 200,
        'is_active': True
    })

    # Insert focused pipeline
    conn.execute(sa.text("""
        INSERT INTO prompt_pipelines
        (id, name, version, description, pipeline, provider, model, temperature, max_tokens, is_active)
        VALUES
        (:id, :name, :version, :description, CAST(:pipeline AS jsonb), :provider, :model, :temperature, :max_tokens, :is_active)
        ON CONFLICT (name) DO NOTHING
    """), {
        'id': str(uuid4()),
        'name': 'focused',
        'version': '1.0.0',
        'description': 'Focused problem-solving pipeline with structured approach',
        'pipeline': json.dumps(FOCUSED_PIPELINE),
        'provider': 'anthropic',
        'model': 'claude-3-5-sonnet-20241022',
        'temperature': 60,
        'max_tokens': 150,
        'is_active': True
    })

    # Create coaching_sessions table if not exists
    if 'coaching_sessions' not in inspector.get_table_names():
        op.create_table(
            'coaching_sessions',
            sa.Column('id', sa.dialects.postgresql.UUID(), primary_key=True),
            sa.Column('run_id', sa.dialects.postgresql.UUID(), sa.ForeignKey('runs.id'), nullable=False),
            sa.Column('pipeline_id', sa.dialects.postgresql.UUID(), sa.ForeignKey('prompt_pipelines.id'), nullable=False),
            sa.Column('status', sa.String(50), server_default=sa.text("'active'")),
            sa.Column('current_round', sa.Integer(), default=0),
            sa.Column('max_rounds', sa.Integer(), default=4),
            sa.Column('started_at', sa.TIMESTAMP(), server_default=sa.func.now()),
            sa.Column('completed_at', sa.TIMESTAMP()),
            sa.Column('last_activity_at', sa.TIMESTAMP(), server_default=sa.func.now()),
            sa.Column('total_tokens_used', sa.Integer(), default=0),
            sa.Column('total_cost_microdollars', sa.BigInteger(), default=0),
        )
        op.create_index('ix_coaching_sessions_run_id', 'coaching_sessions', ['run_id'])
        op.create_index('ix_coaching_sessions_status', 'coaching_sessions', ['status'])

    # Create coach_turns table if not exists
    if 'coach_turns' not in inspector.get_table_names():
        op.create_table(
            'coach_turns',
            sa.Column('id', sa.dialects.postgresql.UUID(), primary_key=True),
            sa.Column('session_id', sa.dialects.postgresql.UUID(), sa.ForeignKey('coaching_sessions.id'), nullable=False),
            sa.Column('turn_number', sa.Integer(), nullable=False),
            sa.Column('role', sa.String(20), nullable=False),  # 'user' or 'assistant'
            sa.Column('content', sa.Text(), nullable=False),
            sa.Column('model_used', sa.String(100)),
            sa.Column('pipeline_version', sa.String(50)),
            sa.Column('prompt_tokens', sa.Integer()),
            sa.Column('completion_tokens', sa.Integer()),
            sa.Column('response_time_ms', sa.Integer()),
            sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.func.now()),
        )
        op.create_index('ix_coach_turns_session_id', 'coach_turns', ['session_id'])


def downgrade() -> None:
    """Remove seeded pipelines and related tables."""
    conn = op.get_bind()

    # Drop tables in reverse order
    inspector = sa.inspect(conn)

    if 'coach_turns' in inspector.get_table_names():
        op.drop_table('coach_turns')

    if 'coaching_sessions' in inspector.get_table_names():
        op.drop_table('coaching_sessions')

    if 'prompt_pipelines' in inspector.get_table_names():
        # Just delete the seeded data, don't drop the table
        conn.execute(sa.text(
            "DELETE FROM prompt_pipelines WHERE name IN ('default', 'focused')"
        ))
