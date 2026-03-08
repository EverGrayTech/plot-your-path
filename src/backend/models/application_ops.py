"""Application operations tracking model."""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func

from backend.database import Base


class ApplicationOps(Base):
    """Operational metadata for executing an active application process."""

    __tablename__ = "application_ops"

    id = Column(Integer, primary_key=True, autoincrement=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False, unique=True, index=True)
    applied_at = Column(DateTime, nullable=True)
    deadline_at = Column(DateTime, nullable=True, index=True)
    source = Column(String, nullable=True)
    recruiter_contact = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    next_action_at = Column(DateTime, nullable=True, index=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        index=True,
    )
