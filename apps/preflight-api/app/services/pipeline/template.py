"""Template engine for prompt variable substitution."""

import re
from typing import Any


class TemplateEngine:
    """Engine for substituting variables in prompt templates.

    Uses Mustache-style {{variable}} syntax for variable substitution.
    """

    # Pattern to match {{variable}} or {{variable.nested}}
    VARIABLE_PATTERN = re.compile(r"\{\{([a-zA-Z_][a-zA-Z0-9_.]*)\}\}")

    @classmethod
    def substitute(cls, template: str, variables: dict[str, Any]) -> str:
        """Substitute variables in a template.

        Args:
            template: Template string with {{variable}} placeholders
            variables: Dictionary of variable values

        Returns:
            Template with variables substituted

        Example:
            >>> TemplateEngine.substitute(
            ...     "Hello {{name}}, your score is {{results.score}}",
            ...     {"name": "Alice", "results": {"score": 95}}
            ... )
            "Hello Alice, your score is 95"
        """

        def replace_var(match: re.Match) -> str:
            var_path = match.group(1)
            value = cls._get_nested_value(variables, var_path)
            if value is None:
                # Keep original placeholder if variable not found
                return match.group(0)
            return cls._format_value(value)

        return cls.VARIABLE_PATTERN.sub(replace_var, template)

    @classmethod
    def extract_variables(cls, template: str) -> list[str]:
        """Extract all variable names from a template.

        Args:
            template: Template string with {{variable}} placeholders

        Returns:
            List of unique variable names found
        """
        matches = cls.VARIABLE_PATTERN.findall(template)
        return list(dict.fromkeys(matches))  # Preserve order, remove duplicates

    @classmethod
    def validate_template(
        cls, template: str, available_vars: list[str]
    ) -> tuple[bool, list[str]]:
        """Validate that all template variables are available.

        Args:
            template: Template string to validate
            available_vars: List of available variable names

        Returns:
            Tuple of (is_valid, missing_vars)
        """
        required = cls.extract_variables(template)
        available_set = set(available_vars)

        # Also include nested paths as valid
        for var in available_vars:
            parts = var.split(".")
            for i in range(1, len(parts) + 1):
                available_set.add(".".join(parts[:i]))

        missing = [v for v in required if v.split(".")[0] not in available_set]
        return len(missing) == 0, missing

    @classmethod
    def _get_nested_value(cls, data: dict[str, Any], path: str) -> Any:
        """Get a nested value from a dictionary using dot notation.

        Args:
            data: Dictionary to search
            path: Dot-separated path (e.g., "results.score")

        Returns:
            Value at path or None if not found
        """
        parts = path.split(".")
        current = data

        for part in parts:
            if isinstance(current, dict):
                current = current.get(part)
            else:
                return None

            if current is None:
                return None

        return current

    @classmethod
    def _format_value(cls, value: Any) -> str:
        """Format a value for inclusion in a prompt.

        Args:
            value: Value to format

        Returns:
            String representation
        """
        if isinstance(value, bool):
            return "yes" if value else "no"
        elif isinstance(value, list):
            if all(isinstance(x, str) for x in value):
                return ", ".join(value)
            return str(value)
        elif isinstance(value, dict):
            # Format dict as key-value pairs
            lines = [f"- {k}: {cls._format_value(v)}" for k, v in value.items()]
            return "\n".join(lines)
        else:
            return str(value)


class SurveyResponseFormatter:
    """Helper for formatting survey responses for LLM consumption."""

    @classmethod
    def format_answers(cls, answers: list[dict]) -> str:
        """Format survey answers into a readable string.

        Args:
            answers: List of answer records with page_id, field_name, value

        Returns:
            Formatted string representation of answers
        """
        if not answers:
            return "No survey responses recorded."

        # Group by page
        pages: dict[str, list[tuple[str, Any]]] = {}
        for answer in answers:
            page = answer.get("page_id", "unknown")
            if page not in pages:
                pages[page] = []
            pages[page].append((answer.get("field_name", ""), answer.get("value")))

        # Format output
        lines = ["Survey Responses:"]
        for page, fields in pages.items():
            lines.append(f"\n{page}:")
            for field_name, value in fields:
                formatted = TemplateEngine._format_value(value)
                lines.append(f"  - {field_name}: {formatted}")

        return "\n".join(lines)

    @classmethod
    def create_context(
        cls,
        answers: list[dict],
        user_info: dict | None = None,
        session_info: dict | None = None,
    ) -> dict[str, Any]:
        """Create a full context dictionary for template substitution.

        Args:
            answers: Survey answers
            user_info: Optional user information
            session_info: Optional session metadata

        Returns:
            Context dictionary with all available variables
        """
        context = {
            "survey_responses": cls.format_answers(answers),
            "answers": {},
        }

        # Add individual answers as nested dict
        for answer in answers:
            page = answer.get("page_id", "unknown")
            field = answer.get("field_name", "")
            value = answer.get("value")

            if page not in context["answers"]:
                context["answers"][page] = {}
            context["answers"][page][field] = value

        # Add user info if provided
        if user_info:
            context["user"] = user_info

        # Add session info if provided
        if session_info:
            context["session"] = session_info

        return context
