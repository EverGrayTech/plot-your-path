"""Desirability score result persistence model."""

from sqlalchemy import JSON, Boolean, Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.sql import func

from backend.database import Base


class DesirabilityScoreResult(Base):
    """Persisted desirability score result with per-factor breakdown."""

    __tablename__ = "desirability_score_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False, index=True)
    total_score = Column(Float, nullable=False)
    factor_breakdown = Column(JSON, nullable=False, default=list)
    score_scope = Column(String, nullable=False, default="company")
    fallback_used = Column(Boolean, nullable=False, default=False)
    cache_expires_at = Column(DateTime, nullable=False, server_default=func.now())
    provider = Column(String, nullable=False)
    model = Column(String, nullable=False)
    version = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False, index=True)

    def __repr__(self) -> str:
        """String representation of desirability score result."""
        return (
            "<DesirabilityScoreResult("
            f"id={self.id}, role_id={self.role_id}, total_score={self.total_score:.2f})>"
        )
