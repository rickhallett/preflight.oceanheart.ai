"""Tests for run and answers endpoints."""
import uuid

import pytest
from fastapi.testclient import TestClient

from app.models.forms import Answer, FormDefinition, Run


class TestCreateRun:
    """Tests for POST /runs."""

    def test_create_run_success(
        self, client: TestClient, sample_form_definition: FormDefinition
    ):
        """Should create a new run for valid form."""
        response = client.post(
            "/runs",
            json={"form_name": "ai-readiness-v1"},
        )

        assert response.status_code == 201
        data = response.json()
        assert "run_id" in data
        assert data["form_version"] == "1.0.0"
        assert "started_at" in data

    def test_create_run_with_version(
        self, client: TestClient, sample_form_definition: FormDefinition
    ):
        """Should create run with specific form version."""
        response = client.post(
            "/runs",
            json={"form_name": "ai-readiness-v1", "version": "1.0.0"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["form_version"] == "1.0.0"

    def test_create_run_form_not_found(self, client: TestClient):
        """Should return 404 for non-existent form."""
        response = client.post(
            "/runs",
            json={"form_name": "non-existent-form"},
        )

        assert response.status_code == 404

    def test_create_run_generates_unique_ids(
        self, client: TestClient, sample_form_definition: FormDefinition
    ):
        """Should generate unique run IDs."""
        response1 = client.post("/runs", json={"form_name": "ai-readiness-v1"})
        response2 = client.post("/runs", json={"form_name": "ai-readiness-v1"})

        assert response1.status_code == 201
        assert response2.status_code == 201
        assert response1.json()["run_id"] != response2.json()["run_id"]


class TestGetRun:
    """Tests for GET /runs/{run_id}."""

    def test_get_run_success(self, client: TestClient, sample_run: Run):
        """Should return run details."""
        response = client.get(f"/runs/{sample_run.id}")

        assert response.status_code == 200
        data = response.json()
        assert data["run_id"] == str(sample_run.id)
        assert data["status"] == "in_progress"
        assert "started_at" in data

    def test_get_run_with_answers(
        self, client: TestClient, sample_run: Run, sample_answers: list[Answer]
    ):
        """Should return run with answers."""
        response = client.get(f"/runs/{sample_run.id}")

        assert response.status_code == 200
        data = response.json()
        assert len(data["answers"]) == 2
        assert data["last_page"] == "p1"

    def test_get_run_not_found(self, client: TestClient):
        """Should return 404 for non-existent run."""
        fake_id = uuid.uuid4()
        response = client.get(f"/runs/{fake_id}")

        assert response.status_code == 404


class TestSaveAnswers:
    """Tests for PATCH /runs/{run_id}/answers."""

    def test_save_answers_success(self, client: TestClient, sample_run: Run):
        """Should save answers for a page."""
        response = client.patch(
            f"/runs/{sample_run.id}/answers",
            json={
                "page_id": "p1",
                "answers": {"role": "Psychologist", "ai_confidence": 4},
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert "saved_at" in data

    def test_save_answers_idempotent(self, client: TestClient, sample_run: Run):
        """Should update existing answers (idempotent)."""
        response1 = client.patch(
            f"/runs/{sample_run.id}/answers",
            json={"page_id": "p1", "answers": {"role": "Psychologist"}},
        )
        response2 = client.patch(
            f"/runs/{sample_run.id}/answers",
            json={"page_id": "p1", "answers": {"role": "GP"}},
        )

        assert response1.status_code == 200
        assert response2.status_code == 200

        get_response = client.get(f"/runs/{sample_run.id}")
        answers = get_response.json()["answers"]
        role_answers = [a for a in answers if a["field_name"] == "role"]
        assert len(role_answers) == 1
        assert role_answers[0]["value"] == "GP"

    def test_save_answers_run_not_found(self, client: TestClient):
        """Should return 404 for non-existent run."""
        fake_id = uuid.uuid4()
        response = client.patch(
            f"/runs/{fake_id}/answers",
            json={"page_id": "p1", "answers": {"role": "GP"}},
        )

        assert response.status_code == 404

    def test_save_answers_multiple_fields(self, client: TestClient, sample_run: Run):
        """Should save multiple fields at once."""
        response = client.patch(
            f"/runs/{sample_run.id}/answers",
            json={
                "page_id": "p1",
                "answers": {
                    "role": "Coach",
                    "ai_confidence": 5,
                },
            },
        )

        assert response.status_code == 200

        get_response = client.get(f"/runs/{sample_run.id}")
        answers = get_response.json()["answers"]
        assert len(answers) == 2


class TestCompleteRun:
    """Tests for POST /runs/{run_id}/complete."""

    def test_complete_run_success(self, client: TestClient, sample_run: Run):
        """Should mark run as completed."""
        response = client.post(f"/runs/{sample_run.id}/complete")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "completed"
        assert "completed_at" in data

    def test_complete_run_not_found(self, client: TestClient):
        """Should return 404 for non-existent run."""
        fake_id = uuid.uuid4()
        response = client.post(f"/runs/{fake_id}/complete")

        assert response.status_code == 404

    def test_complete_run_already_completed(self, client: TestClient, sample_run: Run):
        """Should return 422 for already completed run."""
        client.post(f"/runs/{sample_run.id}/complete")

        response = client.post(f"/runs/{sample_run.id}/complete")

        assert response.status_code == 422

    def test_cannot_save_to_completed_run(self, client: TestClient, sample_run: Run):
        """Should not allow saving answers to completed run."""
        client.post(f"/runs/{sample_run.id}/complete")

        response = client.patch(
            f"/runs/{sample_run.id}/answers",
            json={"page_id": "p1", "answers": {"role": "GP"}},
        )

        assert response.status_code == 422


class TestRunLifecycle:
    """Integration tests for full run lifecycle."""

    def test_full_run_lifecycle(
        self, client: TestClient, sample_form_definition: FormDefinition
    ):
        """Should handle complete survey flow."""
        create_response = client.post(
            "/runs",
            json={"form_name": "ai-readiness-v1"},
        )
        assert create_response.status_code == 201
        run_id = create_response.json()["run_id"]

        save1_response = client.patch(
            f"/runs/{run_id}/answers",
            json={
                "page_id": "p1",
                "answers": {"role": "Psychologist", "ai_confidence": 3},
            },
        )
        assert save1_response.status_code == 200

        save2_response = client.patch(
            f"/runs/{run_id}/answers",
            json={
                "page_id": "p2",
                "answers": {"recent_problem": "Client engagement"},
            },
        )
        assert save2_response.status_code == 200

        get_response = client.get(f"/runs/{run_id}")
        assert get_response.status_code == 200
        assert get_response.json()["status"] == "in_progress"
        assert len(get_response.json()["answers"]) == 3

        complete_response = client.post(f"/runs/{run_id}/complete")
        assert complete_response.status_code == 200
        assert complete_response.json()["status"] == "completed"

        final_get = client.get(f"/runs/{run_id}")
        assert final_get.json()["status"] == "completed"
