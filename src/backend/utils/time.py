"""Shared datetime helpers for backend UTC handling."""

from __future__ import annotations

from datetime import UTC, datetime


def utc_now_naive() -> datetime:
    """Return the current UTC time normalized to naive UTC for SQLite usage."""

    return datetime.now(UTC).replace(tzinfo=None)


def normalize_utc_naive(value: datetime | None) -> datetime | None:
    """Normalize a datetime to naive UTC for consistent SQLite persistence.

    Naive datetimes are treated as already normalized. Aware datetimes are
    converted to UTC and stripped of timezone info.
    """

    if value is None:
        return None
    if value.tzinfo is None:
        return value
    return value.astimezone(UTC).replace(tzinfo=None)
