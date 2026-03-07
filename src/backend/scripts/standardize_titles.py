"""Backfill script for standardizing role titles."""

from __future__ import annotations

import argparse

from sqlalchemy.orm import Session

from backend.database import SessionLocal
from backend.models.role import Role
from backend.services.title_normalizer import normalize_job_title


def standardize_role_titles(
    db: Session,
    *,
    apply_changes: bool,
) -> tuple[dict[str, int], list[tuple[int, str, str]]]:
    """Standardize all existing role titles in the database."""
    changed_rows: list[tuple[int, str, str]] = []

    roles = db.query(Role).all()
    for role in roles:
        original = role.title
        normalized = normalize_job_title(original)
        if normalized != original:
            changed_rows.append((role.id, original, normalized))
            if apply_changes:
                role.title = normalized

    if apply_changes:
        db.commit()

    summary = {
        "roles_scanned": len(roles),
        "roles_changed": len(changed_rows),
    }
    return summary, changed_rows


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Standardize existing role titles")
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Persist title changes. If omitted, runs in dry-run mode.",
    )
    return parser


def main() -> None:
    """CLI entrypoint."""
    parser = _build_parser()
    args = parser.parse_args()

    mode = "APPLY" if args.apply else "DRY-RUN"
    print(f"Title standardization mode: {mode}")

    db = SessionLocal()
    try:
        summary, changed_rows = standardize_role_titles(db, apply_changes=args.apply)
        print(f"Roles scanned: {summary['roles_scanned']}")
        print(f"Roles changed: {summary['roles_changed']}")

        if changed_rows:
            print("Changed titles:")
            for role_id, original, normalized in changed_rows:
                print(f"- Role {role_id}: {original!r} -> {normalized!r}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
