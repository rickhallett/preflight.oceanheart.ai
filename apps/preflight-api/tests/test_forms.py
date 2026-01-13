"""Tests for form definition endpoints."""
import pytest
from fastapi.testclient import TestClient

from app.models.forms import FormDefinition


class TestGetFormDefinition:
    """Tests for GET /forms/{form_name}."""

    def test_get_form_definition_success(
        self, client: TestClient, sample_form_definition: FormDefinition
    ):
        """Should return form definition for valid form name."""
        response = client.get("/forms/ai-readiness-v1")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "ai-readiness-v1"
        assert data["title"] == "AI Readiness Assessment"
        assert len(data["pages"]) == 2
        assert data["pages"][0]["id"] == "p1"
        assert data["navigation"]["style"] == "pager"
        assert data["navigation"]["autosave"] is True
        assert data["meta"]["version"] == "1.0.0"

    def test_get_form_definition_with_version(
        self, client: TestClient, sample_form_definition: FormDefinition
    ):
        """Should return form definition for specific version."""
        response = client.get("/forms/ai-readiness-v1?version=1.0.0")

        assert response.status_code == 200
        data = response.json()
        assert data["meta"]["version"] == "1.0.0"

    def test_get_form_definition_not_found(self, client: TestClient):
        """Should return 404 for non-existent form."""
        response = client.get("/forms/non-existent-form")

        assert response.status_code == 404
        data = response.json()
        assert "detail" in data

    def test_get_form_definition_wrong_version(
        self, client: TestClient, sample_form_definition: FormDefinition
    ):
        """Should return 404 for non-existent version."""
        response = client.get("/forms/ai-readiness-v1?version=99.99.99")

        assert response.status_code == 404

    def test_form_definition_contains_all_pages(
        self, client: TestClient, sample_form_definition: FormDefinition
    ):
        """Should return all pages in the form definition."""
        response = client.get("/forms/ai-readiness-v1")

        assert response.status_code == 200
        data = response.json()
        page_ids = [p["id"] for p in data["pages"]]
        assert "p1" in page_ids
        assert "p2" in page_ids

    def test_form_definition_blocks_structure(
        self, client: TestClient, sample_form_definition: FormDefinition
    ):
        """Should return properly structured blocks."""
        response = client.get("/forms/ai-readiness-v1")

        assert response.status_code == 200
        data = response.json()
        page1 = data["pages"][0]
        assert len(page1["blocks"]) == 3
        assert page1["blocks"][0]["type"] == "markdown"
        assert page1["blocks"][1]["type"] == "select"
        assert page1["blocks"][1]["required"] is True
