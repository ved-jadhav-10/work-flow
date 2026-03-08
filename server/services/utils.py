"""Shared utilities for LLM response parsing across service modules."""

from __future__ import annotations

import json
import re
from typing import Any


def clean_json(raw: str) -> str:
    """Strip markdown code fences and surrounding whitespace from an LLM response."""
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return raw.strip()


def parse_json_object(raw: str) -> dict[str, Any]:
    """Parse a JSON object from an LLM response string."""
    data = json.loads(clean_json(raw))
    if not isinstance(data, dict):
        raise ValueError("Expected a JSON object from LLM")
    return data


def parse_json_array(raw: str) -> list[dict[str, Any]]:
    """Parse a JSON array from an LLM response string."""
    data = json.loads(clean_json(raw))
    if not isinstance(data, list):
        raise ValueError("Expected a JSON array from LLM")
    return data
