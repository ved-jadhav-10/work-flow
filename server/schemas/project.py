"""Pydantic schemas for project CRUD requests and responses."""

from pydantic import BaseModel, Field, field_serializer
from datetime import datetime
from typing import Optional
from uuid import UUID


# ── Requests ──────────────────────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    goal: str = Field(default="", max_length=2000)
    constraints: list[str] = Field(default_factory=list)


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    goal: Optional[str] = Field(None, max_length=2000)
    constraints: Optional[list[str]] = None
    decisions: Optional[list[str]] = None
    open_questions: Optional[list[str]] = None


# ── Responses ─────────────────────────────────────────────────────────────────

class ProjectResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    goal: str
    constraints: list[str]
    decisions: list[str]
    open_questions: list[str]
    created_at: datetime
    updated_at: datetime
    # Aggregates (injected by the router, not from ORM directly)
    document_count: int = 0
    task_count: int = 0
    insight_count: int = 0

    @field_serializer("id", "user_id")
    def serialize_uuid(self, v: UUID) -> str:
        return str(v)

    model_config = {"from_attributes": True}


class ProjectListResponse(BaseModel):
    projects: list[ProjectResponse]
