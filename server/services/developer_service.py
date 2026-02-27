"""
Developer service — orchestrates LLM calls for code explanation,
debugging, and README generation.

Storage strategy (uses existing CodeInsight columns without migration):
  - explanation: JSON string  {"type": "explain"|"debug"|"readme", + type-specific fields}
  - components:  JSONB list   (components for explain, bugs for debug, [] for readme)
  - suggestions: JSONB list   (patterns for explain, inefficiencies+edge_cases for debug)
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any

from services.llm_service import get_llm_service
from services.prompts.developer_prompts import (
    EXPLAIN_CODE,
    DEBUG_CODE,
    GENERATE_README,
    STRICT_JSON_SUFFIX,
)

logger = logging.getLogger(__name__)

MAX_LINES = 600  # truncate code beyond this many lines


# ── Helpers ───────────────────────────────────────────────────────────────────

def _truncate_code(code: str) -> tuple[str, bool]:
    """Return (possibly-truncated code, was_truncated)."""
    lines = code.splitlines()
    if len(lines) <= MAX_LINES:
        return code, False
    truncated = (
        "\n".join(lines[:MAX_LINES])
        + f"\n\n# ... [{len(lines) - MAX_LINES} lines truncated for analysis]"
    )
    logger.info("Code truncated from %d → %d lines", len(lines), MAX_LINES)
    return truncated, True


def _clean_json(raw: str) -> str:
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return raw.strip()


def _parse_json(raw: str) -> dict[str, Any]:
    return json.loads(_clean_json(raw))


async def _llm_json(prompt: str, system_prompt: str) -> dict[str, Any]:
    """Call LLM, parse JSON. Retry once with strict suffix on malformed JSON."""
    llm = get_llm_service()
    text, provider, _ = await llm.generate(prompt, system_prompt)
    try:
        return _parse_json(text)
    except json.JSONDecodeError:
        logger.warning("Malformed JSON from %s — retrying with strict suffix", provider)
        text2, _, _ = await llm.generate(prompt, system_prompt + STRICT_JSON_SUFFIX)
        return _parse_json(text2)


# ── Public API ────────────────────────────────────────────────────────────────

async def explain(code: str, language: str) -> dict[str, Any]:
    """
    Return a dict with keys: overview, components, patterns, complexity, truncated.
    Also returns serialised storage fields: explanation_json, components_list, suggestions_list.
    """
    code, truncated = _truncate_code(code)
    prompt = f"Language: {language}\n\n```{language}\n{code}\n```"
    data = await _llm_json(prompt, EXPLAIN_CODE)

    overview = data.get("overview", "")
    components = data.get("components", [])
    patterns = data.get("patterns", [])
    complexity = data.get("complexity", "N/A")

    # Storage payloads
    explanation_json = json.dumps({
        "type": "explain",
        "overview": overview,
        "patterns": patterns,
        "complexity": complexity,
    })
    # Store components as-is; store patterns as suggestions
    suggestions_list = [{"pattern": p} for p in patterns]

    return {
        "overview": overview,
        "components": components,
        "patterns": patterns,
        "complexity": complexity,
        "truncated": truncated,
        # Storage fields
        "_explanation_json": explanation_json,
        "_components_list": components,
        "_suggestions_list": suggestions_list,
    }


async def debug(code: str, language: str) -> dict[str, Any]:
    """
    Return a dict with keys: bugs, edge_cases, inefficiencies, truncated.
    """
    code, truncated = _truncate_code(code)
    prompt = f"Language: {language}\n\n```{language}\n{code}\n```"
    data = await _llm_json(prompt, DEBUG_CODE)

    bugs = data.get("bugs", [])
    edge_cases = data.get("edge_cases", [])
    inefficiencies = data.get("inefficiencies", [])

    # Build a short overview for history
    n_issues = len(bugs)
    overview = (
        f"{n_issues} bug{'s' if n_issues != 1 else ''} found"
        if n_issues
        else "No bugs found"
    )

    explanation_json = json.dumps({
        "type": "debug",
        "overview": overview,
        "edge_cases": edge_cases,
        "inefficiencies": inefficiencies,
    })

    return {
        "bugs": bugs,
        "edge_cases": edge_cases,
        "inefficiencies": inefficiencies,
        "truncated": truncated,
        "_explanation_json": explanation_json,
        "_components_list": bugs,
        "_suggestions_list": [{"inefficiency": i} for i in inefficiencies],
    }


async def generate_readme(code: str, language: str, project_name: str | None) -> dict[str, Any]:
    """
    Return a dict with keys: readme, truncated.
    """
    code, truncated = _truncate_code(code)
    name_hint = f"Project name: {project_name}\n\n" if project_name else ""
    prompt = f"{name_hint}Language: {language}\n\n```{language}\n{code}\n```"
    data = await _llm_json(prompt, GENERATE_README)

    readme = data.get("readme", "")
    overview = (readme.splitlines()[0].lstrip("# ") or "README")[:120]

    explanation_json = json.dumps({
        "type": "readme",
        "overview": overview,
        "readme": readme,
    })

    return {
        "readme": readme,
        "truncated": truncated,
        "_explanation_json": explanation_json,
        "_components_list": [],
        "_suggestions_list": [],
    }


# ── History helpers ───────────────────────────────────────────────────────────

def parse_insight(explanation_json: str | None) -> dict[str, Any]:
    """Deserialise the explanation JSON stored in the DB."""
    if not explanation_json:
        return {"type": "explain", "overview": ""}
    try:
        return json.loads(explanation_json)
    except (json.JSONDecodeError, TypeError):
        return {"type": "explain", "overview": str(explanation_json)[:120]}
