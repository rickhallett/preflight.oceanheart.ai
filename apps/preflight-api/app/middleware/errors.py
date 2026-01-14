"""Error handling middleware and exception handlers.

Implements RFC 7807 Problem Details for consistent error responses.
"""

import logging
import traceback
from typing import Any, Optional

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from ..utils.validation import redact_pii

logger = logging.getLogger(__name__)


class ProblemDetail(BaseModel):
    """RFC 7807 Problem Details response model."""

    type: str = "about:blank"
    title: str
    status: int
    detail: Optional[str] = None
    instance: Optional[str] = None
    errors: Optional[list[dict[str, Any]]] = None


def create_problem_response(
    status_code: int,
    title: str,
    detail: Optional[str] = None,
    instance: Optional[str] = None,
    error_type: str = "about:blank",
    errors: Optional[list[dict[str, Any]]] = None,
) -> JSONResponse:
    """Create a RFC 7807 compliant error response."""
    content = ProblemDetail(
        type=error_type,
        title=title,
        status=status_code,
        detail=detail,
        instance=instance,
        errors=errors,
    ).model_dump(exclude_none=True)

    return JSONResponse(
        status_code=status_code,
        content=content,
        media_type="application/problem+json",
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle FastAPI HTTPExceptions with RFC 7807 format."""
    return create_problem_response(
        status_code=exc.status_code,
        title=_status_to_title(exc.status_code),
        detail=str(exc.detail) if exc.detail else None,
        instance=str(request.url.path),
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Handle Pydantic validation errors with detailed field information."""
    errors = []
    for error in exc.errors():
        field_path = " -> ".join(str(loc) for loc in error["loc"])
        errors.append({
            "field": field_path,
            "message": error["msg"],
            "type": error["type"],
        })

    return create_problem_response(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        title="Validation Error",
        detail="Request validation failed",
        instance=str(request.url.path),
        error_type="validation-error",
        errors=errors,
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle unexpected exceptions with safe error messages."""
    # Log the full error with traceback (redact PII)
    error_message = redact_pii(str(exc))
    tb = redact_pii(traceback.format_exc())

    logger.error(
        f"Unhandled exception on {request.method} {request.url.path}: "
        f"{error_message}\n{tb}"
    )

    # Return safe response without internal details
    return create_problem_response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        title="Internal Server Error",
        detail="An unexpected error occurred. Please try again later.",
        instance=str(request.url.path),
    )


def _status_to_title(status_code: int) -> str:
    """Convert HTTP status code to human-readable title."""
    titles = {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        405: "Method Not Allowed",
        409: "Conflict",
        422: "Unprocessable Entity",
        429: "Too Many Requests",
        500: "Internal Server Error",
        502: "Bad Gateway",
        503: "Service Unavailable",
        504: "Gateway Timeout",
    }
    return titles.get(status_code, "Error")


def register_exception_handlers(app: FastAPI) -> None:
    """Register all exception handlers on the FastAPI app."""
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, generic_exception_handler)


class APIError(HTTPException):
    """Custom API error with RFC 7807 support."""

    def __init__(
        self,
        status_code: int,
        detail: str,
        error_type: str = "about:blank",
        headers: Optional[dict[str, str]] = None,
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)
        self.error_type = error_type


class NotFoundError(APIError):
    """Resource not found error."""

    def __init__(self, resource: str, identifier: Any):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource} with identifier '{identifier}' not found",
            error_type="resource-not-found",
        )


class ConflictError(APIError):
    """Resource conflict error."""

    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
            error_type="resource-conflict",
        )


class ValidationError(APIError):
    """Validation error for business logic validation."""

    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail,
            error_type="validation-error",
        )


class RateLimitError(APIError):
    """Rate limit exceeded error."""

    def __init__(self, retry_after: int):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Try again in {retry_after} seconds.",
            error_type="rate-limit-exceeded",
            headers={"Retry-After": str(retry_after)},
        )
