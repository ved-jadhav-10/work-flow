"""SQLAlchemy ORM model for the code_insights table."""

import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from database import Base


class CodeInsight(Base):
    __tablename__ = "code_insights"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    code_snippet = Column(Text, nullable=False)
    language = Column(String, nullable=False, default="python")
    explanation = Column(Text, nullable=True)
    components = Column(JSONB, default=list)
    suggestions = Column(JSONB, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
