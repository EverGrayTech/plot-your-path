"""Tests for explicit database initialization and migration."""

from __future__ import annotations

from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy import inspect as sqlalchemy_inspect

from backend.init_db import init_database


def _create_stale_prototype_schema(engine: Engine) -> None:
    """Create the older prototype schema shape that lacks recently added JSON columns."""
    with engine.begin() as connection:
        connection.execute(text("CREATE TABLE roles (id INTEGER PRIMARY KEY)"))
        connection.execute(
            text(
                """
                CREATE TABLE role_fit_analyses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    role_id INTEGER NOT NULL,
                    fit_score INTEGER NOT NULL,
                    recommendation VARCHAR NOT NULL,
                    covered_required_skills JSON NOT NULL,
                    missing_required_skills JSON NOT NULL,
                    covered_preferred_skills JSON NOT NULL,
                    missing_preferred_skills JSON NOT NULL,
                    rationale TEXT NOT NULL,
                    provider VARCHAR NOT NULL,
                    model VARCHAR NOT NULL,
                    version VARCHAR NOT NULL,
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
        )
        connection.execute(
            text(
                """
                INSERT INTO role_fit_analyses (
                    role_id,
                    fit_score,
                    recommendation,
                    covered_required_skills,
                    missing_required_skills,
                    covered_preferred_skills,
                    missing_preferred_skills,
                    rationale,
                    provider,
                    model,
                    version
                ) VALUES (
                    1,
                    87,
                    'go',
                    '[]',
                    '[]',
                    '[]',
                    '[]',
                    'Strong fit',
                    'openai',
                    'gpt-4o',
                    '1'
                )
                """
            )
        )
        connection.execute(
            text(
                """
                CREATE TABLE application_materials (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    role_id INTEGER NOT NULL,
                    artifact_type VARCHAR NOT NULL,
                    version INTEGER NOT NULL,
                    content_path VARCHAR NOT NULL,
                    questions JSON,
                    provider VARCHAR NOT NULL,
                    model VARCHAR NOT NULL,
                    prompt_version VARCHAR NOT NULL,
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
        )
        connection.execute(
            text(
                """
                INSERT INTO application_materials (
                    role_id,
                    artifact_type,
                    version,
                    content_path,
                    questions,
                    provider,
                    model,
                    prompt_version
                ) VALUES (
                    1,
                    'cover_letter',
                    1,
                    'artifact.md',
                    '[]',
                    'openai',
                    'gpt-4o',
                    '1'
                )
                """
            )
        )


def test_init_database_migrates_known_prototype_schema(tmp_path: Path) -> None:
    """Explicit init should upgrade the one stale prototype schema we still care about."""
    db_path = tmp_path / "prototype.db"
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    try:
        _create_stale_prototype_schema(engine)

        migrated_columns = init_database(engine)

        inspector = sqlalchemy_inspect(engine)
        role_fit_columns = {column["name"] for column in inspector.get_columns("role_fit_analyses")}
        application_material_columns = {
            column["name"] for column in inspector.get_columns("application_materials")
        }

        assert "role_fit_analyses.rationale_citations" in migrated_columns
        assert "role_fit_analyses.unsupported_claims" in migrated_columns
        assert "application_materials.sections" in migrated_columns
        assert "application_materials.section_traceability" in migrated_columns
        assert "application_materials.unsupported_claims" in migrated_columns
        assert "rationale_citations" in role_fit_columns
        assert "unsupported_claims" in role_fit_columns
        assert "sections" in application_material_columns
        assert "section_traceability" in application_material_columns
        assert "unsupported_claims" in application_material_columns

        with engine.connect() as connection:
            migrated_role_fit = connection.execute(
                text(
                    "SELECT rationale_citations, unsupported_claims FROM role_fit_analyses WHERE id = 1"
                )
            ).one()
            migrated_material = connection.execute(
                text(
                    "SELECT section_traceability, unsupported_claims FROM application_materials WHERE id = 1"
                )
            ).one()

        assert migrated_role_fit.rationale_citations == "[]"
        assert migrated_role_fit.unsupported_claims == "[]"
        assert migrated_material.section_traceability == "[]"
        assert migrated_material.unsupported_claims == "[]"
    finally:
        engine.dispose()
