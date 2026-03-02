"""Pydantic schemas for the Workflow Module."""

from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_serializer


# ── Requests ──────────────────────────────────────────────────────────────────

class ExtractTasksRequest(BaseModel):
    text: str = Field(..., min_length=1)
    source_type: Literal["transcript", "email"] = "transcript"


class TaskUpdate(BaseModel):
    description: Optional[str] = Field(None, min_length=1)
    priority: Optional[Literal["high", "medium", "low"]] = None
    status: Optional[Literal["pending", "done"]] = None


# ── Responses ─────────────────────────────────────────────────────────────────

class TaskResponse(BaseModel):
    id: UUID
    project_id: UUID
    description: str
    priority: str
    status: str
    source_text: Optional[str] = None
    created_at: datetime

    @field_serializer("id", "project_id")
    def serialize_uuid(self, v: UUID) -> str:
        return str(v)

    model_config = {"from_attributes": True}


class ExtractedTaskItem(BaseModel):
    """One extracted task before it is saved (includes hints)."""
    description: str
    priority: str
    assignee_hint: Optional[str] = None
    deadline_hint: Optional[str] = None


class ExtractTasksResponse(BaseModel):
    tasks: list[TaskResponse]
    extracted_count: int
    truncated: bool = False
    source_type: str


class TaskListResponse(BaseModel):
    tasks: list[TaskResponse]
    total: int
    by_priority: dict[str, int]
    by_status: dict[str, int]
