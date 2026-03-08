"""Persisted AI settings for each operation family."""

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String
from sqlalchemy.sql import func

from backend.database import Base


class AIOperationSetting(Base):
    """Provider/model/token source settings for an operation family."""

    __tablename__ = "ai_operation_settings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    operation_family = Column(String, nullable=False, unique=True, index=True)
    provider = Column(String, nullable=False)
    model = Column(String, nullable=False)
    api_key_env = Column(String, nullable=False)
    base_url = Column(String, nullable=True)
    temperature = Column(Float, nullable=False, default=0.1)
    max_tokens = Column(Integer, nullable=False, default=4000)
    has_runtime_token = Column(Boolean, nullable=False, default=False)
    token_last4 = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
