"""LLM service abstraction layer.

Provides a unified interface for interacting with multiple LLM providers
(OpenAI, Anthropic) with support for retry logic, error handling, and
cost tracking.
"""

from .base import (
    LLMProvider,
    LLMService,
    Message,
    MessageRole,
    LLMResponse,
    LLMConfig,
    LLMError,
    RateLimitError,
    AuthenticationError,
    InvalidRequestError,
)
from .openai_client import OpenAIClient
from .anthropic_client import AnthropicClient
from .factory import create_llm_service, get_default_llm_service

__all__ = [
    # Base types
    "LLMProvider",
    "LLMService",
    "Message",
    "MessageRole",
    "LLMResponse",
    "LLMConfig",
    # Errors
    "LLMError",
    "RateLimitError",
    "AuthenticationError",
    "InvalidRequestError",
    # Clients
    "OpenAIClient",
    "AnthropicClient",
    # Factory
    "create_llm_service",
    "get_default_llm_service",
]
