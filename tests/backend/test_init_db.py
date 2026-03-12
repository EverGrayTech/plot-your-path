"""Tests for explicit database initialization and migration."""

from __future__ import annotations

from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy import inspect as sqlalchemy_inspect
from sqlalchemy.engine import Engine

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
        connection.execute(
            text(
                """
                CREATE TABLE desirability_score_results (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    company_id INTEGER NOT NULL,
                    role_id INTEGER NOT NULL,
                    total_score FLOAT NOT NULL,
                    factor_breakdown JSON NOT NULL,
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
                INSERT INTO desirability_score_results (
                    company_id,
                    role_id,
                    total_score,
                    factor_breakdown,
                    provider,
                    model,
                    version
                ) VALUES (
                    1,
                    1,
                    7.6,
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
        desirability_columns = {
            column["name"] for column in inspector.get_columns("desirability_score_results")
        }

        assert "role_fit_analyses.adjacent_required_skills" in migrated_columns
        assert "role_fit_analyses.adjacent_preferred_skills" in migrated_columns
        assert "role_fit_analyses.rationale_citations" in migrated_columns
        assert "role_fit_analyses.unsupported_claims" in migrated_columns
        assert "role_fit_analyses.fallback_used" in migrated_columns
        assert "role_fit_analyses.confidence_label" in migrated_columns
        assert "application_materials.sections" in migrated_columns
        assert "application_materials.section_traceability" in migrated_columns
        assert "application_materials.unsupported_claims" in migrated_columns
        assert "application_materials.fallback_used" in migrated_columns
        assert "desirability_score_results.score_scope" in migrated_columns
        assert "desirability_score_results.fallback_used" in migrated_columns
        assert "desirability_score_results.cache_expires_at" in migrated_columns
        assert "adjacent_required_skills" in role_fit_columns
        assert "adjacent_preferred_skills" in role_fit_columns
        assert "rationale_citations" in role_fit_columns
        assert "unsupported_claims" in role_fit_columns
        assert "fallback_used" in role_fit_columns
        assert "confidence_label" in role_fit_columns
        assert "sections" in application_material_columns
        assert "section_traceability" in application_material_columns
        assert "unsupported_claims" in application_material_columns
        assert "fallback_used" in application_material_columns
        assert "score_scope" in desirability_columns
        assert "fallback_used" in desirability_columns
        assert "cache_expires_at" in desirability_columns

        with engine.connect() as connection:
            migrated_role_fit = connection.execute(
                text(
                    "SELECT adjacent_required_skills, adjacent_preferred_skills, rationale_citations, unsupported_claims, fallback_used, confidence_label FROM role_fit_analyses WHERE id = 1"
                )
            ).one()
            migrated_material = connection.execute(
                text(
                    "SELECT section_traceability, unsupported_claims, fallback_used FROM application_materials WHERE id = 1"
                )
            ).one()
            migrated_desirability = connection.execute(
                text(
                    "SELECT score_scope, fallback_used, cache_expires_at FROM desirability_score_results WHERE id = 1"
                )
            ).one()

        assert migrated_role_fit.adjacent_required_skills == "[]"
        assert migrated_role_fit.adjacent_preferred_skills == "[]"
        assert migrated_role_fit.rationale_citations == "[]"
        assert migrated_role_fit.unsupported_claims == "[]"
        assert migrated_role_fit.fallback_used == 0
        assert migrated_role_fit.confidence_label == "high"
        assert migrated_material.section_traceability == "[]"
        assert migrated_material.unsupported_claims == "[]"
        assert migrated_material.fallback_used == 0
        assert migrated_desirability.score_scope == "company"
        assert migrated_desirability.fallback_used == 0
        assert migrated_desirability.cache_expires_at is not None
    finally:
        engine.dispose()
