"""Helpers for crossing sync/async boundaries intentionally."""

from __future__ import annotations

import asyncio
from collections.abc import Awaitable
from typing import TypeVar

T = TypeVar("T")


def run_async_task(awaitable: Awaitable[T]) -> T:
    """Run an awaitable from synchronous code when no loop is already active.

    This helper centralizes the repository's sync→async boundary and fails fast
    if it is called from an active event loop. Async callers should `await`
    directly instead of trying to create nested loops.
    """

    try:
        asyncio.get_running_loop()
    except RuntimeError:
        return asyncio.run(awaitable)

    raise RuntimeError(
        "run_async_task() cannot be used from an active event loop; await the coroutine directly"
    )
