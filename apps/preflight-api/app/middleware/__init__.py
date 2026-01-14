"""Middleware components for the API."""

from .auth import (
    CurrentUser,
    get_current_user,
    get_current_user_optional,
    require_admin,
    get_auth_mode,
    validate_auth_config,
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
from .errors import (
    register_exception_handlers,
    APIError,
    NotFoundError,
    ConflictError,
    ValidationError,
    RateLimitError,
)
from .logging import (
    setup_request_logging,
    get_request_id,
)

__all__ = [
    # Auth
    "CurrentUser",
    "get_current_user",
    "get_current_user_optional",
    "require_admin",
    "get_auth_mode",
    "validate_auth_config",
    # Rate limiting
    "RateLimiter",
    "get_rate_limiter",
    "create_rate_limit_dependency",
    "coaching_rate_limit",
    "api_rate_limit",
    "strict_rate_limit",
    "rate_limit_by_run_id",
    "rate_limit_by_user_and_path",
    # Errors
    "register_exception_handlers",
    "APIError",
    "NotFoundError",
    "ConflictError",
    "ValidationError",
    "RateLimitError",
    # Logging
    "setup_request_logging",
    "get_request_id",
]
