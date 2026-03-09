"""Shared HTTP exception mapping for jobs routers."""

from __future__ import annotations

from fastapi import HTTPException


def to_http_exception(
    exc: Exception,
    *,
    default_message: str | None = None,
    not_found_exceptions: tuple[type[Exception], ...] = (LookupError,),
    unprocessable_exceptions: tuple[type[Exception], ...] = (ValueError,),
) -> HTTPException:
    """Map service-layer exceptions into consistent HTTP errors."""
    if isinstance(exc, HTTPException):
        return exc
    if isinstance(exc, not_found_exceptions):
        return HTTPException(status_code=404, detail=str(exc))
    if isinstance(exc, unprocessable_exceptions):
        return HTTPException(status_code=422, detail=str(exc))

    detail = f"{default_message}: {exc}" if default_message else str(exc)
    return HTTPException(status_code=422, detail=detail)
