"""Services for backup/export, restore, reset, and local data transparency."""

from __future__ import annotations

import base64
import binascii
import json
import shutil
import sqlite3
import zipfile
from datetime import UTC, datetime
from io import BytesIO
from pathlib import Path
from tempfile import TemporaryDirectory

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from backend.config import ensure_data_root_exists, is_desktop_runtime_enabled, settings
from backend.database import engine
from backend.init_db import init_database
from backend.models.role import Role
from backend.models.skill import Skill
from backend.schemas.system import DataOperationResult, DataPortabilitySummary

STATE_DIRECTORY = ".plot-your-path"
STATE_FILENAME = "data-portability-state.json"
EXPORT_MANIFEST = "plot-your-path-export.json"


def _utc_now() -> datetime:
    return datetime.now(UTC).replace(microsecond=0)


class DataPortabilityService:
    """Coordinate export, import, reset, and data summary operations."""

    def __init__(self, db: Session | None = None):
        self.db = db
        self.data_root = Path(settings.data_root)

    def close_active_connections(self) -> None:
        """Close any active SQLAlchemy sessions/connections before mutating workspace files."""
        if self.db is not None:
            bind = self.db.get_bind()
            self.db.close()
            if isinstance(bind, Engine):
                bind.dispose()

        engine.dispose()

    def export_archive(self) -> tuple[bytes, str]:
        """Create a portable zip archive for the current local workspace."""
        ensure_data_root_exists()
        self._ensure_database_exists()

        exported_at = _utc_now()
        filename = f"plot-your-path-backup-{exported_at.strftime('%Y%m%d-%H%M%S')}.zip"

        buffer = BytesIO()
        with zipfile.ZipFile(buffer, "w", compression=zipfile.ZIP_DEFLATED) as archive:
            archive.writestr(
                EXPORT_MANIFEST,
                json.dumps(
                    {
                        "exported_at": exported_at.isoformat(),
                        "format": "plot-your-path-workspace-v1",
                    },
                    indent=2,
                ),
            )
            self._write_archive_contents(archive)

        self._write_state(last_export_at=exported_at.isoformat())
        return buffer.getvalue(), filename

    def get_summary(self) -> DataPortabilitySummary:
        """Return a user-facing summary of local storage and record counts."""
        state = self._read_state()
        jobs_count, skills_count = self._count_records()
        database_path = self._database_path()

        return DataPortabilitySummary(
            data_root=str(self.data_root),
            database_path=str(database_path),
            desktop_runtime=is_desktop_runtime_enabled(),
            has_resume=(self.data_root / "resume.md").exists(),
            jobs_count=jobs_count,
            last_export_at=self._parse_timestamp(state.get("last_export_at")),
            last_import_at=self._parse_timestamp(state.get("last_import_at")),
            last_reset_at=self._parse_timestamp(state.get("last_reset_at")),
            skills_count=skills_count,
        )

    def import_archive(self, archive_base64: str) -> DataOperationResult:
        """Replace the local workspace with the provided backup archive."""
        ensure_data_root_exists()
        existing_state = self._read_state()

        try:
            archive_bytes = base64.b64decode(archive_base64)
        except (ValueError, binascii.Error) as exc:
            raise ValueError("Backup file could not be decoded.") from exc

        with TemporaryDirectory() as temp_dir:
            extract_root = Path(temp_dir) / "extracted"
            extract_root.mkdir(parents=True, exist_ok=True)
            manifest = self._extract_archive(archive_bytes, extract_root)
            self.close_active_connections()
            self._replace_workspace(extract_root)

        imported_at = _utc_now()
        self._write_state(
            last_export_at=str(manifest.get("exported_at") or existing_state.get("last_export_at")),
            last_import_at=imported_at.isoformat(),
            last_reset_at=str(existing_state.get("last_reset_at") or ""),
        )
        return DataOperationResult(
            completed_at=imported_at,
            message="Backup restored successfully.",
        )

    def reset_workspace(self) -> DataOperationResult:
        """Delete local workspace contents and recreate an empty database."""
        self.close_active_connections()
        self._clear_workspace()
        ensure_data_root_exists()
        self._initialize_database()

        reset_at = _utc_now()
        self._write_state(last_reset_at=reset_at.isoformat())
        return DataOperationResult(
            completed_at=reset_at,
            message="Local data reset successfully.",
        )

    def _archive_members(self) -> list[Path]:
        members: list[Path] = []
        database_path = self._database_path()
        if database_path.exists():
            members.append(database_path)

        if not self.data_root.exists():
            return members

        for child in self.data_root.iterdir():
            if child.name == STATE_DIRECTORY or child == database_path:
                continue
            members.append(child)

        return members

    def _clear_workspace(self) -> None:
        if not self.data_root.exists():
            return

        for child in self.data_root.iterdir():
            if child.is_dir():
                shutil.rmtree(child)
            else:
                child.unlink(missing_ok=True)

    def _count_records(self) -> tuple[int, int]:
        if self.db is None:
            return 0, 0

        try:
            jobs_count = self.db.query(Role).count()
            skills_count = self.db.query(Skill).count()
        except OperationalError:
            return 0, 0

        return jobs_count, skills_count

    def _database_path(self) -> Path:
        database_url = settings.database_url
        if database_url is None or not database_url.startswith("sqlite:///"):
            raise ValueError("Only SQLite-backed local data is supported for backup/export.")
        return Path(database_url.removeprefix("sqlite:///"))

    def _ensure_database_exists(self) -> None:
        database_path = self._database_path()
        if database_path.exists():
            return
        self._initialize_database()

    def _extract_archive(self, archive_bytes: bytes, extract_root: Path) -> dict[str, str]:
        try:
            archive = zipfile.ZipFile(BytesIO(archive_bytes))
        except zipfile.BadZipFile as exc:
            raise ValueError("Backup file is not a valid Plot Your Path archive.") from exc

        manifest: dict[str, str] = {}
        with archive:
            for member in archive.infolist():
                member_path = Path(member.filename)
                if member.is_dir():
                    continue
                if member_path.is_absolute() or ".." in member_path.parts:
                    raise ValueError("Backup file contains an invalid path.")

                target = extract_root / member_path
                target.parent.mkdir(parents=True, exist_ok=True)
                with archive.open(member) as source, target.open("wb") as destination:
                    shutil.copyfileobj(source, destination)

                if member.filename == EXPORT_MANIFEST:
                    try:
                        payload = json.loads(target.read_text(encoding="utf-8"))
                    except json.JSONDecodeError as exc:
                        raise ValueError("Backup file manifest is invalid.") from exc
                    if isinstance(payload, dict):
                        manifest = {
                            str(key): str(value)
                            for key, value in payload.items()
                            if value is not None
                        }

        if not (extract_root / self._database_path().name).exists():
            raise ValueError("Backup file is missing the workspace database.")

        return manifest

    def _initialize_database(self) -> None:
        database_url = settings.database_url
        assert database_url is not None, "database_url must be configured"
        db_engine = create_engine(database_url, connect_args={"check_same_thread": False})
        try:
            init_database(bind=db_engine)
        finally:
            db_engine.dispose()

    def _parse_timestamp(self, value: str | None) -> datetime | None:
        if not value:
            return None
        return datetime.fromisoformat(value)

    def _read_state(self) -> dict[str, str]:
        state_path = self.data_root / STATE_DIRECTORY / STATE_FILENAME
        if not state_path.exists():
            return {}

        try:
            payload = json.loads(state_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return {}

        if not isinstance(payload, dict):
            return {}
        return {str(key): str(value) for key, value in payload.items() if value is not None}

    def _replace_workspace(self, extract_root: Path) -> None:
        self._clear_workspace()
        ensure_data_root_exists()

        for child in extract_root.iterdir():
            if child.name == EXPORT_MANIFEST:
                continue

            destination = self.data_root / child.name
            if child.is_dir():
                shutil.copytree(child, destination)
            else:
                shutil.copy2(child, destination)

    def _write_archive_contents(self, archive: zipfile.ZipFile) -> None:
        database_snapshot = self._database_path()
        with TemporaryDirectory() as temp_dir:
            snapshot_root = Path(temp_dir)
            snapshot_database = snapshot_root / database_snapshot.name
            self._snapshot_database(snapshot_database)

            for member in self._archive_members():
                if member == database_snapshot:
                    continue

                if member.is_dir():
                    for file_path in member.rglob("*"):
                        if not file_path.is_file():
                            continue
                        archive.write(file_path, file_path.relative_to(self.data_root).as_posix())
                else:
                    archive.write(member, member.relative_to(self.data_root).as_posix())

            archive.write(snapshot_database, snapshot_database.name)

    def _write_state(self, **updates: str) -> None:
        ensure_data_root_exists()
        state_dir = self.data_root / STATE_DIRECTORY
        state_dir.mkdir(parents=True, exist_ok=True)

        state = self._read_state()
        state.update(updates)
        (state_dir / STATE_FILENAME).write_text(json.dumps(state, indent=2), encoding="utf-8")

    def _snapshot_database(self, target: Path) -> None:
        database_path = self._database_path()
        database_path.parent.mkdir(parents=True, exist_ok=True)
        target.parent.mkdir(parents=True, exist_ok=True)

        with sqlite3.connect(database_path) as source:
            with sqlite3.connect(target) as destination:
                source.backup(destination)
