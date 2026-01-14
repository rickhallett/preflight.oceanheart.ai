"""Application configuration and validation.

Validates all required configuration on startup to fail fast
if critical settings are missing.
"""

import os
import logging
from dataclasses import dataclass
from typing import Optional

logger = logging.getLogger(__name__)


@dataclass
class ConfigValidationResult:
    """Result of configuration validation."""
    valid: bool
    errors: list[str]
    warnings: list[str]


def validate_config() -> ConfigValidationResult:
    """Validate all application configuration.

    Returns:
        ConfigValidationResult with validation status and any issues
    """
    errors = []
    warnings = []

    # Database configuration
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        errors.append("DATABASE_URL is required")
    elif "password" in db_url and ("dev_password" in db_url or "test" in db_url.lower()):
        warnings.append("DATABASE_URL appears to contain a development password")

    # Authentication configuration
    auth_mode = os.getenv("AUTH_MODE", "stub")
    jwt_secret = os.getenv("JWT_SECRET", "")

    if auth_mode == "jwt":
        if not jwt_secret:
            errors.append("JWT_SECRET is required when AUTH_MODE=jwt")
        elif len(jwt_secret) < 32:
            errors.append("JWT_SECRET must be at least 32 characters")
        elif jwt_secret.startswith("your-") or "example" in jwt_secret.lower():
            errors.append("JWT_SECRET appears to be a placeholder value")
    elif auth_mode == "stub":
        warnings.append("AUTH_MODE=stub is for development only")

    # CORS configuration
    cors_origins = os.getenv("CORS_ORIGINS", "")
    if not cors_origins:
        warnings.append("CORS_ORIGINS not set, using defaults")
    elif "*" in cors_origins:
        warnings.append("CORS_ORIGINS contains wildcard - not recommended for production")

    # LLM configuration (only warn, not error - LLM is optional)
    llm_provider = os.getenv("LLM_PROVIDER", "openai")
    if llm_provider == "openai":
        if not os.getenv("OPENAI_API_KEY"):
            warnings.append("OPENAI_API_KEY not set - LLM features will be unavailable")
    elif llm_provider == "anthropic":
        if not os.getenv("ANTHROPIC_API_KEY"):
            warnings.append("ANTHROPIC_API_KEY not set - LLM features will be unavailable")

    # Redis (required for production rate limiting)
    if os.getenv("NODE_ENV") == "production" or auth_mode == "jwt":
        redis_url = os.getenv("REDIS_URL")
        if not redis_url:
            warnings.append("REDIS_URL not set - rate limiting will use in-memory store")

    return ConfigValidationResult(
        valid=len(errors) == 0,
        errors=errors,
        warnings=warnings,
    )


def log_config_validation(result: ConfigValidationResult) -> None:
    """Log configuration validation results."""
    if result.errors:
        for error in result.errors:
            logger.error(f"Configuration error: {error}")

    if result.warnings:
        for warning in result.warnings:
            logger.warning(f"Configuration warning: {warning}")

    if result.valid:
        if result.warnings:
            logger.info("Configuration valid with warnings")
        else:
            logger.info("Configuration valid")
    else:
        logger.error("Configuration validation failed")


def get_auth_mode() -> str:
    """Get the current authentication mode."""
    return os.getenv("AUTH_MODE", "stub")


def is_production() -> bool:
    """Check if running in production mode."""
    return os.getenv("NODE_ENV") == "production" or get_auth_mode() == "jwt"


def require_config(name: str, default: Optional[str] = None) -> str:
    """Get a required configuration value.

    Args:
        name: Environment variable name
        default: Optional default value

    Returns:
        The configuration value

    Raises:
        ValueError: If the value is not set and no default provided
    """
    value = os.getenv(name, default)
    if value is None:
        raise ValueError(f"Required configuration {name} is not set")
    return value
