"""Base types and interfaces for LLM services."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Optional


class LLMProvider(str, Enum):
    """Supported LLM providers."""

    OPENAI = "openai"
    ANTHROPIC = "anthropic"


class MessageRole(str, Enum):
    """Message roles in a conversation."""

    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"


@dataclass
class Message:
    """A single message in a conversation."""

    role: MessageRole
    content: str
    name: Optional[str] = None

    def to_dict(self) -> dict:
        """Convert to dictionary for API calls."""
        result = {"role": self.role.value, "content": self.content}
        if self.name:
            result["name"] = self.name
        return result


@dataclass
class LLMConfig:
    """Configuration for LLM requests."""

    model: str
    temperature: float = 0.7
    max_tokens: int = 150
    timeout: int = 45
    top_p: float = 1.0
    frequency_penalty: float = 0.0
    presence_penalty: float = 0.0
    stop_sequences: list[str] = field(default_factory=list)


@dataclass
class LLMResponse:
    """Response from an LLM API call."""

    content: str
    model: str
    provider: LLMProvider
    finish_reason: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    response_time_ms: int
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    @property
    def estimated_cost_usd(self) -> float:
        """Estimate cost based on token usage.

        Uses approximate pricing (may need adjustment based on actual model pricing):
        - GPT-4 Turbo: $10/1M input, $30/1M output
        - GPT-3.5 Turbo: $0.50/1M input, $1.50/1M output
        - Claude 3.5 Sonnet: $3/1M input, $15/1M output
        - Claude 3 Haiku: $0.25/1M input, $1.25/1M output
        """
        model_lower = self.model.lower()

        # Define pricing per 1M tokens (input, output)
        # Sorted by specificity (more specific patterns first)
        pricing = [
            ("gpt-4-turbo", (10.0, 30.0)),
            ("gpt-4o-mini", (0.15, 0.6)),
            ("gpt-4o", (2.5, 10.0)),
            ("gpt-4", (30.0, 60.0)),
            ("gpt-3.5-turbo", (0.5, 1.5)),
            ("claude-3-5-sonnet", (3.0, 15.0)),
            ("claude-3-5-haiku", (0.25, 1.25)),
            ("claude-3-sonnet", (3.0, 15.0)),
            ("claude-3-haiku", (0.25, 1.25)),
            ("claude-3-opus", (15.0, 75.0)),
        ]

        # Find matching model (more specific matches first)
        input_price, output_price = 10.0, 30.0  # Default fallback
        for model_key, prices in pricing:
            if model_key in model_lower:
                input_price, output_price = prices
                break

        # Calculate cost
        input_cost = (self.prompt_tokens / 1_000_000) * input_price
        output_cost = (self.completion_tokens / 1_000_000) * output_price
        return input_cost + output_cost


class LLMError(Exception):
    """Base exception for LLM service errors."""

    def __init__(
        self,
        message: str,
        provider: Optional[LLMProvider] = None,
        status_code: Optional[int] = None,
        retry_after: Optional[int] = None,
    ):
        super().__init__(message)
        self.provider = provider
        self.status_code = status_code
        self.retry_after = retry_after


class RateLimitError(LLMError):
    """Rate limit exceeded error."""

    pass


class AuthenticationError(LLMError):
    """Authentication or authorization error."""

    pass


class InvalidRequestError(LLMError):
    """Invalid request parameters error."""

    pass


class LLMService(ABC):
    """Abstract base class for LLM service providers."""

    provider: LLMProvider

    @abstractmethod
    async def generate_response(
        self,
        messages: list[Message],
        config: LLMConfig,
    ) -> LLMResponse:
        """Generate a response from the LLM.

        Args:
            messages: List of messages in the conversation
            config: Configuration for the request

        Returns:
            LLMResponse with the generated content and metadata

        Raises:
            LLMError: If the API call fails
            RateLimitError: If rate limit is exceeded
            AuthenticationError: If authentication fails
            InvalidRequestError: If request parameters are invalid
        """
        pass

    @abstractmethod
    async def count_tokens(self, text: str, model: str) -> int:
        """Count the number of tokens in a text.

        Args:
            text: The text to count tokens for
            model: The model to use for tokenization

        Returns:
            Number of tokens
        """
        pass

    @abstractmethod
    async def health_check(self) -> bool:
        """Check if the LLM service is available.

        Returns:
            True if service is healthy, False otherwise
        """
        pass
