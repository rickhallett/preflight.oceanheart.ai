"""Mock LLM service for testing without real API calls."""

from datetime import datetime, timezone
from typing import Optional

from app.services.llm.base import (
    LLMService,
    LLMProvider,
    LLMConfig,
    LLMResponse,
    Message,
    LLMError,
    RateLimitError,
)


# Default coaching responses for predictable testing
DEFAULT_RESPONSES = [
    "Thank you for sharing that with me. I can see from your survey responses that you've been thinking carefully about AI adoption. What specific challenges are you facing with integrating AI into your daily workflow?",
    "That's a really insightful observation. It sounds like you're navigating some common but important challenges. Can you tell me more about how this affects your team's productivity?",
    "I understand. Let's explore some practical strategies you could implement. Based on what you've shared, here are a few approaches that might help. Which of these resonates most with your situation?",
    "Those are excellent points. As we wrap up our conversation, here's a summary of what we discussed and some concrete next steps you might consider. Thank you for this valuable conversation.",
]

# Error response for safety testing
SAFETY_FALLBACK_RESPONSE = (
    "I appreciate you sharing that with me. While I want to be helpful, "
    "I'm designed to focus on professional coaching rather than medical or personal advice. "
    "Let's redirect our conversation to your professional development goals. "
    "What work-related challenge would you like to explore?"
)


class MockLLMService(LLMService):
    """Mock LLM service for testing.

    Provides deterministic responses without making real API calls.
    Useful for:
    - Unit tests
    - Integration tests
    - CI/CD pipelines
    - Local development without API keys
    """

    provider = LLMProvider.OPENAI

    def __init__(
        self,
        responses: Optional[list[str]] = None,
        response_time_ms: int = 150,
        fail_on_call: int = -1,
        rate_limit_on_call: int = -1,
    ):
        """Initialize the mock LLM service.

        Args:
            responses: List of responses to return in order. Cycles back to start.
            response_time_ms: Simulated response time in milliseconds.
            fail_on_call: If >= 0, fail with LLMError on this call number.
            rate_limit_on_call: If >= 0, fail with RateLimitError on this call number.
        """
        self.responses = responses or DEFAULT_RESPONSES
        self.response_time_ms = response_time_ms
        self.fail_on_call = fail_on_call
        self.rate_limit_on_call = rate_limit_on_call
        self.call_count = 0
        self.call_history: list[dict] = []

    async def generate_response(
        self,
        messages: list[Message],
        config: LLMConfig,
    ) -> LLMResponse:
        """Generate a mock response.

        Args:
            messages: Conversation messages (stored in call_history for assertions)
            config: LLM configuration

        Returns:
            Deterministic LLMResponse based on call count

        Raises:
            LLMError: If fail_on_call matches current call
            RateLimitError: If rate_limit_on_call matches current call
        """
        current_call = self.call_count
        self.call_count += 1

        # Store call for test assertions
        self.call_history.append({
            "call_number": current_call,
            "messages": [{"role": m.role.value, "content": m.content} for m in messages],
            "config": {
                "model": config.model,
                "temperature": config.temperature,
                "max_tokens": config.max_tokens,
            },
        })

        # Simulate failures for testing error handling
        if current_call == self.fail_on_call:
            raise LLMError(
                "Simulated LLM failure for testing",
                provider=self.provider,
                status_code=500,
            )

        if current_call == self.rate_limit_on_call:
            raise RateLimitError(
                "Rate limit exceeded (mock)",
                provider=self.provider,
                status_code=429,
                retry_after=60,
            )

        # Get response content (cycle through available responses)
        response_index = current_call % len(self.responses)
        content = self.responses[response_index]

        # Calculate mock token counts (approximate)
        prompt_text = " ".join(m.content for m in messages)
        prompt_tokens = len(prompt_text.split())
        completion_tokens = len(content.split())

        return LLMResponse(
            content=content,
            model=config.model,
            provider=self.provider,
            finish_reason="stop",
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=prompt_tokens + completion_tokens,
            response_time_ms=self.response_time_ms,
            timestamp=datetime.now(timezone.utc),
        )

    async def count_tokens(self, text: str, model: str) -> int:
        """Estimate token count (approximately 4 characters per token)."""
        return max(1, len(text) // 4)

    async def health_check(self) -> bool:
        """Mock health check always returns True."""
        return True

    def reset(self) -> None:
        """Reset call count and history for fresh test runs."""
        self.call_count = 0
        self.call_history.clear()

    def get_last_call(self) -> Optional[dict]:
        """Get the last call made to the service."""
        if not self.call_history:
            return None
        return self.call_history[-1]

    def assert_called_with_message(self, content_substring: str) -> bool:
        """Assert that a message containing the substring was sent."""
        for call in self.call_history:
            for msg in call["messages"]:
                if content_substring.lower() in msg["content"].lower():
                    return True
        return False


class MockLLMServiceWithSafety(MockLLMService):
    """Mock LLM service that simulates safety filtering."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.safety_triggered = False

    async def generate_response(
        self,
        messages: list[Message],
        config: LLMConfig,
    ) -> LLMResponse:
        """Generate response with safety check simulation."""
        # Check last user message for safety triggers
        user_messages = [m for m in messages if m.role.value == "user"]
        if user_messages:
            last_user_msg = user_messages[-1].content.lower()

            # Simulate safety trigger patterns
            safety_triggers = [
                "kill",
                "suicide",
                "self-harm",
                "hurt myself",
                "medical diagnosis",
                "prescribe medication",
            ]

            for trigger in safety_triggers:
                if trigger in last_user_msg:
                    self.safety_triggered = True

                    # Return safety fallback
                    prompt_text = " ".join(m.content for m in messages)

                    return LLMResponse(
                        content=SAFETY_FALLBACK_RESPONSE,
                        model=config.model,
                        provider=self.provider,
                        finish_reason="safety_filter",
                        prompt_tokens=len(prompt_text.split()),
                        completion_tokens=len(SAFETY_FALLBACK_RESPONSE.split()),
                        total_tokens=len(prompt_text.split()) + len(SAFETY_FALLBACK_RESPONSE.split()),
                        response_time_ms=self.response_time_ms,
                        timestamp=datetime.now(timezone.utc),
                    )

        # No safety trigger, return normal response
        return await super().generate_response(messages, config)


# Convenience function for dependency injection in tests
def get_mock_llm_service(
    responses: Optional[list[str]] = None,
    with_safety: bool = False,
) -> LLMService:
    """Get a configured mock LLM service instance.

    Args:
        responses: Custom responses to use (optional)
        with_safety: If True, return service with safety simulation

    Returns:
        Configured MockLLMService instance
    """
    if with_safety:
        return MockLLMServiceWithSafety(responses=responses)
    return MockLLMService(responses=responses)
