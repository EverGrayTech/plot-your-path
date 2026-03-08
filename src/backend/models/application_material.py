"""Application material persistence model."""

from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.sql import func

from backend.database import Base


class ApplicationMaterial(Base):
    """Persisted generated application artifact for a role."""

    __tablename__ = "application_materials"

    id = Column(Integer, primary_key=True, autoincrement=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False, index=True)
    artifact_type = Column(String, nullable=False, index=True)
    version = Column(Integer, nullable=False)
    content_path = Column(String, nullable=False)
    questions = Column(JSON, nullable=True)
    sections = Column(JSON, nullable=True)
    provider = Column(String, nullable=False)
    model = Column(String, nullable=False)
    prompt_version = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False, index=True)

    def __repr__(self) -> str:
        """String representation of ApplicationMaterial."""
        return (
            f"<ApplicationMaterial(id={self.id}, role_id={self.role_id}, "
            f"artifact_type='{self.artifact_type}', version={self.version})>"
        )
