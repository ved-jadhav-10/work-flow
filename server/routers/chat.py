"""Chat router — context-aware AI chat with RAG.

All endpoints are scoped to a project and require auth.
Prefix: /api/projects/{project_id}/chat
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from middleware.auth import get_current_user
from models.project import Project
from models.user import User
from schemas.chat import (
    ChatRequest,
    ChatResponse,
    ChatHistoryResponse,
    ChatMessageResponse,
    ContextReference,
)
from services import rag_service

logger = logging.getLogger(__name__)

router = APIRouter()


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_project_or_404(project_id: str, user: User, db: Session) -> Project:
    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.user_id == user.id)
        .first()
    )
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    return project


def _llm_error(exc: Exception) -> HTTPException:
    logger.exception("Chat query failed")
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=f"LLM service unavailable: {exc}",
    )


# ── POST /chat ────────────────────────────────────────────────────────────────

@router.post("", response_model=ChatResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    project_id: str,
    body: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Send a message and receive a context-augmented AI response."""
    project = _get_project_or_404(project_id, current_user, db)

    try:
        result = await rag_service.query_with_context(
            project_id=str(project.id),
            user_query=body.message,
            user_id=str(current_user.id),
            db=db,
        )
    except Exception as exc:
        raise _llm_error(exc)

    return ChatResponse(
        answer=result["answer"],
        context_used=[
            ContextReference(**ref) for ref in result["context_used"]
        ],
        provider=result["provider"],
        latency_ms=result["latency_ms"],
        message_id=result["message_id"],
    )


# ── GET /chat/history ─────────────────────────────────────────────────────────

@router.get("/history", response_model=ChatHistoryResponse)
async def get_history(
    project_id: str,
    limit: int = Query(default=50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve chat history for a project."""
    _get_project_or_404(project_id, current_user, db)

    messages = await rag_service.get_chat_history(
        project_id=project_id,
        db=db,
        limit=limit,
    )

    return ChatHistoryResponse(
        messages=[ChatMessageResponse(**m) for m in messages],
        total=len(messages),
    )
