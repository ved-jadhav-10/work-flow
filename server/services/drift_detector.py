"""
Drift Detector — checks whether an LLM response contradicts project constraints.

Two detection layers:
1. Rule-based  — keyword/taxonomy matching (fast, no extra LLM call)
2. LLM-based   — ask Gemini Flash to check for semantic constraint violations

Returns a list of DriftWarning dicts:
  {type, severity, description, constraint_violated}
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any

from sqlalchemy.orm import Session

from models.project import Project
from services.llm_service import get_llm_service

logger = logging.getLogger(__name__)

# ── Technology taxonomy ───────────────────────────────────────────────────────
# Maps category → list of tech names (all lowercase for matching)

TECH_TAXONOMY: dict[str, list[str]] = {
    "frontend_frameworks": [
        "react", "vue", "angular", "svelte", "solid", "qwik", "preact",
        "ember", "backbone", "knockout", "mithril",
    ],
    "backend_frameworks": [
        "fastapi", "django", "flask", "express", "nestjs", "spring",
        "rails", "laravel", "gin", "fiber", "hapi", "koa", "actix",
        "axum", "phoenix",
    ],
    "languages": [
        "python", "javascript", "typescript", "java", "kotlin", "go",
        "rust", "c#", "c++", "ruby", "php", "swift", "dart", "scala",
        "clojure", "elixir", "haskell",
    ],
    "databases": [
        "postgresql", "postgres", "mysql", "sqlite", "mongodb", "redis",
        "dynamodb", "cassandra", "cockroachdb", "supabase", "firebase",
        "planetscale", "fauna", "neo4j", "elasticsearch",
    ],
    "css_frameworks": [
        "tailwind", "tailwindcss", "bootstrap", "bulma", "material-ui",
        "mui", "chakra", "ant design", "antd", "shadcn", "daisyui",
        "mantine",
    ],
    "ml_frameworks": [
        "tensorflow", "pytorch", "keras", "jax", "scikit-learn",
        "sklearn", "xgboost", "lightgbm", "huggingface", "langchain",
        "llamaindex", "onnx",
    ],
    "cloud_providers": [
        "aws", "azure", "gcp", "google cloud", "vercel", "netlify",
        "heroku", "fly.io", "railway", "render",
    ],
    "mobile_frameworks": [
        "react native", "flutter", "ionic", "xamarin", "capacitor",
        "expo",
    ],
    "testing": [
        "jest", "pytest", "mocha", "vitest", "cypress", "playwright",
        "selenium", "junit", "rspec",
    ],
    "state_management": [
        "redux", "zustand", "mobx", "recoil", "jotai", "pinia", "vuex",
        "ngrx",
    ],
    "build_tools": [
        "webpack", "vite", "parcel", "esbuild", "turbopack", "rollup",
        "snowpack",
    ],
    "deployment": [
        "docker", "kubernetes", "k8s", "terraform", "ansible",
        "github actions", "gitlab ci", "jenkins", "circleci",
    ],
}

# Flat lookup: tech_name_lower → category
_TECH_CATEGORY: dict[str, str] = {
    tech: category
    for category, techs in TECH_TAXONOMY.items()
    for tech in techs
}


# ── Helpers ───────────────────────────────────────────────────────────────────

def _extract_techs_from_text(text: str) -> set[str]:
    """Return all taxonomy tech names found in *text* (case-insensitive)."""
    lower = text.lower()
    found: set[str] = set()
    for tech in _TECH_CATEGORY:
        # word-boundary match to avoid "go" inside "algorithm"
        if re.search(r"\b" + re.escape(tech) + r"\b", lower):
            found.add(tech)
    return found


def _rule_based_check(
    constraints: list[str],
    llm_response: str,
) -> list[dict[str, Any]]:
    """
    For each tech category:
      - collect techs that are explicitly allowed by any constraint
      - if the LLM response mentions a *different* tech in the same category → flag it

    Returns a list of partial DriftWarning dicts.
    """
    warnings: list[dict[str, Any]] = []

    # Build: category → set of allowed techs (found in any constraint string)
    allowed_per_category: dict[str, set[str]] = {}
    constraint_text = " ".join(constraints).lower()
    for tech, category in _TECH_CATEGORY.items():
        if re.search(r"\b" + re.escape(tech) + r"\b", constraint_text):
            allowed_per_category.setdefault(category, set()).add(tech)

    if not allowed_per_category:
        # No specific techs in constraints → can't do rule-based check
        return []

    response_techs = _extract_techs_from_text(llm_response)

    for tech in response_techs:
        category = _TECH_CATEGORY[tech]
        if category not in allowed_per_category:
            continue  # no constraint on this category

        allowed = allowed_per_category[category]
        if tech not in allowed:
            # Find the relevant constraint(s)
            violated_constraints = [
                c for c in constraints
                if any(
                    re.search(r"\b" + re.escape(a) + r"\b", c.lower())
                    for a in allowed
                )
            ]
            constraint_str = violated_constraints[0] if violated_constraints else ", ".join(allowed)

            warnings.append({
                "type": "technology_mismatch",
                "severity": "high",
                "description": (
                    f"Response suggests '{tech}' but project is constrained to "
                    f"'{', '.join(allowed)}' in the {category.replace('_', ' ')} category."
                ),
                "constraint_violated": constraint_str,
            })

    return warnings


DRIFT_CHECK_SYSTEM_PROMPT = """You are a strict compliance auditor for a software project.
Your job is to determine whether an AI assistant's response violates any of the project's stated constraints.
Constraints are rules the team must follow (technology choices, architecture decisions, coding standards, etc.).

Respond ONLY with valid JSON — no markdown, no commentary.
Format:
{
  "has_violations": true | false,
  "violations": [
    {
      "type": "technology_mismatch | architecture_change | language_violation | process_violation | other",
      "severity": "high | medium | low",
      "description": "Clear, one-sentence explanation of what was violated.",
      "constraint_violated": "The exact or paraphrased constraint that was violated."
    }
  ]
}
If there are no violations, return {"has_violations": false, "violations": []}."""


async def _llm_based_check(
    constraints: list[str],
    llm_response: str,
) -> list[dict[str, Any]]:
    """
    Ask the LLM to perform a semantic constraint-violation check.
    Returns a list of DriftWarning dicts (may be empty).
    """
    if not constraints:
        return []

    constraints_block = "\n".join(f"- {c}" for c in constraints)
    prompt = (
        f"Project constraints:\n{constraints_block}\n\n"
        f"AI response to evaluate:\n{llm_response[:3000]}\n\n"
        "Does the AI response violate any of the constraints listed above? "
        "Respond using the specified JSON format."
    )

    llm = get_llm_service()
    try:
        raw, _, _ = await llm.generate(
            prompt=prompt,
            system_prompt=DRIFT_CHECK_SYSTEM_PROMPT,
            temperature=0.0,
            max_tokens=1024,
        )

        # Strip possible markdown fences
        clean = raw.strip()
        if clean.startswith("```"):
            clean = re.sub(r"^```[a-z]*\n?", "", clean).rstrip("`").strip()

        data = json.loads(clean)
        if data.get("has_violations") and data.get("violations"):
            return data["violations"]
    except json.JSONDecodeError as exc:
        logger.warning("Drift LLM response was not valid JSON: %s", exc)
    except Exception as exc:
        logger.warning("Drift LLM check failed: %s", exc)

    return []


# ── Public API ────────────────────────────────────────────────────────────────

async def check_drift(
    project_id: str,
    llm_response: str,
    db: Session,
) -> list[dict[str, Any]]:
    """
    Run both rule-based and LLM-based drift detection.

    Returns a deduplicated list of DriftWarning dicts:
      [{type, severity, description, constraint_violated}]
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project or not project.constraints:
        return []

    constraints: list[str] = project.constraints or []

    # ── Layer 1: rule-based ───────────────────────────────────────────────
    rule_warnings = _rule_based_check(constraints, llm_response)

    # ── Layer 2: LLM-based ────────────────────────────────────────────────
    llm_warnings = await _llm_based_check(constraints, llm_response)

    # Merge — deduplicate by description prefix (first 60 chars)
    seen: set[str] = {w["description"][:60] for w in rule_warnings}
    merged = list(rule_warnings)
    for w in llm_warnings:
        key = w.get("description", "")[:60]
        if key not in seen:
            seen.add(key)
            # Normalise fields
            merged.append({
                "type": w.get("type", "other"),
                "severity": w.get("severity", "medium"),
                "description": w.get("description", "Constraint violation detected."),
                "constraint_violated": w.get("constraint_violated", ""),
            })

    if merged:
        logger.info(
            "Drift detected: project=%s warnings=%d", project_id, len(merged)
        )

    return merged
