"""Skills API router - list captured skills with usage summaries."""

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.role_skill import RoleSkill
from backend.models.skill import Skill
from backend.schemas.skill import SkillListItem

router = APIRouter()


@router.get("/skills", response_model=list[SkillListItem])
def list_skills(db: Session = Depends(get_db)) -> list[SkillListItem]:
    """List captured skills with usage count across roles."""
    rows = (
        db.query(
            Skill.id,
            Skill.name,
            Skill.category,
            func.count(RoleSkill.id).label("usage_count"),
        )
        .outerjoin(RoleSkill, RoleSkill.skill_id == Skill.id)
        .group_by(Skill.id, Skill.name, Skill.category)
        .all()
    )

    return [
        SkillListItem(
            id=row.id,
            name=row.name,
            category=row.category,
            usage_count=row.usage_count,
        )
        for row in rows
    ]
