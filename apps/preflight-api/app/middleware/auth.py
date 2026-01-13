"""Authentication middleware and dependencies."""

import os
from dataclasses import dataclass
from typing import Optional
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

# Auth mode from environment
AUTH_MODE = os.getenv("AUTH_MODE", "stub")  # "stub" or "jwt"


@dataclass
class CurrentUser:
    """Represents the authenticated user."""

    id: UUID
    email: str
    name: Optional[str] = None
    is_admin: bool = False


# Security scheme for JWT
security = HTTPBearer(auto_error=False)


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
        return CurrentUser(
            id=UUID("00000000-0000-0000-0000-000000000001"),
            email="test@example.com",
            name="Test User",
            is_admin=False,
        )

    # JWT mode: validate token
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    try:
        # TODO: Implement actual JWT validation when ready
        # For now, this is a placeholder for JWT validation
        # user_data = verify_jwt_token(token)
        raise NotImplementedError("JWT validation not yet implemented")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
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
