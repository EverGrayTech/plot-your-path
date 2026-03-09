"""Database initialization script."""

from __future__ import annotations

from collections.abc import Iterable

from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

# Import models so SQLAlchemy metadata is fully populated before create_all.
import backend.models  # noqa: F401
from backend.database import Base, engine


def _add_missing_columns(
    bind: Engine, table_name: str, column_definitions: Iterable[str]
) -> list[str]:
    """Add the provided columns to a table when they are missing."""
    inspector = inspect(bind)
    existing_columns = {column["name"] for column in inspector.get_columns(table_name)}
    added_columns: list[str] = []

    with bind.begin() as connection:
        for definition in column_definitions:
            column_name = definition.split()[0]
            if column_name in existing_columns:
                continue
            connection.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {definition}"))
            added_columns.append(column_name)

    return added_columns


def _migrate_prototype_schema(bind: Engine) -> list[str]:
    """Apply targeted prototype migrations for known stale SQLite schemas."""
    migrated_columns: list[str] = []

    migrated_columns.extend(
        f"role_fit_analyses.{column_name}"
        for column_name in _add_missing_columns(
            bind,
            "role_fit_analyses",
            (
                "rationale_citations JSON NOT NULL DEFAULT '[]'",
                "unsupported_claims JSON NOT NULL DEFAULT '[]'",
            ),
        )
    )
    migrated_columns.extend(
        f"application_materials.{column_name}"
        for column_name in _add_missing_columns(
            bind,
            "application_materials",
            (
                "sections JSON",
                "section_traceability JSON NOT NULL DEFAULT '[]'",
                "unsupported_claims JSON NOT NULL DEFAULT '[]'",
            ),
        )
    )

    return migrated_columns


def init_database(bind: Engine = engine) -> list[str]:
    """
    Initialize the database by creating all tables and applying known prototype migrations.

    Returns:
        List of fully qualified columns that were added during migration.
    """
    print("Creating database tables...")
    Base.metadata.create_all(bind=bind)
    migrated_columns = _migrate_prototype_schema(bind)
    print("Database tables created successfully!")
    if migrated_columns:
        print(f"Prototype schema migrated: {', '.join(migrated_columns)}")
    print(f"Tables created: {', '.join(Base.metadata.tables.keys())}")
    return migrated_columns


if __name__ == "__main__":
    init_database()
