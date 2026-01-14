"""Request/response logging middleware.

Provides structured logging for all API requests with timing, status codes,
and optional request ID tracking.
"""

import logging
import time
import uuid
from typing import Callable

from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from ..utils.validation import redact_pii

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging all HTTP requests and responses."""

    def __init__(
        self,
        app: ASGIApp,
        exclude_paths: list[str] | None = None,
        log_request_body: bool = False,
        log_response_body: bool = False,
    ):
        super().__init__(app)
        self.exclude_paths = exclude_paths or ["/health", "/health/live", "/health/ready"]
        self.log_request_body = log_request_body
        self.log_response_body = log_response_body

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request and log details."""
        # Skip logging for excluded paths
        if request.url.path in self.exclude_paths:
            return await call_next(request)

        # Generate request ID for tracing
        request_id = str(uuid.uuid4())[:8]
        request.state.request_id = request_id

        # Extract client info
        client_ip = self._get_client_ip(request)
        user_agent = request.headers.get("user-agent", "")[:100]

        # Start timing
        start_time = time.time()

        # Log request
        logger.info(
            f"[{request_id}] --> {request.method} {request.url.path} "
            f"| client={client_ip}"
        )

        # Process request
        try:
            response = await call_next(request)
        except Exception as e:
            # Log error and re-raise
            duration_ms = (time.time() - start_time) * 1000
            logger.error(
                f"[{request_id}] <-- {request.method} {request.url.path} "
                f"| 500 ERROR | {duration_ms:.2f}ms | {redact_pii(str(e))}"
            )
            raise

        # Calculate duration
        duration_ms = (time.time() - start_time) * 1000

        # Add request ID to response headers
        response.headers["X-Request-ID"] = request_id

        # Log response
        log_level = self._get_log_level(response.status_code)
        logger.log(
            log_level,
            f"[{request_id}] <-- {request.method} {request.url.path} "
            f"| {response.status_code} | {duration_ms:.2f}ms"
        )

        # Log slow requests as warnings
        if duration_ms > 1000:
            logger.warning(
                f"[{request_id}] SLOW REQUEST: {request.method} {request.url.path} "
                f"took {duration_ms:.2f}ms"
            )

        return response

    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP, handling proxies."""
        # Check for forwarded IP (when behind proxy/load balancer)
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            # Take first IP in chain
            return forwarded.split(",")[0].strip()

        # Check for real IP header
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip

        # Fallback to direct client
        if request.client:
            return request.client.host

        return "unknown"

    def _get_log_level(self, status_code: int) -> int:
        """Determine log level based on status code."""
        if status_code >= 500:
            return logging.ERROR
        elif status_code >= 400:
            return logging.WARNING
        return logging.INFO


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Simple middleware that just adds request ID to all requests."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id = request.headers.get("x-request-id") or str(uuid.uuid4())[:8]
        request.state.request_id = request_id

        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id

        return response


def setup_request_logging(
    app: FastAPI,
    exclude_paths: list[str] | None = None,
) -> None:
    """Configure request logging for the FastAPI app.

    Args:
        app: FastAPI application instance
        exclude_paths: Paths to exclude from logging (e.g., health checks)
    """
    app.add_middleware(
        RequestLoggingMiddleware,
        exclude_paths=exclude_paths or ["/health", "/health/live", "/health/ready"],
    )


def get_request_id(request: Request) -> str:
    """Get the request ID from current request state."""
    return getattr(request.state, "request_id", "unknown")
