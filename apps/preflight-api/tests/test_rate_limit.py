"""Unit tests for rate limiting middleware."""
import asyncio
import os
import time
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# Clear Redis URL to use in-memory limiter
os.environ.pop("REDIS_URL", None)

from app.middleware.rate_limit import (
    InMemoryRateLimiter,
    RateLimiter,
    create_rate_limit_dependency,
)


class TestInMemoryRateLimiter:
    """Tests for InMemoryRateLimiter."""

    @pytest.fixture
    def limiter(self):
        """Create a fresh limiter for each test."""
        return InMemoryRateLimiter()

    @pytest.mark.asyncio
    async def test_allows_requests_under_limit(self, limiter):
        """Should allow requests under the limit."""
        for i in range(5):
            is_allowed, remaining, retry = await limiter.check_rate_limit(
                "test-key", max_requests=5, window_seconds=60
            )
            assert is_allowed is True
            assert remaining == 5 - i - 1

    @pytest.mark.asyncio
    async def test_blocks_requests_over_limit(self, limiter):
        """Should block requests over the limit."""
        # Use up the limit
        for _ in range(5):
            await limiter.check_rate_limit("test-key", max_requests=5, window_seconds=60)

        # Next request should be blocked
        is_allowed, remaining, retry = await limiter.check_rate_limit(
            "test-key", max_requests=5, window_seconds=60
        )
        assert is_allowed is False
        assert remaining == 0
        assert retry > 0

    @pytest.mark.asyncio
    async def test_separate_keys_have_separate_limits(self, limiter):
        """Different keys should have independent limits."""
        # Use up limit for key1
        for _ in range(5):
            await limiter.check_rate_limit("key1", max_requests=5, window_seconds=60)

        # key1 should be blocked
        is_allowed, _, _ = await limiter.check_rate_limit("key1", max_requests=5, window_seconds=60)
        assert is_allowed is False

        # key2 should still be allowed
        is_allowed, _, _ = await limiter.check_rate_limit("key2", max_requests=5, window_seconds=60)
        assert is_allowed is True

    @pytest.mark.asyncio
    async def test_window_resets_after_expiry(self, limiter):
        """Window should reset after the time period."""
        # Use up limit with short window
        for _ in range(3):
            await limiter.check_rate_limit("test-key", max_requests=3, window_seconds=1)

        # Should be blocked
        is_allowed, _, _ = await limiter.check_rate_limit("test-key", max_requests=3, window_seconds=1)
        assert is_allowed is False

        # Wait for window to expire
        await asyncio.sleep(1.1)

        # Should be allowed again
        is_allowed, remaining, _ = await limiter.check_rate_limit("test-key", max_requests=3, window_seconds=1)
        assert is_allowed is True
        assert remaining == 2

    @pytest.mark.asyncio
    async def test_reset_clears_limit(self, limiter):
        """Reset should clear the limit for a key."""
        # Use some of the limit
        for _ in range(3):
            await limiter.check_rate_limit("test-key", max_requests=5, window_seconds=60)

        # Reset
        await limiter.reset("test-key")

        # Should have full limit again
        is_allowed, remaining, _ = await limiter.check_rate_limit(
            "test-key", max_requests=5, window_seconds=60
        )
        assert is_allowed is True
        assert remaining == 4


class TestRateLimiter:
    """Tests for RateLimiter facade."""

    @pytest.fixture
    def limiter(self):
        """Create a fresh limiter without Redis."""
        with patch.dict(os.environ, {}, clear=True):
            os.environ.pop("REDIS_URL", None)
            rl = RateLimiter()
            rl._backend = None  # Reset backend
            return rl

    @pytest.mark.asyncio
    async def test_uses_in_memory_by_default(self, limiter):
        """Should use in-memory backend when Redis not configured."""
        is_allowed, _, _ = await limiter.check_rate_limit("test", 5, 60)
        assert is_allowed is True
        assert isinstance(limiter._backend, InMemoryRateLimiter)

    @pytest.mark.asyncio
    async def test_rate_limiting_works(self, limiter):
        """Basic rate limiting should work."""
        # Use up limit
        for _ in range(3):
            await limiter.check_rate_limit("key", max_requests=3, window_seconds=60)

        # Should be blocked
        is_allowed, _, _ = await limiter.check_rate_limit("key", max_requests=3, window_seconds=60)
        assert is_allowed is False


class TestCreateRateLimitDependency:
    """Tests for create_rate_limit_dependency function."""

    @pytest.mark.asyncio
    async def test_creates_working_dependency(self):
        """Should create a FastAPI dependency that rate limits."""
        from fastapi import HTTPException

        dependency = create_rate_limit_dependency(max_requests=2, window_seconds=60)

        # Create mock request
        mock_request = MagicMock()
        mock_request.client.host = "127.0.0.1"
        mock_request.url.path = "/test"
        mock_request.state = MagicMock()

        # First two requests should pass
        await dependency(mock_request)
        await dependency(mock_request)

        # Third request should raise
        with pytest.raises(HTTPException) as exc_info:
            await dependency(mock_request)

        assert exc_info.value.status_code == 429
        assert "Rate limit" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_uses_custom_key_func(self):
        """Should use custom key function when provided."""
        from fastapi import HTTPException

        def custom_key(request):
            return f"custom:{request.custom_id}"

        dependency = create_rate_limit_dependency(
            max_requests=1, window_seconds=60, key_func=custom_key
        )

        # Create mock requests with different custom IDs
        mock_request1 = MagicMock()
        mock_request1.custom_id = "user1"
        mock_request1.state = MagicMock()

        mock_request2 = MagicMock()
        mock_request2.custom_id = "user2"
        mock_request2.state = MagicMock()

        # Both should pass (different keys)
        await dependency(mock_request1)
        await dependency(mock_request2)

        # Same key should be blocked
        with pytest.raises(HTTPException):
            await dependency(mock_request1)

    @pytest.mark.asyncio
    async def test_sets_rate_limit_headers_on_state(self):
        """Should set rate limit info on request state."""
        dependency = create_rate_limit_dependency(max_requests=5, window_seconds=60)

        mock_request = MagicMock()
        mock_request.client.host = "127.0.0.1"
        mock_request.url.path = "/unique-test-path"
        mock_request.state = MagicMock()

        await dependency(mock_request)

        # Check state was updated
        mock_request.state.rate_limit_remaining = 4
        mock_request.state.rate_limit_limit = 5
