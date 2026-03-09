"""Outcome event model for downstream application lifecycle feedback."""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func

from backend.database import Base


class OutcomeEvent(Base):
    """Persisted downstream outcome event linked to role, artifacts, and signals."""

    __tablename__ = "outcome_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False, index=True)
    event_type = Column(String, nullable=False, index=True)
    occurred_at = Column(DateTime, nullable=False, index=True)
    notes = Column(Text, nullable=True)
    fit_analysis_id = Column(Integer, ForeignKey("role_fit_analyses.id"), nullable=True, index=True)
    desirability_score_id = Column(
        Integer,
        ForeignKey("desirability_score_results.id"),
        nullable=True,
        index=True,
    )
    application_material_id = Column(
        Integer,
        ForeignKey("application_materials.id"),
        nullable=True,
        index=True,
    )
    model_family = Column(String, nullable=True, index=True)
    model = Column(String, nullable=True)
    prompt_version = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False, index=True)

    def __repr__(self) -> str:
        """String representation of OutcomeEvent."""
        return (
            f"<OutcomeEvent(id={self.id}, role_id={self.role_id}, "
            f"event_type='{self.event_type}', occurred_at='{self.occurred_at}')>"
        )
