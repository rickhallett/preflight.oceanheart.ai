"""Factory functions for creating LLM service instances."""

from typing import Optional

from .base import LLMProvider, LLMService, LLMConfig, LLMError
from .config import get_llm_settings, get_model_preset
from .openai_client import OpenAIClient
from .anthropic_client import AnthropicClient


def create_llm_service(
    provider: LLMProvider | str,
    api_key: Optional[str] = None,
    **kwargs,
) -> LLMService:
    """Create an LLM service instance for the specified provider.

    Args:
        provider: The LLM provider to use
        api_key: Optional API key (uses env var if not provided)
        **kwargs: Additional provider-specific configuration

    Returns:
        LLMService instance

    Raises:
        ValueError: If provider is not supported or API key is missing
    """
    settings = get_llm_settings()

    # Convert string to enum if needed
    if isinstance(provider, str):
        try:
            provider = LLMProvider(provider.lower())
        except ValueError:
            raise ValueError(
                f"Unsupported provider: {provider}. "
                f"Supported: {[p.value for p in LLMProvider]}"
            )

    if provider == LLMProvider.OPENAI:
        key = api_key or settings.openai_api_key
        if not key:
            raise ValueError(
                "OpenAI API key not provided. "
                "Set OPENAI_API_KEY environment variable or pass api_key."
            )
        return OpenAIClient(
            api_key=key,
            organization=kwargs.get("organization", settings.openai_organization),
            base_url=kwargs.get("base_url", settings.openai_base_url),
            max_retries=kwargs.get("max_retries", settings.llm_max_retries),
        )

    elif provider == LLMProvider.ANTHROPIC:
        key = api_key or settings.anthropic_api_key
        if not key:
            raise ValueError(
                "Anthropic API key not provided. "
                "Set ANTHROPIC_API_KEY environment variable or pass api_key."
            )
        return AnthropicClient(
            api_key=key,
            base_url=kwargs.get("base_url", settings.anthropic_base_url),
            max_retries=kwargs.get("max_retries", settings.llm_max_retries),
        )

    else:
        raise ValueError(f"Unsupported provider: {provider}")


def get_default_llm_service() -> LLMService:
    """Get the default LLM service based on configuration.

    Returns:
        LLMService instance for the default provider
    """
    settings = get_llm_settings()
    return create_llm_service(settings.llm_provider)


def get_default_config(provider: Optional[LLMProvider] = None) -> LLMConfig:
    """Get default LLM configuration.

    Args:
        provider: Optional provider to get default model for

    Returns:
        LLMConfig with default settings
    """
    settings = get_llm_settings()

    # Determine model based on provider
    if provider == LLMProvider.OPENAI:
        model = settings.openai_default_model
    elif provider == LLMProvider.ANTHROPIC:
        model = settings.anthropic_default_model
    else:
        # Use model from default provider
        if settings.llm_provider == "anthropic":
            model = settings.anthropic_default_model
        else:
            model = settings.openai_default_model

    return LLMConfig(
        model=model,
        temperature=settings.llm_default_temperature,
        max_tokens=settings.llm_default_max_tokens,
        timeout=settings.llm_request_timeout,
    )


def get_config_from_preset(preset_name: str) -> tuple[LLMService, LLMConfig]:
    """Get LLM service and config from a preset.

    Args:
        preset_name: Name of the preset (e.g., "exploratory", "focused")

    Returns:
        Tuple of (LLMService, LLMConfig)
    """
    preset = get_model_preset(preset_name)
    settings = get_llm_settings()

    service = create_llm_service(preset["provider"])
    config = LLMConfig(
        model=preset["model"],
        temperature=preset["temperature"],
        max_tokens=preset["max_tokens"],
        timeout=settings.llm_request_timeout,
    )

    return service, config
