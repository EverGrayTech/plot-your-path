"""Integration tests for data portability and local data summary APIs."""

from __future__ import annotations

import base64
import io
import zipfile
from pathlib import Path

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import backend.config as config_module
from backend.database import Base, get_db
from backend.main import app
from backend.models.company import Company
from backend.models.role import Role
from backend.models.skill import Skill


def test_data_portability_summary_export_import_and_reset(tmp_path, monkeypatch) -> None:
    data_root = tmp_path / "workspace"
    data_root.mkdir(parents=True, exist_ok=True)
    db_path = data_root / "plot_your_path.db"
    database_url = f"sqlite:///{db_path}"

    engine = create_engine(
        database_url,
        connect_args={"check_same_thread": False},
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    monkeypatch.setattr(config_module.settings, "data_root", str(data_root))
    monkeypatch.setattr(config_module.settings, "database_url", database_url)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    session = TestingSessionLocal()
    company = Company(name="Acme Corp", slug="acme-corp")
    session.add(company)
    session.flush()
    session.add(
        Role(
            company_id=company.id,
            title="Platform Engineer",
            url="https://example.com/role",
            raw_html_path="jobs/raw/acme/role.html",
            cleaned_md_path="jobs/cleaned/acme/role.md",
            status="open",
        )
    )
    session.add(Skill(name="Python", category="language"))
    session.commit()
    session.close()

    (data_root / "jobs" / "cleaned" / "acme").mkdir(parents=True, exist_ok=True)
    (data_root / "jobs" / "cleaned" / "acme" / "role.md").write_text(
        "# Platform Engineer",
        encoding="utf-8",
    )
    (data_root / "resume.md").write_text("# Resume", encoding="utf-8")

    try:
        with TestClient(app) as client:
            summary = client.get("/api/system/data-portability")
            assert summary.status_code == 200
            summary_payload = summary.json()
            assert summary_payload["jobs_count"] == 1
            assert summary_payload["skills_count"] == 1
            assert summary_payload["has_resume"] is True
            assert summary_payload["database_path"].endswith("plot_your_path.db")

            exported = client.get("/api/system/data-portability/export")
            assert exported.status_code == 200
            assert exported.headers["content-type"] == "application/zip"
            archive = zipfile.ZipFile(io.BytesIO(exported.content))
            assert "plot-your-path-export.json" in archive.namelist()
            assert "plot_your_path.db" in archive.namelist()
            assert "resume.md" in archive.namelist()
            assert "jobs/cleaned/acme/role.md" in archive.namelist()

            reset = client.post("/api/system/data-portability/reset")
            assert reset.status_code == 200
            assert reset.json()["message"] == "Local data reset successfully."

            post_reset = client.get("/api/system/data-portability")
            assert post_reset.status_code == 200
            post_reset_payload = post_reset.json()
            assert post_reset_payload["jobs_count"] == 0
            assert post_reset_payload["skills_count"] == 0
            assert post_reset_payload["has_resume"] is False
            assert Path(post_reset_payload["database_path"]).exists()

            restored = client.post(
                "/api/system/data-portability/import",
                json={"archive_base64": base64.b64encode(exported.content).decode("utf-8")},
            )
            assert restored.status_code == 200
            assert restored.json()["message"] == "Backup restored successfully."

            post_restore = client.get("/api/system/data-portability")
            assert post_restore.status_code == 200
            restored_payload = post_restore.json()
            assert restored_payload["jobs_count"] == 1
            assert restored_payload["skills_count"] == 1
            assert restored_payload["has_resume"] is True
            assert restored_payload["last_export_at"] is not None
            assert restored_payload["last_import_at"] is not None
            assert restored_payload["last_reset_at"] is not None
    finally:
        app.dependency_overrides.clear()
        engine.dispose()


def test_import_rejects_invalid_backup_payload(tmp_path, monkeypatch) -> None:
    data_root = tmp_path / "workspace"
    data_root.mkdir(parents=True, exist_ok=True)
    db_path = data_root / "plot_your_path.db"
    database_url = f"sqlite:///{db_path}"

    monkeypatch.setattr(config_module.settings, "data_root", str(data_root))
    monkeypatch.setattr(config_module.settings, "database_url", database_url)

    with TestClient(app) as client:
        response = client.post(
            "/api/system/data-portability/import",
            json={"archive_base64": base64.b64encode(b"not-a-zip").decode("utf-8")},
        )

    assert response.status_code == 422
    assert "valid Plot Your Path archive" in response.json()["detail"]
