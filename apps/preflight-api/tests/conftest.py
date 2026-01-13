"""Test fixtures for preflight-api."""
import os
import uuid
from collections.abc import Generator

# Set test database URL before importing app modules
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.models.base import Base
from app.models.forms import Answer, FormDefinition, Run


@pytest.fixture(scope="function")
def db_engine():
    """Create a test database engine."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session(db_engine) -> Generator[Session, None, None]:
    """Create a test database session."""
    TestingSessionLocal = sessionmaker(bind=db_engine, autocommit=False, autoflush=False)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """Create a test client with database dependency override."""
    from app.dependencies import get_db
    from app.main import app

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_form_definition(db_session: Session) -> FormDefinition:
    """Create a sample form definition."""
    form_def = FormDefinition(
        id=uuid.uuid4(),
        name="ai-readiness-v1",
        version="1.0.0",
        definition={
            "id": "ai-readiness-v1",
            "title": "AI Readiness Assessment",
            "pages": [
                {
                    "id": "p1",
                    "title": "Background",
                    "blocks": [
                        {"type": "markdown", "content": "# Quick check-in"},
                        {
                            "type": "select",
                            "name": "role",
                            "label": "Your role",
                            "options": ["Psychologist", "GP", "Coach"],
                            "required": True,
                        },
                        {
                            "type": "radio",
                            "name": "ai_confidence",
                            "label": "Confidence (0-5)",
                            "options": [0, 1, 2, 3, 4, 5],
                            "required": True,
                        },
                    ],
                },
                {
                    "id": "p2",
                    "title": "Experience",
                    "blocks": [
                        {
                            "type": "textarea",
                            "name": "recent_problem",
                            "label": "Recent difficulty",
                        },
                    ],
                },
            ],
            "navigation": {"style": "pager", "autosave": True},
            "meta": {"version": "1.0.0"},
        },
        is_active=True,
    )
    db_session.add(form_def)
    db_session.commit()
    db_session.refresh(form_def)
    return form_def


@pytest.fixture
def sample_run(db_session: Session, sample_form_definition: FormDefinition) -> Run:
    """Create a sample run."""
    run = Run(
        id=uuid.uuid4(),
        form_definition_id=sample_form_definition.id,
        session_token="test-session-token",
        status="in_progress",
    )
    db_session.add(run)
    db_session.commit()
    db_session.refresh(run)
    return run


@pytest.fixture
def sample_answers(db_session: Session, sample_run: Run) -> list[Answer]:
    """Create sample answers."""
    answers = [
        Answer(
            id=uuid.uuid4(),
            run_id=sample_run.id,
            page_id="p1",
            field_name="role",
            value="Psychologist",
        ),
        Answer(
            id=uuid.uuid4(),
            run_id=sample_run.id,
            page_id="p1",
            field_name="ai_confidence",
            value=3,
        ),
    ]
    for answer in answers:
        db_session.add(answer)
    db_session.commit()
    return answers
