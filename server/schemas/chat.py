"""Pydantic schemas for the Chat / RAG module."""

from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_serializer


# ── Sub-types ─────────────────────────────────────────────────────────────────

class ContextReference(BaseModel):
    source_type: str  # document | code | task
    source_id: str
    chunk_preview: str


class DriftWarning(BaseModel):
    type: str          # technology_mismatch | architecture_change | language_violation | other
    severity: str      # high | medium | low
    description: str
    constraint_violated: str


# ── Requests ──────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)


# ── Responses ─────────────────────────────────────────────────────────────────

class ChatMessageResponse(BaseModel):
    id: UUID
    project_id: UUID
    role: str
    content: str
    context_used: list[ContextReference] = Field(default_factory=list)
    drift_warnings: list[DriftWarning] = Field(default_factory=list)
    routed_module: Optional[str] = None
    provider: Optional[str] = None
    latency_ms: Optional[float] = None
    created_at: datetime

    @field_serializer("id", "project_id")
    def serialize_uuid(self, v: UUID) -> str:
        return str(v)

    model_config = {"from_attributes": True}


class ChatResponse(BaseModel):
    """Response payload for POST /chat."""
    answer: str
    context_used: list[ContextReference] = Field(default_factory=list)
    drift_warnings: list[DriftWarning] = Field(default_factory=list)
    routed_module: str = "rag"
    provider: str
    latency_ms: float
    message_id: UUID

    @field_serializer("message_id")
    def serialize_uuid(self, v: UUID) -> str:
        return str(v)


class ChatHistoryResponse(BaseModel):
    messages: list[ChatMessageResponse]
    total: int
