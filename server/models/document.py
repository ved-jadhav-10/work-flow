"""SQLAlchemy ORM model for the documents table."""

import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String, nullable=False)
    file_url = Column(String, nullable=True)
    doc_type = Column(String, nullable=False, default="text")
    raw_text = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    key_concepts = Column(JSONB, default=list)
    implementation_steps = Column(JSONB, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
