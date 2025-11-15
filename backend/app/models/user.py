from __future__ import annotations

import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    microsoft_user_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    access_token: Mapped[Optional[str]] = mapped_column(Text)
    refresh_token: Mapped[Optional[str]] = mapped_column(Text)
    token_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    tone_preference: Mapped[Optional[str]] = mapped_column(String(64))
    reply_length_preference: Mapped[Optional[str]] = mapped_column(String(64))
    course_policies: Mapped[Optional[dict]] = mapped_column(JSONB)
    signature: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    emails: Mapped[List["Email"]] = relationship(
        "Email",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    preferences: Mapped[Optional["Preference"]] = relationship(
        "Preference",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
        uselist=False,
    )
    daily_digests: Mapped[List["DailyDigest"]] = relationship(
        "DailyDigest",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
