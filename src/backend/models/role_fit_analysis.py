"""Role fit-analysis persistence model."""

from sqlalchemy import JSON, Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func

from backend.database import Base


class RoleFitAnalysis(Base):
    """
    Persisted fit analysis result for a role.

    Attributes:
        id: Primary key
        role_id: Foreign key to roles table
        fit_score: Deterministic fit score (0-100)
        recommendation: Canonical recommendation (go/maybe/no-go)
        covered_required_skills: Required skills found in candidate profile
        missing_required_skills: Required skills not found in candidate profile
        covered_preferred_skills: Preferred skills found in candidate profile
        missing_preferred_skills: Preferred skills not found in candidate profile
        rationale: Concise explanation for recommendation
        provider: LLM provider used for rationale generation
        model: LLM model used for rationale generation
        version: Scoring/prompt version marker
        created_at: Timestamp when analysis was generated
    """

    __tablename__ = "role_fit_analyses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False, index=True)
    fit_score = Column(Integer, nullable=False)
    recommendation = Column(String, nullable=False, index=True)
    covered_required_skills = Column(JSON, nullable=False, default=list)
    adjacent_required_skills = Column(JSON, nullable=False, default=list)
    missing_required_skills = Column(JSON, nullable=False, default=list)
    covered_preferred_skills = Column(JSON, nullable=False, default=list)
    adjacent_preferred_skills = Column(JSON, nullable=False, default=list)
    missing_preferred_skills = Column(JSON, nullable=False, default=list)
    rationale = Column(Text, nullable=False)
    rationale_citations = Column(JSON, nullable=False, default=list)
    unsupported_claims = Column(JSON, nullable=False, default=list)
    fallback_used = Column(Boolean, nullable=False, default=False)
    confidence_label = Column(String, nullable=False, default="high")
    provider = Column(String, nullable=False)
    model = Column(String, nullable=False)
    version = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False, index=True)

    def __repr__(self) -> str:
        """String representation of RoleFitAnalysis."""
        return (
            f"<RoleFitAnalysis(id={self.id}, role_id={self.role_id}, fit_score={self.fit_score}, "
            f"recommendation='{self.recommendation}')>"
        )
