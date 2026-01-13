"""Rate limiting middleware and dependencies."""

import time
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Callable, Optional
from uuid import UUID

from fastapi import HTTPException, Request, status


@dataclass
class RateLimitEntry:
    """Tracks rate limit state for a key."""

    count: int = 0
    window_start: float = field(default_factory=time.time)


class RateLimiter:
    """In-memory rate limiter.

    For production, this should be replaced with Redis-based rate limiting
    for distributed deployments.
    """

    def __init__(self):
        self._limits: dict[str, RateLimitEntry] = defaultdict(RateLimitEntry)
        self._cleanup_interval = 300  # Clean up every 5 minutes
        self._last_cleanup = time.time()

    def _cleanup_old_entries(self) -> None:
        """Remove expired entries to prevent memory leaks."""
        now = time.time()
        if now - self._last_cleanup < self._cleanup_interval:
            return

        expired_keys = [
            key
            for key, entry in self._limits.items()
            if now - entry.window_start > 3600  # Remove entries older than 1 hour
        ]
        for key in expired_keys:
            del self._limits[key]

        self._last_cleanup = now

    def check_rate_limit(
        self,
        key: str,
        max_requests: int,
        window_seconds: int,
    ) -> tuple[bool, int, int]:
        """Check if a request is allowed under rate limit.

        Args:
            key: Unique identifier for rate limiting (e.g., user_id, session_id)
            max_requests: Maximum requests allowed in the window
            window_seconds: Time window in seconds

        Returns:
            Tuple of (is_allowed, remaining_requests, retry_after_seconds)
        """
        self._cleanup_old_entries()

        now = time.time()
        entry = self._limits[key]

        # Reset window if expired
        if now - entry.window_start >= window_seconds:
            entry.count = 0
            entry.window_start = now

        # Check limit
        if entry.count >= max_requests:
            retry_after = int(window_seconds - (now - entry.window_start))
            return False, 0, max(1, retry_after)

        # Increment count
        entry.count += 1
        remaining = max_requests - entry.count

        return True, remaining, 0

    def reset(self, key: str) -> None:
        """Reset rate limit for a key."""
        if key in self._limits:
            del self._limits[key]


# Global rate limiter instance
_rate_limiter = RateLimiter()


def get_rate_limiter() -> RateLimiter:
    """Get the global rate limiter instance."""
    return _rate_limiter


def create_rate_limit_dependency(
    max_requests: int = 5,
    window_seconds: int = 60,
    key_func: Optional[Callable[[Request], str]] = None,
):
    """Create a rate limit dependency for FastAPI routes.

    Args:
        max_requests: Maximum requests allowed in the window
        window_seconds: Time window in seconds
        key_func: Function to extract rate limit key from request.
                  Defaults to using client IP + path.

    Returns:
        FastAPI dependency function
    """

    async def rate_limit_dependency(request: Request) -> None:
        """Check rate limit and raise exception if exceeded."""
        limiter = get_rate_limiter()

        # Get rate limit key
        if key_func:
            key = key_func(request)
        else:
            # Default: IP + path
            client_ip = request.client.host if request.client else "unknown"
            key = f"{client_ip}:{request.url.path}"

        is_allowed, remaining, retry_after = limiter.check_rate_limit(
            key, max_requests, window_seconds
        )

        # Add rate limit headers to response
        request.state.rate_limit_remaining = remaining
        request.state.rate_limit_limit = max_requests

        if not is_allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Try again in {retry_after} seconds.",
                headers={
                    "Retry-After": str(retry_after),
                    "X-RateLimit-Limit": str(max_requests),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(int(time.time()) + retry_after),
                },
            )

    return rate_limit_dependency


def rate_limit_by_run_id(request: Request) -> str:
    """Extract rate limit key using run_id from path."""
    run_id = request.path_params.get("run_id", "unknown")
    return f"coaching:{run_id}"


def rate_limit_by_user_and_path(request: Request) -> str:
    """Extract rate limit key using user ID (from state) and path."""
    user_id = getattr(request.state, "user_id", None)
    if user_id:
        return f"user:{user_id}:{request.url.path}"
    # Fallback to IP
    client_ip = request.client.host if request.client else "unknown"
    return f"ip:{client_ip}:{request.url.path}"


# Pre-configured rate limiters
coaching_rate_limit = create_rate_limit_dependency(
    max_requests=5,
    window_seconds=60,
    key_func=rate_limit_by_run_id,
)

api_rate_limit = create_rate_limit_dependency(
    max_requests=30,
    window_seconds=60,
)

strict_rate_limit = create_rate_limit_dependency(
    max_requests=3,
    window_seconds=60,
)
