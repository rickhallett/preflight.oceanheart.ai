"""Tests for LLM service abstraction."""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.llm import (
    LLMProvider,
    LLMService,
    Message,
    MessageRole,
    LLMResponse,
    LLMConfig,
    LLMError,
    RateLimitError,
    AuthenticationError,
    OpenAIClient,
    AnthropicClient,
    create_llm_service,
)


# Fixtures
@pytest.fixture
def sample_messages():
    """Sample conversation messages."""
    return [
        Message(role=MessageRole.SYSTEM, content="You are a helpful assistant."),
        Message(role=MessageRole.USER, content="Hello, how are you?"),
    ]


@pytest.fixture
def sample_config():
    """Sample LLM configuration."""
    return LLMConfig(
        model="gpt-4-turbo",
        temperature=0.7,
        max_tokens=150,
        timeout=45,
    )


@pytest.fixture
def mock_openai_response():
    """Mock OpenAI API response."""
    response = MagicMock()
    response.choices = [
        MagicMock(
            message=MagicMock(content="Hello! I'm doing well, thank you for asking."),
            finish_reason="stop",
        )
    ]
    response.usage = MagicMock(
        prompt_tokens=20,
        completion_tokens=15,
        total_tokens=35,
    )
    response.model = "gpt-4-turbo"
    return response


@pytest.fixture
def mock_anthropic_response():
    """Mock Anthropic API response."""
    response = MagicMock()
    response.content = [MagicMock(text="Hello! I'm doing well, thank you for asking.")]
    response.stop_reason = "end_turn"
    response.usage = MagicMock(
        input_tokens=20,
        output_tokens=15,
    )
    response.model = "claude-3-5-sonnet-20241022"
    return response


# Base type tests
class TestMessage:
    """Tests for Message dataclass."""

    def test_to_dict_basic(self):
        """Test basic message conversion."""
        msg = Message(role=MessageRole.USER, content="Hello")
        result = msg.to_dict()
        assert result == {"role": "user", "content": "Hello"}

    def test_to_dict_with_name(self):
        """Test message conversion with name."""
        msg = Message(role=MessageRole.USER, content="Hello", name="Alice")
        result = msg.to_dict()
        assert result == {"role": "user", "content": "Hello", "name": "Alice"}


class TestLLMResponse:
    """Tests for LLMResponse dataclass."""

    def test_estimated_cost_gpt4(self):
        """Test cost estimation for GPT-4."""
        response = LLMResponse(
            content="Test",
            model="gpt-4-turbo",
            provider=LLMProvider.OPENAI,
            finish_reason="stop",
            prompt_tokens=1000,
            completion_tokens=500,
            total_tokens=1500,
            response_time_ms=1000,
        )
        # GPT-4 Turbo: $10/1M input + $30/1M output
        expected = (1000 / 1_000_000 * 10) + (500 / 1_000_000 * 30)
        assert abs(response.estimated_cost_usd - expected) < 0.0001

    def test_estimated_cost_claude(self):
        """Test cost estimation for Claude."""
        response = LLMResponse(
            content="Test",
            model="claude-3-5-sonnet-20241022",
            provider=LLMProvider.ANTHROPIC,
            finish_reason="end_turn",
            prompt_tokens=1000,
            completion_tokens=500,
            total_tokens=1500,
            response_time_ms=1000,
        )
        # Claude 3.5 Sonnet: $3/1M input + $15/1M output
        expected = (1000 / 1_000_000 * 3) + (500 / 1_000_000 * 15)
        assert abs(response.estimated_cost_usd - expected) < 0.0001


# OpenAI client tests
class TestOpenAIClient:
    """Tests for OpenAI client."""

    @pytest.mark.asyncio
    async def test_generate_response_success(
        self, sample_messages, sample_config, mock_openai_response
    ):
        """Test successful response generation."""
        with patch("app.services.llm.openai_client.AsyncOpenAI") as mock_client:
            # Setup mock
            mock_instance = MagicMock()
            mock_instance.chat.completions.create = AsyncMock(
                return_value=mock_openai_response
            )
            mock_client.return_value = mock_instance

            # Create client and generate response
            client = OpenAIClient(api_key="test-key")
            response = await client.generate_response(sample_messages, sample_config)

            # Verify response
            assert response.provider == LLMProvider.OPENAI
            assert response.content == "Hello! I'm doing well, thank you for asking."
            assert response.prompt_tokens == 20
            assert response.completion_tokens == 15
            assert response.finish_reason == "stop"

    @pytest.mark.asyncio
    async def test_generate_response_rate_limit(self, sample_messages, sample_config):
        """Test rate limit error handling."""
        from openai import RateLimitError as OpenAIRateLimitError

        with patch("app.services.llm.openai_client.AsyncOpenAI") as mock_client:
            mock_instance = MagicMock()
            mock_instance.chat.completions.create = AsyncMock(
                side_effect=OpenAIRateLimitError(
                    message="Rate limit exceeded",
                    response=MagicMock(status_code=429),
                    body=None,
                )
            )
            mock_client.return_value = mock_instance

            client = OpenAIClient(api_key="test-key")

            with pytest.raises(RateLimitError) as exc_info:
                await client.generate_response(sample_messages, sample_config)

            assert exc_info.value.status_code == 429

    @pytest.mark.asyncio
    async def test_count_tokens(self):
        """Test token counting."""
        with patch("app.services.llm.openai_client.AsyncOpenAI"):
            client = OpenAIClient(api_key="test-key")
            # Without tiktoken, falls back to estimate
            count = await client.count_tokens("Hello, world!", "gpt-4")
            assert count > 0


# Anthropic client tests
class TestAnthropicClient:
    """Tests for Anthropic client."""

    @pytest.mark.asyncio
    async def test_generate_response_success(
        self, sample_messages, mock_anthropic_response
    ):
        """Test successful response generation."""
        with patch("app.services.llm.anthropic_client.AsyncAnthropic") as mock_client:
            mock_instance = MagicMock()
            mock_instance.messages.create = AsyncMock(
                return_value=mock_anthropic_response
            )
            mock_client.return_value = mock_instance

            client = AnthropicClient(api_key="test-key")
            config = LLMConfig(model="claude-3-5-sonnet-20241022")
            response = await client.generate_response(sample_messages, config)

            assert response.provider == LLMProvider.ANTHROPIC
            assert response.content == "Hello! I'm doing well, thank you for asking."
            assert response.prompt_tokens == 20
            assert response.completion_tokens == 15

    def test_convert_messages_with_system(self, sample_messages):
        """Test message conversion with system prompt."""
        with patch("app.services.llm.anthropic_client.AsyncAnthropic"):
            client = AnthropicClient(api_key="test-key")
            system, messages = client._convert_messages(sample_messages)

            assert system == "You are a helpful assistant."
            assert len(messages) == 1
            assert messages[0]["role"] == "user"


# Factory tests
class TestFactory:
    """Tests for LLM service factory."""

    def test_create_openai_service(self):
        """Test creating OpenAI service."""
        with patch("app.services.llm.factory.get_llm_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                openai_api_key="test-key",
                openai_organization=None,
                openai_base_url=None,
                llm_max_retries=3,
            )

            service = create_llm_service(LLMProvider.OPENAI)
            assert isinstance(service, OpenAIClient)
            assert service.provider == LLMProvider.OPENAI

    def test_create_anthropic_service(self):
        """Test creating Anthropic service."""
        with patch("app.services.llm.factory.get_llm_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                anthropic_api_key="test-key",
                anthropic_base_url=None,
                llm_max_retries=3,
            )

            service = create_llm_service(LLMProvider.ANTHROPIC)
            assert isinstance(service, AnthropicClient)
            assert service.provider == LLMProvider.ANTHROPIC

    def test_create_service_missing_key(self):
        """Test error when API key is missing."""
        with patch("app.services.llm.factory.get_llm_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                openai_api_key=None,
            )

            with pytest.raises(ValueError, match="API key not provided"):
                create_llm_service(LLMProvider.OPENAI)

    def test_create_service_invalid_provider(self):
        """Test error for invalid provider."""
        with pytest.raises(ValueError, match="Unsupported provider"):
            create_llm_service("invalid-provider")


# Error handling tests
class TestErrors:
    """Tests for error classes."""

    def test_llm_error_attributes(self):
        """Test LLMError attributes."""
        error = LLMError(
            message="Test error",
            provider=LLMProvider.OPENAI,
            status_code=500,
            retry_after=60,
        )
        assert str(error) == "Test error"
        assert error.provider == LLMProvider.OPENAI
        assert error.status_code == 500
        assert error.retry_after == 60

    def test_rate_limit_error(self):
        """Test RateLimitError inheritance."""
        error = RateLimitError("Rate limited", retry_after=30)
        assert isinstance(error, LLMError)
        assert error.retry_after == 30

    def test_auth_error(self):
        """Test AuthenticationError inheritance."""
        error = AuthenticationError("Invalid key")
        assert isinstance(error, LLMError)
