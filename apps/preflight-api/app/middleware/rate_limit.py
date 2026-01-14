"""Rate limiting middleware and dependencies.

Supports both in-memory (development) and Redis-backed (production) rate limiting.
"""

import logging
import os
import time
from abc import ABC, abstractmethod
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Callable, Optional

from fastapi import HTTPException, Request, status

logger = logging.getLogger(__name__)


@dataclass
class RateLimitEntry:
    """Tracks rate limit state for a key."""

    count: int = 0
    window_start: float = field(default_factory=time.time)


class RateLimiterBackend(ABC):
    """Abstract base class for rate limiter backends."""

    @abstractmethod
    async def check_rate_limit(
        self,
        key: str,
        max_requests: int,
        window_seconds: int,
    ) -> tuple[bool, int, int]:
        """Check if a request is allowed under rate limit."""
        pass

    @abstractmethod
    async def reset(self, key: str) -> None:
        """Reset rate limit for a key."""
        pass


class InMemoryRateLimiter(RateLimiterBackend):
    """In-memory rate limiter for development/testing."""

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

    async def check_rate_limit(
        self,
        key: str,
        max_requests: int,
        window_seconds: int,
    ) -> tuple[bool, int, int]:
        """Check if a request is allowed under rate limit."""
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

    async def reset(self, key: str) -> None:
        """Reset rate limit for a key."""
        if key in self._limits:
            del self._limits[key]


class RedisRateLimiter(RateLimiterBackend):
    """Redis-backed rate limiter for production deployments.

    Uses sliding window algorithm with Redis MULTI/EXEC for atomicity.
    """

    def __init__(self, redis_url: str):
        self._redis_url = redis_url
        self._redis = None
        self._connection_attempted = False

    async def _get_redis(self):
        """Get or create Redis connection."""
        if self._redis is None and not self._connection_attempted:
            self._connection_attempted = True
            try:
                import redis.asyncio as redis
                self._redis = redis.from_url(
                    self._redis_url,
                    encoding="utf-8",
                    decode_responses=True,
                )
                # Test connection
                await self._redis.ping()
                logger.info("Connected to Redis for rate limiting")
            except Exception as e:
                logger.warning(f"Failed to connect to Redis: {e}. Falling back to in-memory.")
                self._redis = None
        return self._redis

    async def check_rate_limit(
        self,
        key: str,
        max_requests: int,
        window_seconds: int,
    ) -> tuple[bool, int, int]:
        """Check rate limit using Redis sliding window."""
        redis = await self._get_redis()
        if redis is None:
            # Fallback to allowing request if Redis unavailable
            return True, max_requests - 1, 0

        try:
            now = time.time()
            window_start = now - window_seconds
            redis_key = f"ratelimit:{key}"

            # Use pipeline for atomicity
            pipe = redis.pipeline()

            # Remove old entries outside the window
            pipe.zremrangebyscore(redis_key, 0, window_start)

            # Count current entries in window
            pipe.zcard(redis_key)

            # Add current request
            pipe.zadd(redis_key, {str(now): now})

            # Set expiry on the key
            pipe.expire(redis_key, window_seconds + 1)

            results = await pipe.execute()
            current_count = results[1]  # zcard result

            if current_count >= max_requests:
                # Get the oldest entry to calculate retry time
                oldest = await redis.zrange(redis_key, 0, 0, withscores=True)
                if oldest:
                    oldest_time = oldest[0][1]
                    retry_after = int(window_seconds - (now - oldest_time))
                    return False, 0, max(1, retry_after)
                return False, 0, window_seconds

            remaining = max_requests - current_count - 1
            return True, max(0, remaining), 0

        except Exception as e:
            logger.error(f"Redis rate limit error: {e}")
            # On error, allow request but log the issue
            return True, max_requests - 1, 0

    async def reset(self, key: str) -> None:
        """Reset rate limit for a key."""
        redis = await self._get_redis()
        if redis:
            try:
                await redis.delete(f"ratelimit:{key}")
            except Exception as e:
                logger.error(f"Failed to reset rate limit: {e}")


class RateLimiter:
    """Rate limiter facade that uses appropriate backend based on configuration."""

    def __init__(self):
        self._backend: Optional[RateLimiterBackend] = None

    def _get_backend(self) -> RateLimiterBackend:
        """Get or create the rate limiter backend."""
        if self._backend is None:
            redis_url = os.getenv("REDIS_URL")
            if redis_url:
                self._backend = RedisRateLimiter(redis_url)
                logger.info("Using Redis rate limiter")
            else:
                self._backend = InMemoryRateLimiter()
                logger.info("Using in-memory rate limiter")
        return self._backend

    async def check_rate_limit(
        self,
        key: str,
        max_requests: int,
        window_seconds: int,
    ) -> tuple[bool, int, int]:
        """Check if a request is allowed under rate limit."""
        backend = self._get_backend()
        return await backend.check_rate_limit(key, max_requests, window_seconds)

    def check_rate_limit_sync(
        self,
        key: str,
        max_requests: int,
        window_seconds: int,
    ) -> tuple[bool, int, int]:
        """Synchronous rate limit check (for backwards compatibility)."""
        backend = self._get_backend()
        if isinstance(backend, InMemoryRateLimiter):
            import asyncio
            return asyncio.get_event_loop().run_until_complete(
                backend.check_rate_limit(key, max_requests, window_seconds)
            )
        # For Redis, allow by default in sync context
        return True, max_requests - 1, 0

    async def reset(self, key: str) -> None:
        """Reset rate limit for a key."""
        backend = self._get_backend()
        await backend.reset(key)


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

        is_allowed, remaining, retry_after = await limiter.check_rate_limit(
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
