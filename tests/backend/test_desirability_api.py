"""Integration tests for desirability factor CRUD APIs."""

from __future__ import annotations

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.database import Base, get_db
from backend.main import app
from backend.models.desirability_factor_config import DesirabilityFactorConfig

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


def setup_function() -> None:
    Base.metadata.create_all(bind=engine)


def teardown_function() -> None:
    Base.metadata.drop_all(bind=engine)


def test_factor_crud_and_reorder_flow() -> None:
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as client:
        listed = client.get("/api/desirability/factors")
        assert listed.status_code == 200
        defaults = listed.json()
        assert len(defaults) >= 1

        created = client.post(
            "/api/desirability/factors",
            json={
                "name": "Learning Velocity",
                "prompt": "Evaluate likelihood of rapid growth opportunities.",
                "weight": 0.08,
                "is_active": True,
                "display_order": len(defaults),
            },
        )
        assert created.status_code == 200
        created_payload = created.json()
        assert created_payload["name"] == "Learning Velocity"

        updated = client.patch(
            f"/api/desirability/factors/{created_payload['id']}",
            json={"weight": 0.11, "is_active": False},
        )
        assert updated.status_code == 200
        assert updated.json()["weight"] == 0.11
        assert updated.json()["is_active"] is False

        reordered_ids = [created_payload["id"]] + [item["id"] for item in defaults]
        reordered = client.post(
            "/api/desirability/factors/reorder",
            json={"factor_ids": reordered_ids},
        )
        assert reordered.status_code == 200
        assert reordered.json()[0]["id"] == created_payload["id"]

        deleted = client.delete(f"/api/desirability/factors/{created_payload['id']}")
        assert deleted.status_code == 204

    app.dependency_overrides.clear()


def test_factor_create_rejects_duplicate_name() -> None:
    session = TestingSessionLocal()
    session.add(
        DesirabilityFactorConfig(
            name="Culture",
            prompt="Prompt",
            weight=0.5,
            is_active=True,
            display_order=0,
        )
    )
    session.commit()
    session.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as client:
        response = client.post(
            "/api/desirability/factors",
            json={
                "name": "Culture",
                "prompt": "Duplicate",
                "weight": 0.1,
                "is_active": True,
                "display_order": 1,
            },
        )
        assert response.status_code == 422

    app.dependency_overrides.clear()
