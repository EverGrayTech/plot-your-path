"""Integration tests for Skills API endpoints."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.database import Base, get_db
from backend.main import app
from backend.models.company import Company
from backend.models.role import Role
from backend.models.role_skill import RoleSkill
from backend.models.skill import Skill

SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


class TestListSkills:
    """Tests for GET /api/skills."""

    def test_list_skills_empty(self, client):
        response = client.get("/api/skills")
        assert response.status_code == 200
        assert response.json() == []

    def test_list_skills_usage_counts(self, client, db):
        company = Company(name="Acme", slug="acme")
        db.add(company)
        db.flush()

        role_one = Role(
            company_id=company.id,
            title="Backend Engineer",
            url="https://example.com/jobs/1",
            raw_html_path="data/jobs/raw/acme/1.html",
            cleaned_md_path="data/jobs/cleaned/acme/1.md",
            status="active",
        )
        role_two = Role(
            company_id=company.id,
            title="Platform Engineer",
            url="https://example.com/jobs/2",
            raw_html_path="data/jobs/raw/acme/2.html",
            cleaned_md_path="data/jobs/cleaned/acme/2.md",
            status="active",
        )
        db.add(role_one)
        db.add(role_two)
        db.flush()

        python = Skill(name="Python", category="language")
        docker = Skill(name="Docker", category="tool")
        unused = Skill(name="GraphQL", category="technical")
        db.add(python)
        db.add(docker)
        db.add(unused)
        db.flush()

        db.add(RoleSkill(role_id=role_one.id, skill_id=python.id, requirement_level="required"))
        db.add(RoleSkill(role_id=role_two.id, skill_id=python.id, requirement_level="required"))
        db.add(RoleSkill(role_id=role_two.id, skill_id=docker.id, requirement_level="preferred"))
        db.commit()

        response = client.get("/api/skills")
        assert response.status_code == 200
        data = response.json()

        usage_by_name = {item["name"]: item["usage_count"] for item in data}
        assert usage_by_name["Python"] == 2
        assert usage_by_name["Docker"] == 1
        assert usage_by_name["GraphQL"] == 0
