"""Tests for the prompt pipeline engine."""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.pipeline.template import TemplateEngine, SurveyResponseFormatter
from app.services.pipeline.safety import SafetyFilter, SafetyViolationType
from app.services.pipeline.engine import PipelineEngine, PipelineExecutionResult
from app.services.llm import LLMResponse, LLMConfig, Message, MessageRole, LLMProvider


# =============================================================================
# TemplateEngine Tests
# =============================================================================


class TestTemplateEngine:
    """Tests for template variable substitution."""

    def test_simple_substitution(self):
        """Test basic variable substitution."""
        template = "Hello {{name}}!"
        variables = {"name": "Alice"}
        result = TemplateEngine.substitute(template, variables)
        assert result == "Hello Alice!"

    def test_nested_variable(self):
        """Test nested dot notation variables."""
        template = "Your score is {{results.score}} out of {{results.max}}"
        variables = {"results": {"score": 85, "max": 100}}
        result = TemplateEngine.substitute(template, variables)
        assert result == "Your score is 85 out of 100"

    def test_missing_variable_preserved(self):
        """Test that missing variables are preserved as-is."""
        template = "Hello {{name}}, {{missing}} value"
        variables = {"name": "Bob"}
        result = TemplateEngine.substitute(template, variables)
        assert result == "Hello Bob, {{missing}} value"

    def test_boolean_formatting(self):
        """Test boolean values are formatted as yes/no."""
        template = "Ready: {{is_ready}}"
        variables = {"is_ready": True}
        result = TemplateEngine.substitute(template, variables)
        assert result == "Ready: yes"

        variables = {"is_ready": False}
        result = TemplateEngine.substitute(template, variables)
        assert result == "Ready: no"

    def test_list_formatting(self):
        """Test list values are formatted as comma-separated."""
        template = "Skills: {{skills}}"
        variables = {"skills": ["Python", "JavaScript", "SQL"]}
        result = TemplateEngine.substitute(template, variables)
        assert result == "Skills: Python, JavaScript, SQL"

    def test_extract_variables(self):
        """Test extracting variable names from template."""
        template = "Hello {{name}}, your score is {{results.score}}. {{name}} wins!"
        variables = TemplateEngine.extract_variables(template)
        assert variables == ["name", "results.score"]

    def test_validate_template_valid(self):
        """Test template validation with all variables available."""
        template = "Hello {{name}}"
        is_valid, missing = TemplateEngine.validate_template(template, ["name"])
        assert is_valid is True
        assert missing == []

    def test_validate_template_missing(self):
        """Test template validation with missing variables."""
        template = "Hello {{name}}, your {{role}}"
        is_valid, missing = TemplateEngine.validate_template(template, ["name"])
        assert is_valid is False
        assert "role" in missing


class TestSurveyResponseFormatter:
    """Tests for survey response formatting."""

    def test_format_answers(self):
        """Test formatting survey answers."""
        answers = [
            {"page_id": "demographics", "field_name": "age", "value": 35},
            {"page_id": "demographics", "field_name": "role", "value": "Developer"},
            {"page_id": "experience", "field_name": "years", "value": 10},
        ]
        result = SurveyResponseFormatter.format_answers(answers)

        assert "Survey Responses:" in result
        assert "demographics:" in result
        assert "age: 35" in result
        assert "role: Developer" in result
        assert "experience:" in result
        assert "years: 10" in result

    def test_format_empty_answers(self):
        """Test formatting empty answers."""
        result = SurveyResponseFormatter.format_answers([])
        assert result == "No survey responses recorded."

    def test_create_context(self):
        """Test creating full context dictionary."""
        answers = [
            {"page_id": "info", "field_name": "name", "value": "Test User"},
        ]
        user_info = {"id": "user123"}
        session_info = {"start_time": "2024-01-01"}

        context = SurveyResponseFormatter.create_context(
            answers=answers,
            user_info=user_info,
            session_info=session_info,
        )

        assert "survey_responses" in context
        assert context["answers"]["info"]["name"] == "Test User"
        assert context["user"]["id"] == "user123"
        assert context["session"]["start_time"] == "2024-01-01"


# =============================================================================
# SafetyFilter Tests
# =============================================================================


class TestSafetyFilter:
    """Tests for safety filtering."""

    def setup_method(self):
        """Set up test fixtures."""
        self.filter = SafetyFilter()

    def test_safe_input(self):
        """Test that normal input passes safety check."""
        result = self.filter.check_input("I want to improve my team's communication skills.")
        assert result.is_safe is True
        assert result.violation_type == SafetyViolationType.NONE

    def test_harmful_content_detected(self):
        """Test that harmful content is detected."""
        result = self.filter.check_input("I want to hurt myself")
        assert result.is_safe is False
        assert result.violation_type == SafetyViolationType.HARMFUL_CONTENT

    def test_suicide_content_detected(self):
        """Test that suicide-related content is detected."""
        result = self.filter.check_input("Thinking about suicide lately")
        assert result.is_safe is False
        assert result.violation_type == SafetyViolationType.HARMFUL_CONTENT

    def test_personal_info_redacted(self):
        """Test that personal information is redacted."""
        result = self.filter.check_input("My phone is 555-123-4567")
        assert result.is_safe is True  # Allow but redact
        assert result.violation_type == SafetyViolationType.PERSONAL_INFO
        assert result.redacted_content is not None
        assert "[REDACTED]" in result.redacted_content
        assert "555-123-4567" not in result.redacted_content

    def test_email_redacted(self):
        """Test that email addresses are redacted."""
        result = self.filter.check_input("Contact me at test@example.com")
        assert result.is_safe is True
        assert result.violation_type == SafetyViolationType.PERSONAL_INFO
        assert "[REDACTED]" in result.redacted_content

    def test_ssn_redacted(self):
        """Test that SSN is redacted."""
        result = self.filter.check_input("My SSN is 123-45-6789")
        assert result.is_safe is True
        assert result.violation_type == SafetyViolationType.PERSONAL_INFO
        assert "[REDACTED]" in result.redacted_content

    def test_output_safe(self):
        """Test that normal AI output passes safety check."""
        result = self.filter.check_output(
            "That's a great question! Let's explore what motivates your team."
        )
        assert result.is_safe is True
        assert result.violation_type == SafetyViolationType.NONE

    def test_output_medical_advice_detected(self):
        """Test that medical advice in output is detected."""
        result = self.filter.check_output(
            "Based on your symptoms, I diagnose you with anxiety disorder."
        )
        assert result.is_safe is False
        assert result.violation_type == SafetyViolationType.MEDICAL_ADVICE

    def test_output_prescription_detected(self):
        """Test that prescription language is detected."""
        result = self.filter.check_output(
            "I will prescribe this medication for your condition."
        )
        assert result.is_safe is False
        assert result.violation_type == SafetyViolationType.MEDICAL_ADVICE

    def test_safety_system_prompt(self):
        """Test that safety system prompt is returned."""
        prompt = self.filter.get_safety_system_prompt()
        assert "CRITICAL RULES" in prompt
        assert "NEVER provide medical diagnosis" in prompt

    def test_fallback_response_harmful(self):
        """Test fallback response for harmful content."""
        response = self.filter.get_fallback_response(SafetyViolationType.HARMFUL_CONTENT)
        assert response is not None
        assert "988" in response  # Crisis line

    def test_fallback_response_medical(self):
        """Test fallback response for medical advice."""
        response = self.filter.get_fallback_response(SafetyViolationType.MEDICAL_ADVICE)
        assert response is not None
        assert "not able to provide medical advice" in response

    def test_sanitize_input(self):
        """Test input sanitization."""
        text = "Call me at 555-123-4567 or email test@example.com"
        result = self.filter.sanitize_input(text)
        assert "555-123-4567" not in result
        assert "test@example.com" not in result
        assert result.count("[REDACTED]") == 2


# =============================================================================
# PipelineEngine Tests
# =============================================================================


class TestPipelineEngine:
    """Tests for pipeline execution engine."""

    def setup_method(self):
        """Set up test fixtures."""
        self.mock_llm = AsyncMock()
        self.engine = PipelineEngine(llm_service=self.mock_llm)

    def test_build_messages(self):
        """Test message building for LLM call."""
        pipeline = {
            "system_prompt": "You are a helpful coach for {{user.name}}."
        }
        context = {"user": {"name": "Alice"}}
        history = [
            {"role": "assistant", "content": "Hello!"},
            {"role": "user", "content": "Hi there"},
        ]
        user_message = "How can I improve?"

        messages = self.engine.build_messages(pipeline, context, history, user_message)

        # Should have: safety prompt, system prompt, history (2), user message
        assert len(messages) == 5
        assert messages[0].role == MessageRole.SYSTEM  # Safety
        assert messages[1].role == MessageRole.SYSTEM  # Pipeline system
        assert "Alice" in messages[1].content  # Variable substituted
        assert messages[2].role == MessageRole.ASSISTANT
        assert messages[3].role == MessageRole.USER
        assert messages[4].role == MessageRole.USER
        assert messages[4].content == "How can I improve?"

    @pytest.mark.asyncio
    async def test_execute_round_success(self):
        """Test successful pipeline round execution."""
        self.mock_llm.generate_response.return_value = LLMResponse(
            content="That's a great question! Let me help you explore that.",
            model="gpt-4-turbo",
            provider=LLMProvider.OPENAI,
            finish_reason="stop",
            prompt_tokens=100,
            completion_tokens=50,
            total_tokens=150,
            response_time_ms=500,
        )

        pipeline = {"system_prompt": "You are a coach."}
        context = {}
        history = []
        user_message = "I want to improve my leadership skills."
        config = LLMConfig(model="gpt-4-turbo")

        result = await self.engine.execute_round(
            pipeline, context, history, user_message, config
        )

        assert result.success is True
        assert result.response is not None
        assert "great question" in result.response
        assert result.llm_response is not None
        assert result.used_fallback is False

    @pytest.mark.asyncio
    async def test_execute_round_harmful_input(self):
        """Test that harmful input returns fallback response."""
        pipeline = {"system_prompt": "You are a coach."}
        context = {}
        history = []
        user_message = "I want to hurt myself."
        config = LLMConfig(model="gpt-4-turbo")

        result = await self.engine.execute_round(
            pipeline, context, history, user_message, config
        )

        assert result.success is True
        assert result.used_fallback is True
        assert result.safety_check is not None
        assert result.safety_check.violation_type == SafetyViolationType.HARMFUL_CONTENT
        assert "988" in result.response  # Crisis line in response

    @pytest.mark.asyncio
    async def test_execute_round_redacts_personal_info(self):
        """Test that personal info is redacted before sending to LLM."""
        self.mock_llm.generate_response.return_value = LLMResponse(
            content="I understand. Let's focus on your goals.",
            model="gpt-4-turbo",
            provider=LLMProvider.OPENAI,
            finish_reason="stop",
            prompt_tokens=100,
            completion_tokens=50,
            total_tokens=150,
            response_time_ms=500,
        )

        pipeline = {"system_prompt": "You are a coach."}
        context = {}
        history = []
        user_message = "My email is test@example.com and I need help."
        config = LLMConfig(model="gpt-4-turbo")

        result = await self.engine.execute_round(
            pipeline, context, history, user_message, config
        )

        assert result.success is True
        # Check that the LLM received redacted content
        call_args = self.mock_llm.generate_response.call_args
        messages = call_args[0][0]
        user_msg = messages[-1].content
        assert "test@example.com" not in user_msg
        assert "[REDACTED]" in user_msg

    @pytest.mark.asyncio
    async def test_execute_round_llm_error(self):
        """Test handling of LLM errors."""
        self.mock_llm.generate_response.side_effect = Exception("API error")

        pipeline = {"system_prompt": "You are a coach."}
        context = {}
        history = []
        user_message = "Hello"
        config = LLMConfig(model="gpt-4-turbo")

        result = await self.engine.execute_round(
            pipeline, context, history, user_message, config
        )

        assert result.success is False
        assert result.error is not None
        assert "API error" in result.error

    @pytest.mark.asyncio
    async def test_generate_initial_message_success(self):
        """Test generating initial coaching message."""
        self.mock_llm.generate_response.return_value = LLMResponse(
            content="Welcome! I'm your AI coach. Let's explore your goals together.",
            model="gpt-4-turbo",
            provider=LLMProvider.OPENAI,
            finish_reason="stop",
            prompt_tokens=200,
            completion_tokens=30,
            total_tokens=230,
            response_time_ms=600,
        )

        pipeline = {
            "system_prompt": "You are a coach.",
            "initial_prompt": "Introduce yourself and ask about goals.",
        }
        context = {"survey_responses": "User is interested in leadership."}
        config = LLMConfig(model="gpt-4-turbo")

        result = await self.engine.generate_initial_message(pipeline, context, config)

        assert result.success is True
        assert result.response is not None
        assert "coach" in result.response.lower()
        assert result.llm_response is not None

    @pytest.mark.asyncio
    async def test_generate_initial_message_default_prompt(self):
        """Test that default initial prompt is used when not specified."""
        self.mock_llm.generate_response.return_value = LLMResponse(
            content="Hello! I'm here to help.",
            model="gpt-4-turbo",
            provider=LLMProvider.OPENAI,
            finish_reason="stop",
            prompt_tokens=150,
            completion_tokens=20,
            total_tokens=170,
            response_time_ms=400,
        )

        pipeline = {"system_prompt": "You are a coach."}  # No initial_prompt
        context = {}
        config = LLMConfig(model="gpt-4-turbo")

        result = await self.engine.generate_initial_message(pipeline, context, config)

        assert result.success is True
        # Check that default prompt was used
        call_args = self.mock_llm.generate_response.call_args
        messages = call_args[0][0]
        user_msg = messages[-1].content
        assert "survey responses" in user_msg.lower()

    def test_create_context_from_run(self):
        """Test creating context from run answers."""
        answers = [
            {"page_id": "page1", "field_name": "name", "value": "Test"},
            {"page_id": "page1", "field_name": "role", "value": "Manager"},
        ]
        run_metadata = {"started_at": "2024-01-01"}

        context = self.engine.create_context_from_run(answers, run_metadata)

        assert "survey_responses" in context
        assert "answers" in context
        assert context["answers"]["page1"]["name"] == "Test"
        assert context["session"]["started_at"] == "2024-01-01"


# =============================================================================
# Integration-style Tests
# =============================================================================


class TestPipelineIntegration:
    """Integration-style tests for the pipeline system."""

    @pytest.mark.asyncio
    async def test_full_round_with_variable_substitution(self):
        """Test a full round with variable substitution in prompts."""
        mock_llm = AsyncMock()
        mock_llm.generate_response.return_value = LLMResponse(
            content="Based on your experience in healthcare, let's explore...",
            model="gpt-4-turbo",
            provider=LLMProvider.OPENAI,
            finish_reason="stop",
            prompt_tokens=250,
            completion_tokens=60,
            total_tokens=310,
            response_time_ms=700,
        )

        engine = PipelineEngine(llm_service=mock_llm)

        pipeline = {
            "system_prompt": (
                "You are coaching a {{answers.demographics.role}} "
                "who works in {{answers.demographics.industry}}."
            ),
        }
        context = {
            "answers": {
                "demographics": {
                    "role": "nurse",
                    "industry": "healthcare",
                }
            }
        }
        history = []
        user_message = "I struggle with work-life balance."
        config = LLMConfig(model="gpt-4-turbo")

        result = await engine.execute_round(
            pipeline, context, history, user_message, config
        )

        assert result.success is True

        # Verify that substitution happened in system prompt
        call_args = mock_llm.generate_response.call_args
        messages = call_args[0][0]
        system_msg = messages[1].content  # Second message is pipeline system prompt
        assert "nurse" in system_msg
        assert "healthcare" in system_msg
