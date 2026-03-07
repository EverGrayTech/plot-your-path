"""Tests for skill standardization and consolidation script logic."""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.database import Base
from backend.models.company import Company
from backend.models.role import Role
from backend.models.role_skill import RoleSkill
from backend.models.skill import Skill
from backend.scripts.standardize_skills import consolidate_skills


def _seed_company_and_roles(session):
    company = Company(name="Test Co", slug="test-co")
    session.add(company)
    session.flush()

    role1 = Role(
        company_id=company.id,
        title="Role 1",
        url="https://example.com/jobs/1",
        raw_html_path="jobs/raw/test-co/1.html",
        cleaned_md_path="jobs/cleaned/test-co/1.md",
        status="open",
    )
    role2 = Role(
        company_id=company.id,
        title="Role 2",
        url="https://example.com/jobs/2",
        raw_html_path="jobs/raw/test-co/2.html",
        cleaned_md_path="jobs/cleaned/test-co/2.md",
        status="open",
    )
    session.add(role1)
    session.add(role2)
    session.flush()
    return role1, role2


def test_consolidate_skills_dry_run_does_not_mutate() -> None:
    """Dry-run should report but not persist skill merges/renames."""
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()

    try:
        role1, role2 = _seed_company_and_roles(session)

        agile_variant = Skill(name="Agile Methodologies")
        agile = Skill(name="Agile")
        session.add(agile_variant)
        session.add(agile)
        session.flush()

        session.add(
            RoleSkill(role_id=role1.id, skill_id=agile_variant.id, requirement_level="required")
        )
        session.add(RoleSkill(role_id=role1.id, skill_id=agile.id, requirement_level="preferred"))
        session.add(
            RoleSkill(role_id=role2.id, skill_id=agile_variant.id, requirement_level="preferred")
        )
        session.commit()

        summary, rename_log = consolidate_skills(session, apply_changes=False)

        assert summary["skills_scanned"] == 2
        assert summary["skills_merged"] == 1
        assert summary["links_repointed"] == 1
        assert summary["links_deleted_duplicates"] == 1
        assert summary["levels_upgraded"] == 1
        assert rename_log == []
        assert session.query(Skill).count() == 2
    finally:
        session.close()
        Base.metadata.drop_all(engine)
        engine.dispose()


def test_consolidate_skills_apply_merges_and_upgrades_links() -> None:
    """Apply mode should merge canonical duplicates and preserve strongest links."""
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()

    try:
        role1, role2 = _seed_company_and_roles(session)

        agile_variant = Skill(name="Agile Methodologies")
        agile = Skill(name="Agile")
        session.add(agile_variant)
        session.add(agile)
        session.flush()

        session.add(
            RoleSkill(role_id=role1.id, skill_id=agile_variant.id, requirement_level="required")
        )
        session.add(RoleSkill(role_id=role1.id, skill_id=agile.id, requirement_level="preferred"))
        session.add(
            RoleSkill(role_id=role2.id, skill_id=agile_variant.id, requirement_level="preferred")
        )
        session.commit()

        summary, rename_log = consolidate_skills(session, apply_changes=True)

        assert summary["skills_scanned"] == 2
        assert summary["skills_renamed"] == 0
        assert summary["skills_merged"] == 1
        assert summary["links_repointed"] == 1
        assert summary["links_deleted_duplicates"] == 1
        assert summary["levels_upgraded"] == 1
        assert rename_log == []

        skills = session.query(Skill).all()
        assert len(skills) == 1
        assert skills[0].name == "Agile"

        role1_links = session.query(RoleSkill).filter(RoleSkill.role_id == role1.id).all()
        assert len(role1_links) == 1
        assert role1_links[0].requirement_level == "required"

        role2_links = session.query(RoleSkill).filter(RoleSkill.role_id == role2.id).all()
        assert len(role2_links) == 1
        assert role2_links[0].skill_id == skills[0].id
    finally:
        session.close()
        Base.metadata.drop_all(engine)
        engine.dispose()


def test_consolidate_skills_apply_renames_when_no_canonical_exists() -> None:
    """Canonical form should be applied by rename when no duplicate skill exists."""
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()

    try:
        skill = Skill(name="Full-stack Development")
        session.add(skill)
        session.commit()

        summary, rename_log = consolidate_skills(session, apply_changes=True)

        session.refresh(skill)
        assert summary["skills_scanned"] == 1
        assert summary["skills_renamed"] == 1
        assert summary["skills_merged"] == 0
        assert rename_log == [(int(skill.id), "Full-stack Development", "Full Stack Development")]
        assert skill.name == "Full Stack Development"
    finally:
        session.close()
        Base.metadata.drop_all(engine)
        engine.dispose()
