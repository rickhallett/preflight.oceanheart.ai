"""OpenAI LLM service implementation."""

import time
from typing import Optional

from openai import AsyncOpenAI, APIError, RateLimitError as OpenAIRateLimitError
from openai import AuthenticationError as OpenAIAuthError
from openai import BadRequestError as OpenAIBadRequestError
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
    RateLimitError,
)


class OpenAIClient(LLMService):
    """OpenAI API client implementation."""

    provider = LLMProvider.OPENAI

    def __init__(
        self,
        api_key: str,
        organization: Optional[str] = None,
        base_url: Optional[str] = None,
        max_retries: int = 3,
    ):
        """Initialize OpenAI client.

        Args:
            api_key: OpenAI API key
            organization: Optional organization ID
            base_url: Optional custom base URL (for Azure OpenAI)
            max_retries: Maximum number of retry attempts
        """
        self.client = AsyncOpenAI(
            api_key=api_key,
            organization=organization,
            base_url=base_url,
        )
        self.max_retries = max_retries

    @retry(
        retry=retry_if_exception_type((OpenAIRateLimitError, APIError)),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=30),
    )
    async def generate_response(
        self,
        messages: list[Message],
        config: LLMConfig,
    ) -> LLMResponse:
        """Generate a response using OpenAI's API.

        Args:
            messages: List of messages in the conversation
            config: Configuration for the request

        Returns:
            LLMResponse with the generated content and metadata
        """
        start_time = time.time()

        try:
            # Convert messages to OpenAI format
            openai_messages = [msg.to_dict() for msg in messages]

            # Make the API call
            response = await self.client.chat.completions.create(
                model=config.model,
                messages=openai_messages,
                temperature=config.temperature,
                max_tokens=config.max_tokens,
                top_p=config.top_p,
                frequency_penalty=config.frequency_penalty,
                presence_penalty=config.presence_penalty,
                stop=config.stop_sequences if config.stop_sequences else None,
                timeout=config.timeout,
            )

            # Calculate response time
            response_time_ms = int((time.time() - start_time) * 1000)

            # Extract response data
            choice = response.choices[0]
            usage = response.usage

            return LLMResponse(
                content=choice.message.content or "",
                model=response.model,
                provider=self.provider,
                finish_reason=choice.finish_reason or "stop",
                prompt_tokens=usage.prompt_tokens if usage else 0,
                completion_tokens=usage.completion_tokens if usage else 0,
                total_tokens=usage.total_tokens if usage else 0,
                response_time_ms=response_time_ms,
            )

        except OpenAIRateLimitError as e:
            raise RateLimitError(
                message=str(e),
                provider=self.provider,
                status_code=429,
                retry_after=getattr(e, "retry_after", 60),
            ) from e

        except OpenAIAuthError as e:
            raise AuthenticationError(
                message=str(e),
                provider=self.provider,
                status_code=401,
            ) from e

        except OpenAIBadRequestError as e:
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
        """Count tokens using tiktoken.

        Args:
            text: The text to count tokens for
            model: The model to use for tokenization

        Returns:
            Number of tokens
        """
        try:
            import tiktoken

            # Get encoding for model
            try:
                encoding = tiktoken.encoding_for_model(model)
            except KeyError:
                # Fall back to cl100k_base for unknown models
                encoding = tiktoken.get_encoding("cl100k_base")

            return len(encoding.encode(text))
        except ImportError:
            # Rough estimate: ~4 characters per token
            return len(text) // 4

    async def health_check(self) -> bool:
        """Check if OpenAI API is accessible.

        Returns:
            True if API responds successfully
        """
        try:
            # Make a minimal API call to verify connectivity
            await self.client.models.list()
            return True
        except Exception:
            return False
