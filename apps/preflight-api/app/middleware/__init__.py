"""Middleware components for the API."""

from .auth import (
    CurrentUser,
    get_current_user,
    get_current_user_optional,
    require_admin,
    get_auth_mode,
)
from .rate_limit import (
    RateLimiter,
    get_rate_limiter,
    create_rate_limit_dependency,
    coaching_rate_limit,
    api_rate_limit,
    strict_rate_limit,
    rate_limit_by_run_id,
    rate_limit_by_user_and_path,
)

__all__ = [
    # Auth
    "CurrentUser",
    "get_current_user",
    "get_current_user_optional",
    "require_admin",
    "get_auth_mode",
    # Rate limiting
    "RateLimiter",
    "get_rate_limiter",
    "create_rate_limit_dependency",
    "coaching_rate_limit",
    "api_rate_limit",
    "strict_rate_limit",
    "rate_limit_by_run_id",
    "rate_limit_by_user_and_path",
]
