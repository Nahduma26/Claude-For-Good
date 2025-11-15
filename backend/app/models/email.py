from __future__ import annotations

import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Email(Base):
    __tablename__ = "emails"
    __table_args__ = (Index("ix_emails_user_id", "user_id"),)

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    # Existing fields (Microsoft Graph)
    ms_message_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    subject: Mapped[Optional[str]] = mapped_column(String(500))
    sender: Mapped[Optional[str]] = mapped_column(String(255))
    body_plain: Mapped[Optional[str]] = mapped_column(Text)
    body_html: Mapped[Optional[str]] = mapped_column(Text)
    received_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # === Newly Added Fields for Full Functionality ===
    sender_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    sender_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    body_preview: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    body_content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    processed: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")

    conversation_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Classification fields
    category: Mapped[Optional[str]] = mapped_column(String(64))
    urgency: Mapped[Optional[int]] = mapped_column(Integer)
    risk_flag: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    summary: Mapped[Optional[str]] = mapped_column(Text)
    draft_reply: Mapped[Optional[str]] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    user: Mapped["User"] = relationship("User", back_populates="emails")

    embeddings: Mapped[List["Embedding"]] = relationship(
        "Embedding",
        back_populates="email",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    email_actions: Mapped[List["EmailAction"]] = relationship(
        "EmailAction",
        back_populates="email",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def to_dict(self):
        return {
            "id": str(self.id),
            "subject": self.subject,
            "sender_name": self.sender_name,
            "sender_email": self.sender_email,
            "body_preview": self.body_preview,
            "body_content": self.body_content,
            "received_at": self.received_at.isoformat() if self.received_at else None,
            "is_read": self.is_read,
            "processed": self.processed,
            "category": self.category,
            "urgency": self.urgency,
            "risk_flag": self.risk_flag,
            "summary": self.summary,
            "draft_reply": self.draft_reply,
        }
