"""Integration tests for AI settings APIs."""

from __future__ import annotations

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.database import Base, get_db
from backend.main import app

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


def test_ai_settings_list_update_token_and_health_flow() -> None:
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as client:
        listed = client.get("/api/ai-settings")
        assert listed.status_code == 200
        payload = listed.json()
        families = {item["operation_family"] for item in payload}
        assert families == {
            "job_parsing",
            "desirability_scoring",
            "application_generation",
            "fit_analysis",
        }

        updated = client.patch(
            "/api/ai-settings/desirability_scoring",
            json={"provider": "openai", "model": "gpt-4o-mini", "max_tokens": 1200},
        )
        assert updated.status_code == 200
        assert updated.json()["model"] == "gpt-4o-mini"
        assert updated.json()["max_tokens"] == 1200

        token_set = client.put(
            "/api/ai-settings/desirability_scoring/token",
            json={"token": "sk-test-1234567890"},
        )
        assert token_set.status_code == 200
        assert token_set.json()["has_runtime_token"] is True
        assert token_set.json()["token_masked"].endswith("7890")

        token_cleared = client.delete("/api/ai-settings/desirability_scoring/token")
        assert token_cleared.status_code == 200
        assert token_cleared.json()["has_runtime_token"] is False

        health = client.get("/api/ai-settings/desirability_scoring/health")
        assert health.status_code == 200
        assert "ok" in health.json()

    app.dependency_overrides.clear()


def test_ai_settings_reject_invalid_provider_model_combo() -> None:
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as client:
        response = client.patch(
            "/api/ai-settings/job_parsing",
            json={"provider": "anthropic", "model": "gpt-4o"},
        )
        assert response.status_code == 422
        assert "not supported for provider" in response.json()["detail"]

    app.dependency_overrides.clear()
