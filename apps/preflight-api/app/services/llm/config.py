"""Configuration management for LLM services."""

import os
from functools import lru_cache
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class LLMSettings(BaseSettings):
    """LLM service configuration settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Provider selection
    llm_provider: str = Field(
        default="openai",
        alias="LLM_PROVIDER",
        description="Default LLM provider (openai or anthropic)",
    )

    # OpenAI settings
    openai_api_key: Optional[str] = Field(
        default=None,
        alias="OPENAI_API_KEY",
    )
    openai_organization: Optional[str] = Field(
        default=None,
        alias="OPENAI_ORGANIZATION",
    )
    openai_base_url: Optional[str] = Field(
        default=None,
        alias="OPENAI_BASE_URL",
        description="Custom base URL for Azure OpenAI",
    )
    openai_default_model: str = Field(
        default="gpt-4-turbo",
        alias="OPENAI_DEFAULT_MODEL",
    )

    # Anthropic settings
    anthropic_api_key: Optional[str] = Field(
        default=None,
        alias="ANTHROPIC_API_KEY",
    )
    anthropic_base_url: Optional[str] = Field(
        default=None,
        alias="ANTHROPIC_BASE_URL",
    )
    anthropic_default_model: str = Field(
        default="claude-3-5-sonnet-20241022",
        alias="ANTHROPIC_DEFAULT_MODEL",
    )

    # Request settings
    llm_request_timeout: int = Field(
        default=45,
        alias="LLM_REQUEST_TIMEOUT",
        ge=10,
        le=120,
    )
    llm_max_retries: int = Field(
        default=3,
        alias="LLM_MAX_RETRIES",
        ge=1,
        le=5,
    )

    # Default generation parameters
    llm_default_temperature: float = Field(
        default=0.7,
        alias="LLM_DEFAULT_TEMPERATURE",
        ge=0.0,
        le=2.0,
    )
    llm_default_max_tokens: int = Field(
        default=150,
        alias="LLM_DEFAULT_MAX_TOKENS",
        ge=1,
        le=4096,
    )

    # Cost monitoring
    llm_monthly_budget_usd: float = Field(
        default=100.0,
        alias="LLM_MONTHLY_BUDGET_USD",
        description="Monthly budget limit for LLM API calls",
    )
    llm_cost_alert_threshold: float = Field(
        default=0.8,
        alias="LLM_COST_ALERT_THRESHOLD",
        description="Alert when this percentage of budget is used",
        ge=0.0,
        le=1.0,
    )


@lru_cache
def get_llm_settings() -> LLMSettings:
    """Get cached LLM settings.

    Returns:
        LLMSettings instance
    """
    return LLMSettings()


# Model configuration presets
MODEL_PRESETS = {
    "exploratory": {
        "provider": "openai",
        "model": "gpt-4-turbo",
        "temperature": 0.8,
        "max_tokens": 200,
    },
    "focused": {
        "provider": "anthropic",
        "model": "claude-3-5-sonnet-20241022",
        "temperature": 0.6,
        "max_tokens": 150,
    },
    "concise": {
        "provider": "anthropic",
        "model": "claude-3-haiku-20240307",
        "temperature": 0.5,
        "max_tokens": 100,
    },
    "creative": {
        "provider": "openai",
        "model": "gpt-4o",
        "temperature": 0.9,
        "max_tokens": 250,
    },
}


def get_model_preset(preset_name: str) -> dict:
    """Get model configuration preset.

    Args:
        preset_name: Name of the preset

    Returns:
        Dictionary with model configuration

    Raises:
        ValueError: If preset not found
    """
    if preset_name not in MODEL_PRESETS:
        raise ValueError(
            f"Unknown preset: {preset_name}. "
            f"Available: {list(MODEL_PRESETS.keys())}"
        )
    return MODEL_PRESETS[preset_name].copy()
