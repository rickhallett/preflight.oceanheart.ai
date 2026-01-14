"""Input validation and sanitization utilities.

Provides common validation patterns and sanitization for user inputs.
"""

import html
import re
from typing import Any, Optional
from uuid import UUID

from pydantic import field_validator, BeforeValidator
from typing_extensions import Annotated


# Common regex patterns
EMAIL_PATTERN = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
SAFE_STRING_PATTERN = re.compile(r"^[\w\s\-.,!?'\"()]+$", re.UNICODE)


class ValidationError(Exception):
    """Custom validation error with details."""

    def __init__(self, field: str, message: str, value: Any = None):
        self.field = field
        self.message = message
        self.value = value
        super().__init__(f"{field}: {message}")


def sanitize_string(value: str, max_length: int = 10000) -> str:
    """Sanitize a string input.

    - Strips leading/trailing whitespace
    - Limits length
    - Escapes HTML entities to prevent XSS
    """
    if not isinstance(value, str):
        return str(value)

    # Strip whitespace
    value = value.strip()

    # Limit length
    if len(value) > max_length:
        value = value[:max_length]

    # Escape HTML entities
    value = html.escape(value)

    return value


def sanitize_html_content(value: str) -> str:
    """Remove potentially dangerous HTML while preserving structure.

    For fields that should contain rich text, use this instead of full escape.
    """
    # Remove script tags and their contents
    value = re.sub(r"<script[^>]*>.*?</script>", "", value, flags=re.DOTALL | re.IGNORECASE)

    # Remove event handlers
    value = re.sub(r"\s+on\w+\s*=\s*['\"][^'\"]*['\"]", "", value, flags=re.IGNORECASE)

    # Remove javascript: URLs
    value = re.sub(r"javascript:", "", value, flags=re.IGNORECASE)

    # Remove data: URLs in href/src (can be used for XSS)
    value = re.sub(r"(href|src)\s*=\s*['\"]data:", r"\1=", value, flags=re.IGNORECASE)

    return value


def validate_uuid(value: str, field_name: str = "id") -> UUID:
    """Validate and parse a UUID string."""
    try:
        return UUID(value)
    except (ValueError, TypeError) as e:
        raise ValidationError(field_name, f"Invalid UUID format: {value}") from e


def validate_email(value: str) -> str:
    """Validate email format."""
    value = value.strip().lower()
    if not EMAIL_PATTERN.match(value):
        raise ValidationError("email", "Invalid email format")
    return value


def validate_slug(value: str) -> str:
    """Validate slug format (lowercase, alphanumeric, hyphens)."""
    value = value.strip().lower()
    if not SLUG_PATTERN.match(value):
        raise ValidationError("slug", "Invalid slug format. Use lowercase letters, numbers, and hyphens.")
    return value


def validate_json_safe(value: Any, max_depth: int = 10, current_depth: int = 0) -> Any:
    """Validate that a value is safe for JSON serialization.

    Prevents deeply nested structures that could cause DoS.
    """
    if current_depth > max_depth:
        raise ValidationError("data", f"JSON structure too deeply nested (max {max_depth} levels)")

    if isinstance(value, dict):
        return {
            sanitize_string(str(k), 100): validate_json_safe(v, max_depth, current_depth + 1)
            for k, v in value.items()
        }
    elif isinstance(value, list):
        if len(value) > 1000:
            raise ValidationError("data", "Array too large (max 1000 items)")
        return [validate_json_safe(v, max_depth, current_depth + 1) for v in value]
    elif isinstance(value, str):
        return sanitize_string(value)
    elif isinstance(value, (int, float, bool, type(None))):
        return value
    else:
        # Convert other types to string
        return sanitize_string(str(value))


def validate_content_length(value: str, min_length: int = 1, max_length: int = 10000) -> str:
    """Validate content length constraints."""
    if len(value) < min_length:
        raise ValidationError("content", f"Content too short (min {min_length} characters)")
    if len(value) > max_length:
        raise ValidationError("content", f"Content too long (max {max_length} characters)")
    return value


# Pydantic validators for use in schemas
def strip_and_sanitize(v: str) -> str:
    """Pydantic validator that strips and sanitizes strings."""
    if isinstance(v, str):
        return sanitize_string(v)
    return v


# Annotated types for Pydantic models
SanitizedString = Annotated[str, BeforeValidator(strip_and_sanitize)]


def validate_form_answers(answers: dict[str, Any]) -> dict[str, Any]:
    """Validate and sanitize form answers dictionary."""
    if not isinstance(answers, dict):
        raise ValidationError("answers", "Answers must be a dictionary")

    if len(answers) > 100:
        raise ValidationError("answers", "Too many answer fields (max 100)")

    validated = {}
    for key, value in answers.items():
        # Validate key
        if not isinstance(key, str) or len(key) > 100:
            raise ValidationError("answers", f"Invalid field name: {key}")

        # Validate/sanitize value
        validated[key] = validate_json_safe(value, max_depth=5)

    return validated


def redact_pii(text: str) -> str:
    """Redact common PII patterns from text.

    Used for logging and error messages to prevent PII leakage.
    """
    # Email addresses (pattern without anchors for text replacement)
    text = re.sub(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", "[EMAIL REDACTED]", text)

    # Phone numbers (various formats)
    text = re.sub(r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b", "[PHONE REDACTED]", text)

    # SSN
    text = re.sub(r"\b\d{3}-\d{2}-\d{4}\b", "[SSN REDACTED]", text)

    # Credit card numbers (basic pattern)
    text = re.sub(r"\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b", "[CARD REDACTED]", text)

    return text
