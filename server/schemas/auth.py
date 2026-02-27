"""Pydantic schemas for authentication requests and responses."""

from pydantic import BaseModel, EmailStr, Field, field_serializer
from datetime import datetime
from typing import Optional
from uuid import UUID


# ── Requests ──────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class OAuthRequest(BaseModel):
    """Used when frontend sends Google OAuth profile info to create/fetch user."""
    provider: str  # "google"
    email: EmailStr
    name: str
    avatar_url: Optional[str] = None


# ── Responses ─────────────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    id: UUID
    name: str
    email: str
    provider: str
    avatar_url: Optional[str] = None
    created_at: datetime

    @field_serializer("id")
    def serialize_id(self, v: UUID) -> str:
        return str(v)

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    user: UserResponse
    access_token: str
    token_type: str = "bearer"
