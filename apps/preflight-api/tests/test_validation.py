"""Unit tests for validation utilities."""
import pytest

from app.utils.validation import (
    ValidationError,
    sanitize_string,
    sanitize_html_content,
    validate_uuid,
    validate_email,
    validate_slug,
    validate_json_safe,
    validate_content_length,
    validate_form_answers,
    redact_pii,
)


class TestSanitizeString:
    """Tests for sanitize_string function."""

    def test_strips_whitespace(self):
        """Should strip leading/trailing whitespace."""
        assert sanitize_string("  hello  ") == "hello"
        assert sanitize_string("\n\thello\t\n") == "hello"

    def test_limits_length(self):
        """Should limit string length."""
        long_string = "a" * 100
        result = sanitize_string(long_string, max_length=50)
        assert len(result) == 50

    def test_escapes_html(self):
        """Should escape HTML entities."""
        assert sanitize_string("<script>alert('xss')</script>") == "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;"
        assert sanitize_string('Hello & "World"') == "Hello &amp; &quot;World&quot;"

    def test_handles_non_string(self):
        """Should convert non-strings to strings."""
        assert sanitize_string(123) == "123"
        assert sanitize_string(None) == "None"


class TestSanitizeHtmlContent:
    """Tests for sanitize_html_content function."""

    def test_removes_script_tags(self):
        """Should remove script tags and content."""
        html = '<p>Hello</p><script>alert("xss")</script><p>World</p>'
        result = sanitize_html_content(html)
        assert "<script>" not in result
        assert "alert" not in result
        assert "<p>Hello</p>" in result

    def test_removes_event_handlers(self):
        """Should remove event handlers."""
        html = '<img src="x" onerror="alert(\'xss\')">'
        result = sanitize_html_content(html)
        assert "onerror" not in result

    def test_removes_javascript_urls(self):
        """Should remove javascript: URLs."""
        html = '<a href="javascript:alert(\'xss\')">Click</a>'
        result = sanitize_html_content(html)
        assert "javascript:" not in result


class TestValidateUuid:
    """Tests for validate_uuid function."""

    def test_validates_valid_uuid(self):
        """Should validate and return UUID for valid string."""
        result = validate_uuid("550e8400-e29b-41d4-a716-446655440000")
        assert str(result) == "550e8400-e29b-41d4-a716-446655440000"

    def test_rejects_invalid_uuid(self):
        """Should raise ValidationError for invalid UUID."""
        with pytest.raises(ValidationError) as exc_info:
            validate_uuid("not-a-uuid")
        assert "Invalid UUID" in str(exc_info.value)

    def test_uses_custom_field_name(self):
        """Should use custom field name in error."""
        with pytest.raises(ValidationError) as exc_info:
            validate_uuid("invalid", field_name="run_id")
        assert exc_info.value.field == "run_id"


class TestValidateEmail:
    """Tests for validate_email function."""

    def test_validates_valid_email(self):
        """Should validate valid email formats."""
        assert validate_email("user@example.com") == "user@example.com"
        assert validate_email("USER@EXAMPLE.COM") == "user@example.com"  # Lowercased
        assert validate_email("user.name+tag@example.co.uk") == "user.name+tag@example.co.uk"

    def test_rejects_invalid_email(self):
        """Should raise ValidationError for invalid email."""
        with pytest.raises(ValidationError):
            validate_email("not-an-email")
        with pytest.raises(ValidationError):
            validate_email("missing@domain")
        with pytest.raises(ValidationError):
            validate_email("@nodomain.com")


class TestValidateSlug:
    """Tests for validate_slug function."""

    def test_validates_valid_slug(self):
        """Should validate valid slugs."""
        assert validate_slug("hello-world") == "hello-world"
        assert validate_slug("test123") == "test123"
        assert validate_slug("UPPERCASE") == "uppercase"  # Lowercased

    def test_rejects_invalid_slug(self):
        """Should raise ValidationError for invalid slugs."""
        with pytest.raises(ValidationError):
            validate_slug("has spaces")
        with pytest.raises(ValidationError):
            validate_slug("special@chars!")
        with pytest.raises(ValidationError):
            validate_slug("--double-dash")


class TestValidateJsonSafe:
    """Tests for validate_json_safe function."""

    def test_validates_simple_values(self):
        """Should pass through simple values."""
        assert validate_json_safe("hello") == "hello"
        assert validate_json_safe(123) == 123
        assert validate_json_safe(True) is True
        assert validate_json_safe(None) is None

    def test_sanitizes_nested_strings(self):
        """Should sanitize strings in nested structures."""
        data = {"name": "  John  ", "tags": ["  tag1  ", "  tag2  "]}
        result = validate_json_safe(data)
        assert result["name"] == "John"
        assert result["tags"] == ["tag1", "tag2"]

    def test_rejects_deeply_nested(self):
        """Should reject deeply nested structures."""
        # Create deeply nested dict
        data = {"level": 0}
        current = data
        for i in range(15):
            current["nested"] = {"level": i + 1}
            current = current["nested"]

        with pytest.raises(ValidationError) as exc_info:
            validate_json_safe(data, max_depth=10)
        assert "too deeply nested" in str(exc_info.value)

    def test_rejects_large_arrays(self):
        """Should reject arrays that are too large."""
        data = list(range(2000))
        with pytest.raises(ValidationError) as exc_info:
            validate_json_safe(data)
        assert "too large" in str(exc_info.value)


class TestValidateContentLength:
    """Tests for validate_content_length function."""

    def test_validates_content_in_range(self):
        """Should pass content within length limits."""
        result = validate_content_length("hello", min_length=1, max_length=100)
        assert result == "hello"

    def test_rejects_too_short(self):
        """Should reject content that is too short."""
        with pytest.raises(ValidationError) as exc_info:
            validate_content_length("", min_length=1)
        assert "too short" in str(exc_info.value)

    def test_rejects_too_long(self):
        """Should reject content that is too long."""
        with pytest.raises(ValidationError) as exc_info:
            validate_content_length("a" * 100, max_length=50)
        assert "too long" in str(exc_info.value)


class TestValidateFormAnswers:
    """Tests for validate_form_answers function."""

    def test_validates_valid_answers(self):
        """Should validate and sanitize form answers."""
        answers = {
            "name": "  John Doe  ",
            "age": 25,
            "preferences": ["option1", "option2"],
        }
        result = validate_form_answers(answers)
        assert result["name"] == "John Doe"
        assert result["age"] == 25
        assert result["preferences"] == ["option1", "option2"]

    def test_rejects_non_dict(self):
        """Should reject non-dict input."""
        with pytest.raises(ValidationError):
            validate_form_answers("not a dict")
        with pytest.raises(ValidationError):
            validate_form_answers([1, 2, 3])

    def test_rejects_too_many_fields(self):
        """Should reject answers with too many fields."""
        answers = {f"field_{i}": i for i in range(150)}
        with pytest.raises(ValidationError) as exc_info:
            validate_form_answers(answers)
        assert "Too many" in str(exc_info.value)

    def test_rejects_invalid_field_names(self):
        """Should reject answers with invalid field names."""
        answers = {"a" * 200: "value"}  # Key too long
        with pytest.raises(ValidationError):
            validate_form_answers(answers)


class TestRedactPii:
    """Tests for redact_pii function."""

    def test_redacts_email(self):
        """Should redact email addresses."""
        text = "Contact me at john.doe@example.com for details"
        result = redact_pii(text)
        assert "[EMAIL REDACTED]" in result
        assert "john.doe@example.com" not in result

    def test_redacts_phone(self):
        """Should redact phone numbers."""
        text = "Call me at 555-123-4567 or 5551234567"
        result = redact_pii(text)
        assert "[PHONE REDACTED]" in result
        assert "555-123-4567" not in result

    def test_redacts_ssn(self):
        """Should redact SSN patterns."""
        text = "My SSN is 123-45-6789"
        result = redact_pii(text)
        assert "[SSN REDACTED]" in result
        assert "123-45-6789" not in result

    def test_redacts_credit_card(self):
        """Should redact credit card patterns."""
        text = "Card: 1234-5678-9012-3456"
        result = redact_pii(text)
        assert "[CARD REDACTED]" in result
        assert "1234-5678-9012-3456" not in result

    def test_preserves_non_pii(self):
        """Should preserve text without PII."""
        text = "Hello, this is a normal message."
        result = redact_pii(text)
        assert result == text
