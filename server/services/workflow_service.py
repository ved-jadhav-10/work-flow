"""
Workflow service — orchestrates LLM calls for task extraction from
meeting transcripts and email threads.
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any

from services.llm_service import get_llm_service
from services.prompts.workflow_prompts import EXTRACT_TASKS, ANALYZE_TASKS, STRICT_JSON_SUFFIX

logger = logging.getLogger(__name__)

MAX_CHARS = 20_000  # ~5 000 tokens — large enough for a long transcript


# ── Helpers ───────────────────────────────────────────────────────────────────

def _truncate_text(text: str) -> tuple[str, bool]:
    """Return (possibly-truncated text, was_truncated)."""
    if len(text) <= MAX_CHARS:
        return text, False
    truncated = text[:MAX_CHARS] + "\n\n[... text truncated for analysis ...]"
    logger.info("Input text truncated from %d → %d chars", len(text), MAX_CHARS)
    return truncated, True


def _clean_json(raw: str) -> str:
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return raw.strip()


def _parse_json_array(raw: str) -> list[dict[str, Any]]:
    data = json.loads(_clean_json(raw))
    if not isinstance(data, list):
        raise ValueError("Expected a JSON array from LLM")
    return data


def _parse_json_object(raw: str) -> dict[str, Any]:
    data = json.loads(_clean_json(raw))
    if not isinstance(data, dict):
        raise ValueError("Expected a JSON object from LLM")
    return data


async def _llm_json_array(prompt: str, system_prompt: str, mode: str = "cloud") -> list[dict[str, Any]]:
    """Call LLM, parse JSON array. Retry once on malformed JSON."""
    llm = get_llm_service(mode)
    text, provider, _ = await llm.generate(prompt, system_prompt)
    try:
        return _parse_json_array(text)
    except (json.JSONDecodeError, ValueError):
        logger.warning("Malformed JSON from %s — retrying with strict suffix", provider)
        text2, _, _ = await llm.generate(prompt, system_prompt + STRICT_JSON_SUFFIX)
        return _parse_json_array(text2)


# ── Public API ────────────────────────────────────────────────────────────────

async def extract_tasks(text: str, source_type: str, mode: str = "cloud") -> dict[str, Any]:
    """
    Extract actionable tasks from a transcript or email thread.

    Returns:
        {
            tasks: list of task dicts with description, priority,
                   assignee_hint, deadline_hint,
            source_type: str,
            truncated: bool,
        }
    """
    text, truncated = _truncate_text(text)
    prompt = (
        f"Source type: {source_type}\n\n"
        f"--- TEXT START ---\n{text}\n--- TEXT END ---"
    )
    raw_tasks = await _llm_json_array(prompt, EXTRACT_TASKS, mode)

    # Normalise and validate each task entry
    tasks: list[dict[str, Any]] = []
    valid_priorities = {"high", "medium", "low"}
    for item in raw_tasks:
        description = str(item.get("description") or "").strip()
        if not description:
            continue  # skip empty entries
        priority = str(item.get("priority") or "medium").lower()
        if priority not in valid_priorities:
            priority = "medium"
        tasks.append(
            {
                "description": description,
                "priority": priority,
                "assignee_hint": item.get("assignee_hint") or None,
                "deadline_hint": item.get("deadline_hint") or None,
            }
        )

    logger.info(
        "Extracted %d tasks from %s (truncated=%s)",
        len(tasks),
        source_type,
        truncated,
    )
    return {"tasks": tasks, "source_type": source_type, "truncated": truncated}


async def analyze_tasks(
    tasks: list[dict[str, Any]], mode: str = "cloud"
) -> dict[str, Any]:
    """
    AI-powered analysis of existing tasks: reprioritisation
    recommendations and practical suggestions.
    """
    if not tasks:
        return {"reprioritizations": [], "suggestions": []}

    task_lines = "\n".join(
        f"- [{t['id']}] ({t['priority']}) {t['description']}"
        for t in tasks
    )
    prompt = f"Here are the current pending tasks:\n\n{task_lines}"

    llm = get_llm_service(mode)
    text, provider, _ = await llm.generate(prompt, ANALYZE_TASKS)
    try:
        result = _parse_json_object(text)
    except (json.JSONDecodeError, ValueError):
        logger.warning("Malformed JSON from %s — retrying with strict suffix", provider)
        text2, _, _ = await llm.generate(prompt, ANALYZE_TASKS + STRICT_JSON_SUFFIX)
        result = _parse_json_object(text2)

    logger.info(
        "AI analysis: %d reprioritisations, %d suggestions",
        len(result.get("reprioritizations", [])),
        len(result.get("suggestions", [])),
    )
    return {
        "reprioritizations": result.get("reprioritizations", []),
        "suggestions": result.get("suggestions", []),
    }
