"""Shared prompt constants used across all service modules."""

STRICT_JSON_SUFFIX = """

IMPORTANT: Your previous response was not valid JSON.
This time you MUST return ONLY a JSON object. No markdown fences, no commentary,
no text before or after the JSON. Start with { and end with }."""
