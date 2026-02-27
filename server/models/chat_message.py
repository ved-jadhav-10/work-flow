"""SQLAlchemy ORM model for the chat_messages table."""

import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from database import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String, nullable=False)        # user | assistant
    content = Column(Text, nullable=False)
    context_used = Column(JSONB, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
