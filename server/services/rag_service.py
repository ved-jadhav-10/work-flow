"""
RAG Service — orchestrates the full Retrieval-Augmented Generation pipeline.

1. Detect query intent (smart routing)
2. Build an augmented prompt via the context engine
3. Call the LLM with project-aware system prompt
4. Run drift detection on the response
5. Store user + assistant ChatMessage records in Neon
6. Return answer with source attribution, drift warnings, and routing badge
"""

from __future__ import annotations

import logging
import re
from typing import Any

from sqlalchemy.orm import Session

from models.chat_message import ChatMessage
from services.context_engine import build_context_prompt
from services.drift_detector import check_drift
from services.llm_service import get_llm_service
from services.prompts.chat_prompts import CHAT_SYSTEM_PROMPT

logger = logging.getLogger(__name__)


# ── Smart query routing ────────────────────────────────────────────────────────

_LEARNING_RE = re.compile(
    r"\b(summarize|summary|document|pdf|paper|article|concept|reading"
    r"|what (does|is|are) (the |this )?(document|pdf|paper|chapter))\b",
    re.IGNORECASE,
)
_DEVELOPER_RE = re.compile(
    r"\b(code|function|bug|debug|class|method|refactor|error|exception"
    r"|stack.?trace|snippet|algorithm|implementation"
    r"|explain (this |the )?(code|function|class|method|snippet)"
    r"|fix (this |the )?(code|error|bug))\b",
    re.IGNORECASE,
)
_WORKFLOW_RE = re.compile(
    r"\b(task|tasks|to.?do|priority|priorities|deadline|workflow"
    r"|milestone|sprint|backlog|next.?steps?|action.?items?"
    r"|what should i (do|work on)|what do i work on)\b",
    re.IGNORECASE,
)


def _detect_intent(query: str) -> str:
    """
    Detect which module most likely handles this query.

    Returns: 'learning' | 'developer' | 'workflow' | 'rag'
    """
    if _LEARNING_RE.search(query):
        return "learning"
    if _DEVELOPER_RE.search(query):
        return "developer"
    if _WORKFLOW_RE.search(query):
        return "workflow"
    return "rag"


async def query_with_context(
    project_id: str,
    user_query: str,
    user_id: str,
    db: Session,
) -> dict[str, Any]:
    """
    Full RAG pipeline:
      1. Detect query intent (smart routing)
      2. Build context-augmented prompt
      3. Call LLM
      4. Run drift detection
      5. Persist both messages
      6. Return structured response

    Returns {answer, context_used, drift_warnings, routed_module, provider, latency_ms, message_id}
    """
    # ── 1. Smart routing ──────────────────────────────────────────────────
    routed_module = _detect_intent(user_query)
    logger.info("Query routed to module=%s for project=%s", routed_module, project_id)

    # ── 2. Build the augmented prompt ─────────────────────────────────────
    augmented_prompt, context_refs = await build_context_prompt(
        project_id, user_query, db,
    )

    # ── 3. Call the LLM ──────────────────────────────────────────────────
    llm = get_llm_service()
    answer, provider, latency_ms = await llm.generate(
        prompt=augmented_prompt,
        system_prompt=CHAT_SYSTEM_PROMPT,
        temperature=0.4,
        max_tokens=4096,
    )

    # ── 4. Drift detection ────────────────────────────────────────────────
    drift_warnings = await check_drift(project_id, answer, db)

    # ── 5. Persist messages ──────────────────────────────────────────────
    # User message
    user_msg = ChatMessage(
        project_id=project_id,
        role="user",
        content=user_query,
        context_used=[],
        drift_warnings=[],
        routed_module=None,
    )
    db.add(user_msg)
    db.flush()  # get the id without committing

    # Assistant message
    assistant_msg = ChatMessage(
        project_id=project_id,
        role="assistant",
        content=answer,
        context_used=context_refs,
        drift_warnings=drift_warnings,
        routed_module=routed_module,
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    logger.info(
        "RAG query: project=%s module=%s provider=%s latency=%.0fms chunks=%d drift=%d",
        project_id,
        routed_module,
        provider,
        latency_ms,
        len(context_refs),
        len(drift_warnings),
    )

    # ── 6. Return structured response ────────────────────────────────────
    return {
        "answer": answer,
        "context_used": context_refs,
        "drift_warnings": drift_warnings,
        "routed_module": routed_module,
        "provider": provider,
        "latency_ms": round(latency_ms, 1),
        "message_id": str(assistant_msg.id),
    }


async def get_chat_history(
    project_id: str,
    db: Session,
    limit: int = 50,
) -> list[dict]:
    """
    Retrieve chat messages for a project, ordered chronologically.
    """
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.project_id == project_id)
        .order_by(ChatMessage.created_at.asc())
        .limit(limit)
        .all()
    )

    return [
        {
            "id": str(m.id),
            "project_id": str(m.project_id),
            "role": m.role,
            "content": m.content,
            "context_used": m.context_used or [],
            "drift_warnings": m.drift_warnings or [],
            "routed_module": m.routed_module,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m in messages
    ]
