"""Pydantic schemas for the Developer Productivity module."""

from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_serializer


# ── Sub-types ─────────────────────────────────────────────────────────────────

class CodeComponent(BaseModel):
    name: str
    purpose: str
    lines: Optional[str] = None


class Bug(BaseModel):
    description: str
    severity: str = Field(..., pattern="^(critical|warning|info)$")
    line_hint: Optional[str] = None
    fix: Optional[str] = None


class Inefficiency(BaseModel):
    description: str
    suggestion: str


# ── Requests ──────────────────────────────────────────────────────────────────

class ExplainRequest(BaseModel):
    code: str = Field(..., min_length=1)
    language: str


class DebugRequest(BaseModel):
    code: str = Field(..., min_length=1)
    language: str


class ReadmeRequest(BaseModel):
    code: str = Field(..., min_length=1)
    language: str
    project_name: Optional[str] = None


# ── Responses ─────────────────────────────────────────────────────────────────

class ExplainResponse(BaseModel):
    id: UUID
    insight_type: str = "explain"
    language: str
    overview: str
    components: list[CodeComponent] = []
    patterns: list[str] = []
    complexity: str = ""
    truncated: bool = False
    created_at: datetime

    @field_serializer("id")
    def serialize_uuid(self, v: UUID) -> str:
        return str(v)

    model_config = {"from_attributes": True}


class DebugResponse(BaseModel):
    id: UUID
    insight_type: str = "debug"
    language: str
    bugs: list[Bug] = []
    edge_cases: list[str] = []
    inefficiencies: list[Inefficiency] = []
    truncated: bool = False
    created_at: datetime

    @field_serializer("id")
    def serialize_uuid(self, v: UUID) -> str:
        return str(v)

    model_config = {"from_attributes": True}


class ReadmeResponse(BaseModel):
    id: UUID
    insight_type: str = "readme"
    language: str
    readme: str
    truncated: bool = False
    created_at: datetime

    @field_serializer("id")
    def serialize_uuid(self, v: UUID) -> str:
        return str(v)

    model_config = {"from_attributes": True}


class CodeInsightListItem(BaseModel):
    id: UUID
    insight_type: str
    language: str
    overview: str  # short description or first line of readme
    created_at: datetime

    @field_serializer("id")
    def serialize_uuid(self, v: UUID) -> str:
        return str(v)

    model_config = {"from_attributes": True}


class CodeInsightListResponse(BaseModel):
    insights: list[CodeInsightListItem]
