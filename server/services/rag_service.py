"""
RAG Service — orchestrates the full Retrieval-Augmented Generation pipeline.

1. Build an augmented prompt via the context engine
2. Call the LLM with project-aware system prompt
3. Store user + assistant ChatMessage records in Neon
4. Return answer with source attribution
"""

from __future__ import annotations

import logging
from typing import Any

from sqlalchemy.orm import Session

from models.chat_message import ChatMessage
from services.context_engine import build_context_prompt
from services.llm_service import get_llm_service
from services.prompts.chat_prompts import CHAT_SYSTEM_PROMPT

logger = logging.getLogger(__name__)


async def query_with_context(
    project_id: str,
    user_query: str,
    user_id: str,
    db: Session,
) -> dict[str, Any]:
    """
    Full RAG pipeline:
      1. Build context-augmented prompt
      2. Call LLM
      3. Persist both messages
      4. Return structured response

    Returns {answer, context_used, provider, latency_ms, message_id}
    """
    # ── 1. Build the augmented prompt ─────────────────────────────────────
    augmented_prompt, context_refs = await build_context_prompt(
        project_id, user_query, db,
    )

    # ── 2. Call the LLM ──────────────────────────────────────────────────
    llm = get_llm_service()
    answer, provider, latency_ms = await llm.generate(
        prompt=augmented_prompt,
        system_prompt=CHAT_SYSTEM_PROMPT,
        temperature=0.4,
        max_tokens=4096,
    )

    # ── 3. Persist messages ──────────────────────────────────────────────
    # User message
    user_msg = ChatMessage(
        project_id=project_id,
        role="user",
        content=user_query,
        context_used=[],
    )
    db.add(user_msg)
    db.flush()  # get the id without committing

    # Assistant message
    assistant_msg = ChatMessage(
        project_id=project_id,
        role="assistant",
        content=answer,
        context_used=context_refs,
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    logger.info(
        "RAG query: project=%s provider=%s latency=%.0fms chunks=%d",
        project_id,
        provider,
        latency_ms,
        len(context_refs),
    )

    # ── 4. Return structured response ────────────────────────────────────
    return {
        "answer": answer,
        "context_used": context_refs,
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
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m in messages
    ]
