"""Interview stage timeline event model."""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func

from backend.database import Base


class InterviewStageEvent(Base):
    """Timestamped interview stage progression entry for a role."""

    __tablename__ = "interview_stage_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False, index=True)
    stage = Column(String, nullable=False, index=True)
    notes = Column(Text, nullable=True)
    occurred_at = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
