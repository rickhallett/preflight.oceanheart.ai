"""Safety filters and guardrails for coaching conversations."""

import re
from dataclasses import dataclass
from enum import Enum
from typing import Optional


class SafetyViolationType(str, Enum):
    """Types of safety violations."""

    MEDICAL_ADVICE = "medical_advice"
    PERSONAL_INFO = "personal_info"
    HARMFUL_CONTENT = "harmful_content"
    OFF_TOPIC = "off_topic"
    NONE = "none"


@dataclass
class SafetyCheckResult:
    """Result of a safety check."""

    is_safe: bool
    violation_type: SafetyViolationType
    message: Optional[str] = None
    redacted_content: Optional[str] = None


class SafetyFilter:
    """Safety filter for coaching conversations.

    Implements content filtering to:
    - Prevent medical diagnosis or treatment advice
    - Detect and optionally redact personal information
    - Block harmful or inappropriate content
    - Keep conversations on topic
    """

    # Medical terms that suggest diagnosis/treatment
    MEDICAL_DIAGNOSIS_PATTERNS = [
        r"\b(diagnos(?:e|is|ing)|diagnosed)\b",
        r"\b(prescrib(?:e|ed|ing)|prescription)\b",
        r"\b(treat(?:ment|ing)?|treated)\b.*\b(condition|disease|illness)\b",
        r"\b(you (have|should take|need to take))\b.*\b(medication|medicine|drug)\b",
        r"\b(clinical (recommendation|advice))\b",
    ]

    # Personal information patterns
    PERSONAL_INFO_PATTERNS = [
        r"\b(\d{3}[-.]?\d{3}[-.]?\d{4})\b",  # Phone numbers
        r"\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b",  # Email
        r"\b(\d{3}[-]?\d{2}[-]?\d{4})\b",  # SSN
        r"\b(\d{16})\b",  # Credit card (basic)
    ]

    # Harmful content patterns
    HARMFUL_PATTERNS = [
        r"\b(kill|harm|hurt|injure)\s+(yourself|myself|themselves)\b",
        r"\b(suicide|self[- ]harm)\b",
    ]

    # Professional boundary system prompt
    SAFETY_SYSTEM_PROMPT = """You are a collaborative AI coach for healthcare professionals.

CRITICAL RULES YOU MUST FOLLOW:
1. NEVER provide medical diagnosis or treatment recommendations
2. NEVER suggest specific medications or clinical interventions
3. NEVER retain or ask for personal identifying information
4. ALWAYS redirect medical questions to appropriate professionals
5. ALWAYS maintain professional coaching boundaries

Your role is to ask thoughtful questions that help professionals explore their challenges, NOT to provide medical advice.

If the user asks for medical advice, respond with:
"I'm not able to provide medical advice or diagnoses. I'm here to help you explore your professional challenges and growth through coaching questions. Would you like to discuss how to approach this challenge from a professional development perspective?"

If you detect concerning content about self-harm, respond with:
"I want to make sure you're okay. If you're experiencing thoughts of self-harm, please reach out to a mental health professional or crisis helpline immediately. In the US, you can call 988 for the Suicide & Crisis Lifeline."
"""

    def __init__(self):
        """Initialize safety filter with compiled patterns."""
        self._medical_patterns = [
            re.compile(p, re.IGNORECASE) for p in self.MEDICAL_DIAGNOSIS_PATTERNS
        ]
        self._personal_patterns = [
            re.compile(p, re.IGNORECASE) for p in self.PERSONAL_INFO_PATTERNS
        ]
        self._harmful_patterns = [
            re.compile(p, re.IGNORECASE) for p in self.HARMFUL_PATTERNS
        ]

    def check_input(self, content: str) -> SafetyCheckResult:
        """Check user input for safety concerns.

        Args:
            content: User message content

        Returns:
            SafetyCheckResult with violation details
        """
        # Check for harmful content first (highest priority)
        for pattern in self._harmful_patterns:
            if pattern.search(content):
                return SafetyCheckResult(
                    is_safe=False,
                    violation_type=SafetyViolationType.HARMFUL_CONTENT,
                    message="Content flagged for safety review",
                )

        # Check for personal information
        for pattern in self._personal_patterns:
            match = pattern.search(content)
            if match:
                # Redact the personal info but allow the message
                redacted = pattern.sub("[REDACTED]", content)
                return SafetyCheckResult(
                    is_safe=True,
                    violation_type=SafetyViolationType.PERSONAL_INFO,
                    message="Personal information detected and redacted",
                    redacted_content=redacted,
                )

        return SafetyCheckResult(
            is_safe=True,
            violation_type=SafetyViolationType.NONE,
        )

    def check_output(self, content: str) -> SafetyCheckResult:
        """Check AI output for policy violations.

        Args:
            content: AI response content

        Returns:
            SafetyCheckResult with violation details
        """
        # Check for medical diagnosis language
        for pattern in self._medical_patterns:
            if pattern.search(content):
                return SafetyCheckResult(
                    is_safe=False,
                    violation_type=SafetyViolationType.MEDICAL_ADVICE,
                    message="Response contains potential medical advice",
                )

        return SafetyCheckResult(
            is_safe=True,
            violation_type=SafetyViolationType.NONE,
        )

    def get_safety_system_prompt(self) -> str:
        """Get the safety-focused system prompt.

        Returns:
            System prompt with safety guidelines
        """
        return self.SAFETY_SYSTEM_PROMPT

    def sanitize_input(self, content: str) -> str:
        """Sanitize user input by redacting personal information.

        Args:
            content: User input

        Returns:
            Sanitized content
        """
        result = content
        for pattern in self._personal_patterns:
            result = pattern.sub("[REDACTED]", result)
        return result

    def get_fallback_response(
        self, violation_type: SafetyViolationType
    ) -> Optional[str]:
        """Get a fallback response for a violation type.

        Args:
            violation_type: Type of violation detected

        Returns:
            Safe fallback response or None
        """
        fallbacks = {
            SafetyViolationType.MEDICAL_ADVICE: (
                "I appreciate you sharing that with me. As an AI coach, I'm not able to "
                "provide medical advice or diagnoses. However, I'd be happy to help you "
                "explore this from a professional development perspective. What aspects "
                "of this situation feel most challenging for you professionally?"
            ),
            SafetyViolationType.HARMFUL_CONTENT: (
                "I want to make sure you're okay. If you're experiencing thoughts of "
                "self-harm, please reach out to a mental health professional or crisis "
                "helpline immediately. In the US, you can call 988 for the Suicide & "
                "Crisis Lifeline. Would you like to talk about what's on your mind in "
                "a different way?"
            ),
            SafetyViolationType.OFF_TOPIC: (
                "I'd like to bring our conversation back to your professional "
                "development goals. What aspect of your AI readiness journey would "
                "you like to explore?"
            ),
        }
        return fallbacks.get(violation_type)
