"""Shared datetime helpers for backend UTC handling."""

from __future__ import annotations

from datetime import UTC, datetime


def utc_now_naive() -> datetime:
    """Return the current UTC time normalized to naive UTC for SQLite usage."""

    return datetime.now(UTC).replace(tzinfo=None)
