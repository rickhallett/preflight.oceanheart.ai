"""Unit tests for authentication middleware."""
import base64
import json
import os
import time
from unittest.mock import patch
from uuid import UUID

import pytest

# Set test environment before imports
os.environ["AUTH_MODE"] = "stub"
os.environ["JWT_SECRET"] = "test-secret-key-at-least-32-characters-long"

from app.middleware.auth import (
    _is_stub_token,
    _validate_stub_token,
    _validate_jwt_token,
    validate_token,
    validate_auth_config,
    CurrentUser,
)


def create_stub_token(payload: dict) -> str:
    """Create a stub token for testing."""
    header = base64.b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode()).decode()
    payload_b64 = base64.b64encode(json.dumps(payload).encode()).decode()
    signature = base64.b64encode(b"stub-signature").decode()
    return f"{header}.{payload_b64}.{signature}"


def create_real_jwt(payload: dict, secret: str = "test-secret-key-at-least-32-characters-long") -> str:
    """Create a real JWT token for testing."""
    import jwt
    return jwt.encode(payload, secret, algorithm="HS256")


class TestIsStubToken:
    """Tests for _is_stub_token function."""

    def test_identifies_stub_token(self):
        """Should identify a stub token by its signature."""
        token = create_stub_token({"userId": "test", "exp": time.time() + 3600})
        assert _is_stub_token(token) is True

    def test_rejects_real_jwt(self):
        """Should not identify real JWT as stub token."""
        token = create_real_jwt({"sub": "test", "exp": time.time() + 3600, "email": "test@test.com"})
        assert _is_stub_token(token) is False

    def test_handles_invalid_token(self):
        """Should return False for invalid token structure."""
        assert _is_stub_token("not-a-token") is False
        assert _is_stub_token("only.two.parts.here.extra") is False
        assert _is_stub_token("") is False


class TestValidateStubToken:
    """Tests for _validate_stub_token function."""

    def test_validates_valid_stub_token(self):
        """Should validate and return payload for valid stub token."""
        payload = {"userId": "test-123", "email": "test@example.com", "exp": int(time.time()) + 3600}
        token = create_stub_token(payload)

        result = _validate_stub_token(token)

        assert result["userId"] == "test-123"
        assert result["email"] == "test@example.com"

    def test_rejects_expired_stub_token(self):
        """Should reject expired stub token."""
        payload = {"userId": "test", "exp": int(time.time()) - 100}  # Expired
        token = create_stub_token(payload)

        with pytest.raises(ValueError, match="expired"):
            _validate_stub_token(token)

    def test_rejects_invalid_structure(self):
        """Should reject token with invalid structure."""
        with pytest.raises(ValueError):
            _validate_stub_token("invalid.token")


class TestValidateJwtToken:
    """Tests for _validate_jwt_token function."""

    def test_validates_valid_jwt(self):
        """Should validate a properly signed JWT."""
        payload = {
            "sub": "user-123",
            "email": "user@example.com",
            "exp": int(time.time()) + 3600,
            "iat": int(time.time()),
        }
        token = create_real_jwt(payload)

        result = _validate_jwt_token(token)

        assert result["sub"] == "user-123"
        assert result["email"] == "user@example.com"

    def test_rejects_expired_jwt(self):
        """Should reject expired JWT."""
        payload = {
            "sub": "user-123",
            "email": "user@example.com",
            "exp": int(time.time()) - 100,
            "iat": int(time.time()) - 200,
        }
        token = create_real_jwt(payload)

        with pytest.raises(ValueError, match="expired"):
            _validate_jwt_token(token)

    def test_rejects_invalid_signature(self):
        """Should reject JWT with wrong signature."""
        payload = {
            "sub": "user-123",
            "email": "user@example.com",
            "exp": int(time.time()) + 3600,
            "iat": int(time.time()),
        }
        token = create_real_jwt(payload, secret="wrong-secret-key-here-32-chars!!")

        with pytest.raises(ValueError, match="Invalid token"):
            _validate_jwt_token(token)

    def test_rejects_missing_required_claims(self):
        """Should reject JWT missing required claims."""
        # Missing email
        payload = {
            "sub": "user-123",
            "exp": int(time.time()) + 3600,
            "iat": int(time.time()),
        }
        token = create_real_jwt(payload)

        with pytest.raises(ValueError):
            _validate_jwt_token(token)


class TestValidateToken:
    """Tests for validate_token function."""

    def test_validates_stub_token_in_stub_mode(self):
        """Should validate stub tokens in stub mode."""
        with patch.dict(os.environ, {"AUTH_MODE": "stub"}):
            payload = {"userId": "test", "email": "test@test.com", "exp": int(time.time()) + 3600}
            token = create_stub_token(payload)

            result = validate_token(token)
            assert result["userId"] == "test"

    def test_validates_real_jwt(self):
        """Should validate real JWT tokens."""
        payload = {
            "sub": "user-123",
            "email": "user@example.com",
            "exp": int(time.time()) + 3600,
            "iat": int(time.time()),
        }
        token = create_real_jwt(payload)

        result = validate_token(token)
        assert result["sub"] == "user-123"


class TestValidateAuthConfig:
    """Tests for validate_auth_config function."""

    def test_stub_mode_valid(self):
        """Stub mode should be valid with warning."""
        # Import fresh to pick up env changes
        import importlib
        import app.middleware.auth as auth_module

        with patch.object(auth_module, "AUTH_MODE", "stub"):
            result = validate_auth_config()
            assert result["valid"] is True

    def test_jwt_mode_requires_secret(self):
        """JWT mode should require JWT_SECRET."""
        import app.middleware.auth as auth_module

        with patch.object(auth_module, "AUTH_MODE", "jwt"), \
             patch.object(auth_module, "JWT_SECRET", ""):
            result = validate_auth_config()
            assert result["valid"] is False
            assert any("JWT_SECRET" in issue for issue in result["issues"])

    def test_jwt_mode_requires_long_secret(self):
        """JWT_SECRET should be at least 32 characters."""
        import app.middleware.auth as auth_module

        with patch.object(auth_module, "AUTH_MODE", "jwt"), \
             patch.object(auth_module, "JWT_SECRET", "short"):
            result = validate_auth_config()
            assert result["valid"] is False
            assert any("32 characters" in issue for issue in result["issues"])


class TestCurrentUser:
    """Tests for CurrentUser dataclass."""

    def test_creates_user_with_defaults(self):
        """Should create user with default values."""
        user = CurrentUser(
            id=UUID("00000000-0000-0000-0000-000000000001"),
            email="test@example.com",
        )

        assert user.email == "test@example.com"
        assert user.name is None
        assert user.is_admin is False

    def test_creates_admin_user(self):
        """Should create admin user."""
        user = CurrentUser(
            id=UUID("00000000-0000-0000-0000-000000000001"),
            email="admin@example.com",
            name="Admin",
            is_admin=True,
        )

        assert user.is_admin is True
        assert user.name == "Admin"
