"""Utilities for deterministic job-title normalization."""

from __future__ import annotations

import re
from contextlib import suppress

RANK_ALIASES: dict[str, str] = {
    "caio": "Chief AI Officer",
    "cao": "Chief Administrative Officer",
    "cco": "Chief Compliance Officer",
    "cdo": "Chief Data Officer",
    "ceo": "Chief Executive Officer",
    "cfo": "Chief Financial Officer",
    "chro": "Chief Human Resources Officer",
    "ciso": "Chief Information Security Officer",
    "cio": "Chief Information Officer",
    "clo": "Chief Legal Officer",
    "cmo": "Chief Marketing Officer",
    "coo": "Chief Operating Officer",
    "cpo": "Chief Procurement Officer",
    "cro": "Chief Revenue Officer",
    "cto": "Chief Technology Officer",
    "cso": "Chief Strategy Officer",
    "cxo": "Chief Experience Officer",
    "evp": "Executive Vice President",
    "svp": "Senior Vice President",
    "vp": "Vice President",
    "jr": "Junior",
    "sr": "Senior",
}

RANK_TITLES: tuple[str, ...] = (
    "architect",
    "director",
    "engineer",
    "head",
    "lead",
    "manager",
    "officer",
    "president",
)


def _clean_title(value: str) -> str:
    return " ".join(
        [RANK_ALIASES.get(i.lower(), i) for i in re.sub(r"[^0-z&]+", " ", value).strip().split()]
    )


def _extract_rank_and_remainder(title: str) -> tuple[str, str] | None:
    words = title.split()

    with suppress(ValueError):
        index = max([i for i, word in enumerate(words, 1) if word.lower() in RANK_TITLES])
        rank = " ".join(words[:index])
        department = " ".join(words[index:])
        if department.lower().startswith("of "):
            department = department[3:]

        return rank, department


def normalize_job_title(title: str) -> str:
    """
    Normalize a job title into `Rank — Department` when parseable.

    Rules:
    - Canonicalize recognized rank aliases (e.g., VP -> Vice President)
    - Preserve department wording, only normalizing whitespace
    - If parsing confidence is low, return the original title (whitespace-collapsed)
    """
    cleaned_title = _clean_title(title)
    if not cleaned_title:
        return ""

    extracted = _extract_rank_and_remainder(cleaned_title)
    if not extracted or not extracted[-1]:
        return cleaned_title

    return " — ".join(extracted)
