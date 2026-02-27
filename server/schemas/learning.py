"""Pydantic schemas for the Learning module (documents, summaries, concepts, steps)."""

from pydantic import BaseModel, Field, field_serializer
from datetime import datetime
from typing import Optional
from uuid import UUID


# ── Concepts ──────────────────────────────────────────────────────────────────

class ConceptItem(BaseModel):
    name: str
    definition: str
    importance: int = Field(ge=1, le=5)
    analogy: Optional[str] = None


# ── Requests ──────────────────────────────────────────────────────────────────

class SummarizeRequest(BaseModel):
    level: str = Field(..., pattern="^(short|detailed|exam-ready)$")


# ── Responses ─────────────────────────────────────────────────────────────────

class DocumentResponse(BaseModel):
    id: UUID
    project_id: UUID
    filename: str
    file_url: Optional[str] = None  # signed URL or storage path
    doc_type: str
    raw_text: Optional[str] = None
    summary: Optional[str] = None
    key_concepts: list[ConceptItem] = []
    implementation_steps: list[str] = []
    created_at: datetime

    @field_serializer("id", "project_id")
    def serialize_uuid(self, v: UUID) -> str:
        return str(v)

    model_config = {"from_attributes": True}


class DocumentListResponse(BaseModel):
    documents: list[DocumentResponse]


class SummaryResponse(BaseModel):
    summary: str
    level: str


class ConceptsResponse(BaseModel):
    concepts: list[ConceptItem]


class StepsResponse(BaseModel):
    steps: list[str]
