"""Role status change audit model."""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.sql import func

from backend.database import Base


class RoleStatusChange(Base):
    """Audit entry for changes to a role's status."""

    __tablename__ = "role_status_changes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False, index=True)
    from_status = Column(String, nullable=True)
    to_status = Column(String, nullable=False)
    changed_at = Column(DateTime, server_default=func.now(), nullable=False)
