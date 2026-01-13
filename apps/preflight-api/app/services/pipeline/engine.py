"""Pipeline execution engine for coaching conversations."""

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Optional
from uuid import UUID

from app.services.llm import (
    LLMConfig,
    LLMResponse,
    LLMService,
    Message,
    MessageRole,
    create_llm_service,
)
from .template import TemplateEngine, SurveyResponseFormatter
from .safety import SafetyFilter, SafetyCheckResult, SafetyViolationType


@dataclass
class PipelineExecutionResult:
    """Result of executing a pipeline round."""

    success: bool
    response: Optional[str] = None
    llm_response: Optional[LLMResponse] = None
    safety_check: Optional[SafetyCheckResult] = None
    error: Optional[str] = None
    used_fallback: bool = False


class PipelineEngine:
    """Engine for executing prompt pipelines.

    Handles:
    - Template variable substitution
    - Conversation history management
    - Safety filtering
    - LLM API calls with retries
    """

    def __init__(
        self,
        llm_service: Optional[LLMService] = None,
        safety_filter: Optional[SafetyFilter] = None,
    ):
        """Initialize pipeline engine.

        Args:
            llm_service: LLM service to use (creates default if not provided)
            safety_filter: Safety filter to use (creates default if not provided)
        """
        self._llm_service = llm_service
        self._safety_filter = safety_filter or SafetyFilter()
        self._template_engine = TemplateEngine()

    @property
    def llm_service(self) -> LLMService:
        """Get or create LLM service."""
        if self._llm_service is None:
            self._llm_service = create_llm_service("openai")
        return self._llm_service

    def set_llm_service(self, service: LLMService) -> None:
        """Set the LLM service to use."""
        self._llm_service = service

    def build_messages(
        self,
        pipeline: dict[str, Any],
        context: dict[str, Any],
        conversation_history: list[dict],
        user_message: str,
    ) -> list[Message]:
        """Build the message list for an LLM call.

        Args:
            pipeline: Pipeline configuration
            context: Template variables context
            conversation_history: Previous turns in the conversation
            user_message: Current user message

        Returns:
            List of messages for the LLM
        """
        messages = []

        # Add safety system prompt first
        messages.append(
            Message(
                role=MessageRole.SYSTEM,
                content=self._safety_filter.get_safety_system_prompt(),
            )
        )

        # Add pipeline system prompt if present
        system_prompt = pipeline.get("system_prompt", "")
        if system_prompt:
            substituted = self._template_engine.substitute(system_prompt, context)
            messages.append(
                Message(
                    role=MessageRole.SYSTEM,
                    content=substituted,
                )
            )

        # Add conversation history
        for turn in conversation_history:
            role = MessageRole(turn.get("role", "user"))
            messages.append(
                Message(
                    role=role,
                    content=turn.get("content", ""),
                )
            )

        # Add current user message
        messages.append(
            Message(
                role=MessageRole.USER,
                content=user_message,
            )
        )

        return messages

    async def execute_round(
        self,
        pipeline: dict[str, Any],
        context: dict[str, Any],
        conversation_history: list[dict],
        user_message: str,
        config: Optional[LLMConfig] = None,
    ) -> PipelineExecutionResult:
        """Execute a single round of the pipeline.

        Args:
            pipeline: Pipeline configuration
            context: Template variables context
            conversation_history: Previous conversation turns
            user_message: Current user message
            config: Optional LLM configuration override

        Returns:
            PipelineExecutionResult with response or error
        """
        # Check user input safety
        input_check = self._safety_filter.check_input(user_message)

        # Handle harmful content
        if not input_check.is_safe:
            if input_check.violation_type == SafetyViolationType.HARMFUL_CONTENT:
                fallback = self._safety_filter.get_fallback_response(
                    input_check.violation_type
                )
                return PipelineExecutionResult(
                    success=True,
                    response=fallback,
                    safety_check=input_check,
                    used_fallback=True,
                )

        # Use redacted content if personal info was detected
        clean_message = input_check.redacted_content or user_message

        # Build messages
        messages = self.build_messages(
            pipeline, context, conversation_history, clean_message
        )

        # Get LLM config
        if config is None:
            config = LLMConfig(
                model=pipeline.get("model", "gpt-4-turbo"),
                temperature=pipeline.get("temperature", 0.7),
                max_tokens=pipeline.get("max_tokens", 150),
                timeout=45,
            )

        try:
            # Call LLM
            llm_response = await self.llm_service.generate_response(messages, config)

            # Check output safety
            output_check = self._safety_filter.check_output(llm_response.content)

            if not output_check.is_safe:
                # Use fallback response if output is unsafe
                fallback = self._safety_filter.get_fallback_response(
                    output_check.violation_type
                )
                if fallback:
                    return PipelineExecutionResult(
                        success=True,
                        response=fallback,
                        llm_response=llm_response,
                        safety_check=output_check,
                        used_fallback=True,
                    )

            return PipelineExecutionResult(
                success=True,
                response=llm_response.content,
                llm_response=llm_response,
                safety_check=output_check,
            )

        except Exception as e:
            return PipelineExecutionResult(
                success=False,
                error=str(e),
            )

    async def generate_initial_message(
        self,
        pipeline: dict[str, Any],
        context: dict[str, Any],
        config: Optional[LLMConfig] = None,
    ) -> PipelineExecutionResult:
        """Generate the initial coaching message.

        Args:
            pipeline: Pipeline configuration
            context: Template variables context
            config: Optional LLM configuration

        Returns:
            PipelineExecutionResult with initial message
        """
        # Get initial prompt from pipeline
        initial_prompt = pipeline.get("initial_prompt", "")
        if not initial_prompt:
            initial_prompt = (
                "Based on the survey responses provided, introduce yourself as an "
                "AI coach and ask an open-ended question to begin exploring the user's "
                "challenges and goals. Be warm, professional, and curious."
            )

        # Substitute variables
        substituted = self._template_engine.substitute(initial_prompt, context)

        # Build messages with just system prompt and initial instruction
        messages = [
            Message(
                role=MessageRole.SYSTEM,
                content=self._safety_filter.get_safety_system_prompt(),
            ),
        ]

        # Add pipeline system prompt
        system_prompt = pipeline.get("system_prompt", "")
        if system_prompt:
            sys_substituted = self._template_engine.substitute(system_prompt, context)
            messages.append(
                Message(
                    role=MessageRole.SYSTEM,
                    content=sys_substituted,
                )
            )

        # Add initial prompt as user instruction
        messages.append(
            Message(
                role=MessageRole.USER,
                content=substituted,
            )
        )

        # Get config
        if config is None:
            config = LLMConfig(
                model=pipeline.get("model", "gpt-4-turbo"),
                temperature=pipeline.get("temperature", 0.7),
                max_tokens=pipeline.get("max_tokens", 200),
                timeout=45,
            )

        try:
            llm_response = await self.llm_service.generate_response(messages, config)

            return PipelineExecutionResult(
                success=True,
                response=llm_response.content,
                llm_response=llm_response,
            )
        except Exception as e:
            return PipelineExecutionResult(
                success=False,
                error=str(e),
            )

    def create_context_from_run(
        self,
        answers: list[dict],
        run_metadata: Optional[dict] = None,
    ) -> dict[str, Any]:
        """Create template context from a survey run.

        Args:
            answers: List of answer records
            run_metadata: Optional run metadata

        Returns:
            Context dictionary for template substitution
        """
        return SurveyResponseFormatter.create_context(
            answers=answers,
            session_info=run_metadata,
        )
