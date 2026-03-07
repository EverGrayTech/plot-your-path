"""Backfill script for standardizing and consolidating skills."""

from __future__ import annotations

import argparse
from dataclasses import dataclass

from sqlalchemy.orm import Session

from backend.database import SessionLocal
from backend.models.role_skill import RoleSkill
from backend.models.skill import Skill
from backend.services.skill_extractor import SkillExtractorService


@dataclass(slots=True)
class SkillConsolidationStats:
    """Summary counters for skill standardization runs."""

    levels_upgraded: int = 0
    links_deleted_duplicates: int = 0
    links_repointed: int = 0
    skills_merged: int = 0
    skills_renamed: int = 0
    skills_scanned: int = 0


def _choose_target_skill(skills: list[Skill], canonical_name: str) -> Skill:
    canonical_matches = [skill for skill in skills if skill.name == canonical_name]
    if canonical_matches:
        return min(canonical_matches, key=lambda skill: int(skill.id))
    return min(skills, key=lambda skill: int(skill.id))


def consolidate_skills(
    db: Session,
    *,
    apply_changes: bool,
) -> tuple[dict[str, int], list[tuple[int, str, str]]]:
    """Normalize skill names and merge duplicate canonical entries."""
    all_skills = db.query(Skill).order_by(Skill.id.asc()).all()
    stats = SkillConsolidationStats(skills_scanned=len(all_skills))
    rename_log: list[tuple[int, str, str]] = []

    buckets: dict[str, list[Skill]] = {}
    for skill in all_skills:
        canonical_name = SkillExtractorService.normalize_skill_name(skill.name)
        buckets.setdefault(canonical_name, []).append(skill)

    for canonical_name, bucket in buckets.items():
        target = _choose_target_skill(bucket, canonical_name)
        if target.name != canonical_name:
            stats.skills_renamed += 1
            rename_log.append((int(target.id), target.name, canonical_name))
            if apply_changes:
                target.name = canonical_name

        for source in bucket:
            if source.id == target.id:
                continue

            source_links = db.query(RoleSkill).filter(RoleSkill.skill_id == source.id).all()
            for source_link in source_links:
                target_link = (
                    db.query(RoleSkill)
                    .filter(
                        RoleSkill.role_id == source_link.role_id,
                        RoleSkill.skill_id == target.id,
                    )
                    .first()
                )

                if target_link is None:
                    stats.links_repointed += 1
                    if apply_changes:
                        source_link.skill_id = target.id
                    continue

                # Duplicate role-skill link after merge: preserve strongest requirement.
                if (
                    target_link.requirement_level == "preferred"
                    and source_link.requirement_level == "required"
                ):
                    stats.levels_upgraded += 1
                    if apply_changes:
                        target_link.requirement_level = "required"

                stats.links_deleted_duplicates += 1
                if apply_changes:
                    db.delete(source_link)

            stats.skills_merged += 1
            if apply_changes:
                db.delete(source)

    if apply_changes:
        db.commit()

    summary = {
        "skills_scanned": stats.skills_scanned,
        "skills_renamed": stats.skills_renamed,
        "skills_merged": stats.skills_merged,
        "links_repointed": stats.links_repointed,
        "links_deleted_duplicates": stats.links_deleted_duplicates,
        "levels_upgraded": stats.levels_upgraded,
    }
    return summary, rename_log


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Standardize existing skills and consolidate duplicates"
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Persist skill changes. If omitted, runs in dry-run mode.",
    )
    return parser


def main() -> None:
    """CLI entrypoint."""
    parser = _build_parser()
    args = parser.parse_args()

    mode = "APPLY" if args.apply else "DRY-RUN"
    print(f"Skill standardization mode: {mode}")

    db = SessionLocal()
    try:
        summary, rename_log = consolidate_skills(db, apply_changes=args.apply)
        print(f"Skills scanned: {summary['skills_scanned']}")
        print(f"Skills renamed: {summary['skills_renamed']}")
        print(f"Skills merged: {summary['skills_merged']}")
        print(f"Role-skill links repointed: {summary['links_repointed']}")
        print(f"Role-skill duplicates deleted: {summary['links_deleted_duplicates']}")
        print(f"Requirement levels upgraded: {summary['levels_upgraded']}")

        if rename_log:
            print("Renamed canonical skills:")
            for skill_id, original, canonical in rename_log:
                print(f"- Skill {skill_id}: {original!r} -> {canonical!r}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
