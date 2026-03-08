"""Career evidence persistence model."""

from sqlalchemy import JSON, Column, Date, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from backend.database import Base


class CareerEvidence(Base):
    """Minimal, source-agnostic evidence unit for downstream retrieval."""

    __tablename__ = "career_evidence"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_type = Column(String, nullable=False, index=True)
    source_record_id = Column(String, nullable=True, index=True)
    source_key = Column(String, nullable=False, unique=True, index=True)
    body = Column(Text, nullable=False)
    tags = Column(JSON, nullable=False, default=list)
    timeframe_start = Column(Date, nullable=True, index=True)
    timeframe_end = Column(Date, nullable=True, index=True)
    provenance = Column(JSON, nullable=False, default=dict)
    schema_version = Column(String, nullable=False, default="evidence-v1")
    content_hash = Column(String, nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False, index=True)
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        index=True,
    )

    def __repr__(self) -> str:
        """String representation of CareerEvidence."""
        return (
            f"<CareerEvidence(id={self.id}, source_type='{self.source_type}', "
            f"source_key='{self.source_key}')>"
        )
