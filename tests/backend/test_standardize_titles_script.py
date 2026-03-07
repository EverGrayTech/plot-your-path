"""Tests for title standardization backfill script logic."""

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from backend.database import Base
from backend.models.company import Company
from backend.models.role import Role
from backend.scripts.standardize_titles import standardize_role_titles


def _seed_role(session: Session, *, title: str, url: str) -> Role:
    company = session.query(Company).first()
    if company is None:
        company = Company(name="Test Co", slug="test-co")
        session.add(company)
        session.flush()

    role = Role(
        company_id=company.id,
        title=title,
        url=url,
        raw_html_path="jobs/raw/test-co/1.html",
        cleaned_md_path="jobs/cleaned/test-co/1.md",
        status="open",
    )
    session.add(role)
    session.flush()
    return role


def test_standardize_role_titles_dry_run_does_not_mutate() -> None:
    """Dry-run mode should report changes but not persist them."""
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()

    try:
        role = _seed_role(session, title="VP, Engineering", url="https://example.com/jobs/1")
        session.commit()

        summary, changed_rows = standardize_role_titles(session, apply_changes=False)
        session.refresh(role)

        assert summary == {"roles_scanned": 1, "roles_changed": 1}
        assert changed_rows == [
            (int(role.id), "VP, Engineering", "Vice President — Engineering"),
        ]
        assert role.title == "VP, Engineering"
    finally:
        session.close()
        Base.metadata.drop_all(engine)
        engine.dispose()


def test_standardize_role_titles_apply_persists_changes() -> None:
    """Apply mode should persist normalized titles."""
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()

    try:
        role = _seed_role(
            session,
            title="Senior Director of Engineering, Platform",
            url="https://example.com/jobs/2",
        )
        session.commit()

        summary, changed_rows = standardize_role_titles(session, apply_changes=True)
        session.refresh(role)

        assert summary == {"roles_scanned": 1, "roles_changed": 1}
        assert changed_rows == [
            (
                int(role.id),
                "Senior Director of Engineering, Platform",
                "Senior Director — Engineering Platform",
            )
        ]
        assert role.title == "Senior Director — Engineering Platform"
    finally:
        session.close()
        Base.metadata.drop_all(engine)
        engine.dispose()
