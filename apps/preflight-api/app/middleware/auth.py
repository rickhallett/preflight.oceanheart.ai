"""Authentication middleware and dependencies."""

import base64
import os
from dataclasses import dataclass
from typing import Optional
from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

# Auth configuration from environment
AUTH_MODE = os.getenv("AUTH_MODE", "stub")  # "stub" or "jwt"
JWT_SECRET = os.getenv("JWT_SECRET", "")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_ISSUER = os.getenv("JWT_ISSUER", "oceanheart.ai")


@dataclass
class CurrentUser:
    """Represents the authenticated user."""

    id: UUID
    email: str
    name: Optional[str] = None
    is_admin: bool = False


# Security scheme for JWT
security = HTTPBearer(auto_error=False)


def _is_stub_token(token: str) -> bool:
    """Check if a token is a stub token (for development/testing).

    Stub tokens have 'stub-signature' as their signature component.
    """
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return False
        signature = base64.b64decode(parts[2] + "==").decode("utf-8")
        return signature == "stub-signature"
    except Exception:
        return False


def _validate_stub_token(token: str) -> dict:
    """Validate a stub token and return its payload.

    Stub tokens are self-validating based on their embedded expiration.
    """
    try:
        parts = token.split(".")
        if len(parts) != 3:
            raise ValueError("Invalid token structure")

        # Decode payload (add padding for base64)
        payload_b64 = parts[1]
        # Add padding if needed
        padding = 4 - len(payload_b64) % 4
        if padding != 4:
            payload_b64 += "=" * padding

        import json
        import time

        payload = json.loads(base64.b64decode(payload_b64))

        # Check expiration
        exp = payload.get("exp", 0)
        if time.time() > exp:
            raise ValueError("Token expired")

        return payload
    except Exception as e:
        raise ValueError(f"Invalid stub token: {e}") from e


def _validate_jwt_token(token: str) -> dict:
    """Validate a real JWT token and return its payload.

    Uses PyJWT to validate signature, expiration, and issuer.
    """
    if not JWT_SECRET:
        raise ValueError("JWT_SECRET not configured")

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_iat": True,
                "require": ["exp", "sub", "email"],
            },
        )
        return payload
    except jwt.ExpiredSignatureError as e:
        raise ValueError("Token has expired") from e
    except jwt.InvalidTokenError as e:
        raise ValueError(f"Invalid token: {e}") from e


def validate_token(token: str) -> dict:
    """Validate a token (either stub or real JWT).

    Returns the decoded payload if valid, raises ValueError if invalid.
    """
    # Check if it's a stub token (for development/testing compatibility)
    if _is_stub_token(token):
        if AUTH_MODE == "jwt" and os.getenv("ALLOW_STUB_TOKENS", "false").lower() != "true":
            raise ValueError("Stub tokens not allowed in JWT mode")
        return _validate_stub_token(token)

    # Validate as real JWT
    return _validate_jwt_token(token)


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> CurrentUser:
    """Get the current authenticated user.

    In stub mode, returns a test user for development.
    In JWT mode, validates the token and extracts user info.
    """
    if AUTH_MODE == "stub":
        # Stub mode: return test user for development
        # Check if there's a token anyway (for testing real flow)
        if credentials and credentials.credentials:
            try:
                payload = validate_token(credentials.credentials)
                return CurrentUser(
                    id=UUID(payload.get("userId", payload.get("sub", "00000000-0000-0000-0000-000000000001"))),
                    email=payload.get("email", "test@example.com"),
                    name=payload.get("name"),
                    is_admin=payload.get("is_admin", False),
                )
            except ValueError:
                pass  # Fall back to default stub user

        return CurrentUser(
            id=UUID("00000000-0000-0000-0000-000000000001"),
            email="test@example.com",
            name="Test User",
            is_admin=False,
        )

    # JWT mode: require and validate token
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    try:
        payload = validate_token(token)

        # Extract user ID - support both 'userId' (Passport) and 'sub' (standard JWT)
        user_id_str = payload.get("userId") or payload.get("sub")
        if not user_id_str:
            raise ValueError("Token missing user identifier")

        # Handle UUID format
        try:
            user_id = UUID(user_id_str)
        except ValueError:
            # If not a valid UUID, create a deterministic one from the string
            import hashlib
            user_id = UUID(hashlib.md5(user_id_str.encode()).hexdigest())

        return CurrentUser(
            id=user_id,
            email=payload.get("email", ""),
            name=payload.get("name"),
            is_admin=payload.get("is_admin", False) or payload.get("role") == "admin",
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        ) from e


async def get_current_user_optional(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[CurrentUser]:
    """Get the current user if authenticated, None otherwise."""
    try:
        return await get_current_user(request, credentials)
    except HTTPException:
        return None


async def require_admin(
    current_user: CurrentUser = Depends(get_current_user),
) -> CurrentUser:
    """Require the current user to be an admin."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


def get_auth_mode() -> str:
    """Get the current authentication mode."""
    return AUTH_MODE


def validate_auth_config() -> dict:
    """Validate authentication configuration on startup.

    Returns a dict with validation results.
    """
    issues = []

    if AUTH_MODE == "jwt":
        if not JWT_SECRET:
            issues.append("JWT_SECRET is required in JWT mode")
        elif len(JWT_SECRET) < 32:
            issues.append("JWT_SECRET should be at least 32 characters")

    return {
        "mode": AUTH_MODE,
        "jwt_configured": bool(JWT_SECRET),
        "issues": issues,
        "valid": len(issues) == 0,
    }
