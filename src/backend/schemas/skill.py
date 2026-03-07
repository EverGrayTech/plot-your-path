"""Skill Pydantic schemas."""

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict

from backend.schemas.job import RoleStatus


class SkillCategory(StrEnum):
    """Skill category enumeration."""

    TECHNICAL = "technical"
    SOFT = "soft"
    DOMAIN = "domain"
    TOOL = "tool"
    LANGUAGE = "language"


class SkillBase(BaseModel):
    """Base skill schema with common fields."""

    name: str
    category: SkillCategory | None = None


class SkillCreate(SkillBase):
    """Schema for creating a new skill."""

    pass


class Skill(SkillBase):
    """Complete skill schema with database fields."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class SkillListItem(BaseModel):
    """Schema for skills list item with usage summary."""

    id: int
    name: str
    category: str | None
    usage_count: int


class SkillJobReference(BaseModel):
    """Job summary that references a specific skill."""

    id: int
    company: str
    title: str
    status: RoleStatus
    created_at: datetime


class SkillDetail(BaseModel):
    """Detailed skill view including referencing jobs."""

    id: int
    name: str
    category: str | None
    usage_count: int
    jobs: list[SkillJobReference]
