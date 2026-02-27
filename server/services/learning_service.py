"""
Learning service — orchestrates LLM calls for summarisation, concept
extraction, and implementation-step generation.

Every function:
1. Picks the right system prompt
2. Calls the LLM
3. Parses the JSON response (retries once on malformed JSON)
4. Returns a typed result
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any

from services.llm_service import LLMService, get_llm_service
from services.prompts.learning_prompts import (
    SUMMARIZE_SHORT,
    SUMMARIZE_DETAILED,
    SUMMARIZE_EXAM,
    EXTRACT_CONCEPTS,
    IMPLEMENTATION_STEPS,
    STRICT_JSON_SUFFIX,
)

logger = logging.getLogger(__name__)

_SUMMARY_PROMPTS = {
    "short": SUMMARIZE_SHORT,
    "detailed": SUMMARIZE_DETAILED,
    "exam-ready": SUMMARIZE_EXAM,
}


# ── JSON helpers ──────────────────────────────────────────────────────────────

def _clean_json(raw: str) -> str:
    """Strip markdown code fences and leading/trailing whitespace."""
    raw = raw.strip()
    # Remove ```json ... ``` wrapping
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return raw.strip()


def _parse_json(raw: str) -> dict[str, Any]:
    return json.loads(_clean_json(raw))


async def _llm_json(
    llm: LLMService,
    prompt: str,
    system_prompt: str,
) -> dict[str, Any]:
    """Call LLM, parse JSON. On failure, retry once with stricter instructions."""
    text, provider, latency = await llm.generate(prompt, system_prompt)
    try:
        return _parse_json(text)
    except json.JSONDecodeError:
        logger.warning("Malformed JSON from %s — retrying with strict suffix", provider)
        text2, provider2, latency2 = await llm.generate(
            prompt,
            system_prompt + STRICT_JSON_SUFFIX,
        )
        return _parse_json(text2)  # let it raise if still bad


# ── Public API ────────────────────────────────────────────────────────────────

async def summarise(raw_text: str, level: str) -> str:
    """Return a summary string for the given level."""
    system_prompt = _SUMMARY_PROMPTS.get(level, SUMMARIZE_SHORT)
    llm = get_llm_service()

    # Trim very long texts to ~12 000 words to stay within context window
    words = raw_text.split()
    if len(words) > 12_000:
        raw_text = " ".join(words[:12_000]) + "\n\n[Text truncated for summarisation]"

    data = await _llm_json(llm, raw_text, system_prompt)
    return data.get("summary", str(data))


async def extract_concepts(raw_text: str) -> list[dict]:
    """Return a list of concept dicts."""
    llm = get_llm_service()
    words = raw_text.split()
    if len(words) > 12_000:
        raw_text = " ".join(words[:12_000])

    data = await _llm_json(llm, raw_text, EXTRACT_CONCEPTS)
    return data.get("concepts", [])


async def generate_steps(raw_text: str) -> list[str]:
    """Return a list of implementation step strings."""
    llm = get_llm_service()
    words = raw_text.split()
    if len(words) > 12_000:
        raw_text = " ".join(words[:12_000])

    data = await _llm_json(llm, raw_text, IMPLEMENTATION_STEPS)
    return data.get("steps", [])
