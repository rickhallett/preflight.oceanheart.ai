"""Anthropic LLM service implementation."""

import time
from typing import Optional

from anthropic import AsyncAnthropic, APIError
from anthropic import RateLimitError as AnthropicRateLimitError
from anthropic import AuthenticationError as AnthropicAuthError
from anthropic import BadRequestError as AnthropicBadRequestError
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from .base import (
    AuthenticationError,
    InvalidRequestError,
    LLMConfig,
    LLMError,
    LLMProvider,
    LLMResponse,
    LLMService,
    Message,
    MessageRole,
    RateLimitError,
)


class AnthropicClient(LLMService):
    """Anthropic Claude API client implementation."""

    provider = LLMProvider.ANTHROPIC

    def __init__(
        self,
        api_key: str,
        base_url: Optional[str] = None,
        max_retries: int = 3,
    ):
        """Initialize Anthropic client.

        Args:
            api_key: Anthropic API key
            base_url: Optional custom base URL
            max_retries: Maximum number of retry attempts
        """
        self.client = AsyncAnthropic(
            api_key=api_key,
            base_url=base_url,
        )
        self.max_retries = max_retries

    def _convert_messages(
        self, messages: list[Message]
    ) -> tuple[Optional[str], list[dict]]:
        """Convert messages to Anthropic format.

        Anthropic has a separate system parameter and requires alternating
        user/assistant messages.

        Args:
            messages: List of messages to convert

        Returns:
            Tuple of (system_prompt, messages_list)
        """
        system_prompt = None
        anthropic_messages = []

        for msg in messages:
            if msg.role == MessageRole.SYSTEM:
                # Anthropic uses a separate system parameter
                system_prompt = msg.content
            else:
                anthropic_messages.append({
                    "role": msg.role.value,
                    "content": msg.content,
                })

        return system_prompt, anthropic_messages

    @retry(
        retry=retry_if_exception_type((AnthropicRateLimitError, APIError)),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=30),
    )
    async def generate_response(
        self,
        messages: list[Message],
        config: LLMConfig,
    ) -> LLMResponse:
        """Generate a response using Anthropic's API.

        Args:
            messages: List of messages in the conversation
            config: Configuration for the request

        Returns:
            LLMResponse with the generated content and metadata
        """
        start_time = time.time()

        try:
            # Convert messages to Anthropic format
            system_prompt, anthropic_messages = self._convert_messages(messages)

            # Build request kwargs
            request_kwargs = {
                "model": config.model,
                "messages": anthropic_messages,
                "max_tokens": config.max_tokens,
                "temperature": config.temperature,
                "top_p": config.top_p,
            }

            # Add system prompt if present
            if system_prompt:
                request_kwargs["system"] = system_prompt

            # Add stop sequences if present
            if config.stop_sequences:
                request_kwargs["stop_sequences"] = config.stop_sequences

            # Make the API call
            response = await self.client.messages.create(**request_kwargs)

            # Calculate response time
            response_time_ms = int((time.time() - start_time) * 1000)

            # Extract response content
            content = ""
            if response.content and len(response.content) > 0:
                content = response.content[0].text

            # Get token usage
            usage = response.usage

            return LLMResponse(
                content=content,
                model=response.model,
                provider=self.provider,
                finish_reason=response.stop_reason or "end_turn",
                prompt_tokens=usage.input_tokens if usage else 0,
                completion_tokens=usage.output_tokens if usage else 0,
                total_tokens=(
                    (usage.input_tokens + usage.output_tokens) if usage else 0
                ),
                response_time_ms=response_time_ms,
            )

        except AnthropicRateLimitError as e:
            raise RateLimitError(
                message=str(e),
                provider=self.provider,
                status_code=429,
                retry_after=60,
            ) from e

        except AnthropicAuthError as e:
            raise AuthenticationError(
                message=str(e),
                provider=self.provider,
                status_code=401,
            ) from e

        except AnthropicBadRequestError as e:
            raise InvalidRequestError(
                message=str(e),
                provider=self.provider,
                status_code=400,
            ) from e

        except APIError as e:
            raise LLMError(
                message=str(e),
                provider=self.provider,
                status_code=getattr(e, "status_code", 500),
            ) from e

    async def count_tokens(self, text: str, model: str) -> int:
        """Estimate token count for Anthropic models.

        Anthropic doesn't provide a public tokenizer, so we use an estimate.
        Claude typically uses ~4 characters per token.

        Args:
            text: The text to count tokens for
            model: The model (not used for Anthropic)

        Returns:
            Estimated number of tokens
        """
        # Anthropic uses a variant of the Claude tokenizer
        # Rough estimate: ~4 characters per token (conservative)
        return len(text) // 4

    async def health_check(self) -> bool:
        """Check if Anthropic API is accessible.

        Returns:
            True if API responds successfully
        """
        try:
            # Make a minimal API call to verify connectivity
            await self.client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=1,
                messages=[{"role": "user", "content": "Hi"}],
            )
            return True
        except Exception:
            return False
