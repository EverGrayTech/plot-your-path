"""Desirability factor configuration model."""

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text
from sqlalchemy.sql import func

from backend.database import Base


class DesirabilityFactorConfig(Base):
    """User-editable factor configuration for desirability scoring."""

    __tablename__ = "desirability_factor_configs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True, index=True)
    prompt = Column(Text, nullable=False)
    weight = Column(Float, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    display_order = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self) -> str:
        """String representation of desirability factor configuration."""
        return (
            "<DesirabilityFactorConfig("
            f"id={self.id}, name='{self.name}', weight={self.weight}, is_active={self.is_active})>"
        )
