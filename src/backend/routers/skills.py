"""Skills API router - list and detail for captured skills."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.company import Company
from backend.models.role import Role
from backend.models.role_skill import RoleSkill
from backend.models.skill import Skill
from backend.schemas.job import RoleStatus
from backend.schemas.skill import SkillDetail, SkillJobReference, SkillListItem

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


@router.get("/skills/{skill_id}", response_model=SkillDetail)
def get_skill(skill_id: int, db: Session = Depends(get_db)) -> SkillDetail:
    """Get detailed information for a single skill including referencing jobs."""
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    rows = (
        db.query(Role, Company)
        .join(RoleSkill, RoleSkill.role_id == Role.id)
        .join(Company, Role.company_id == Company.id)
        .filter(RoleSkill.skill_id == skill_id)
        .order_by(Role.created_at.desc())
        .all()
    )

    jobs = [
        SkillJobReference(
            id=role.id,
            company=company.name,
            title=role.title,
            status=RoleStatus(role.status),
            created_at=role.created_at,
        )
        for role, company in rows
    ]

    return SkillDetail(
        id=skill.id,
        name=skill.name,
        category=skill.category,
        usage_count=len(jobs),
        jobs=jobs,
    )
