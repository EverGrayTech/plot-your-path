"""Tests for deterministic job-title normalization."""

from backend.services.title_normalizer import normalize_job_title


def test_normalize_vp_engineering() -> None:
    """VP abbreviation should expand and preserve department."""
    assert normalize_job_title("VP, Engineering") == "Vice President — Engineering"


def test_normalize_vp_of_software_engineering() -> None:
    """`of` connector should normalize to comma-separated canonical form."""
    assert (
        normalize_job_title("Vice President of Software Engineering")
        == "Vice President — Software Engineering"
    )


def test_normalize_senior_director_with_focus() -> None:
    """Focus should be retained with canonical separator."""
    assert (
        normalize_job_title("Senior Director of Engineering, Platform")
        == "Senior Director — Engineering Platform"
    )


def test_unknown_rank_falls_back_to_cleaned_original() -> None:
    """Unknown patterns should not be force-rewritten."""
    assert normalize_job_title("  Lead Engineer - AI  ") == "Lead Engineer — AI"


def test_normalize_sr_customer_solutions_manager() -> None:
    """Abbreviated senior manager-style titles should normalize rank generically."""
    assert (
        normalize_job_title("Sr. Customer Solutions Manager")
        == "Senior Customer Solutions Manager"
    )


def test_normalize_sr_with_focus() -> None:
    """Generic senior rank should still support optional focus extraction."""
    assert (
        normalize_job_title("Sr Customer Solutions Manager, Enterprise")
        == "Senior Customer Solutions Manager — Enterprise"
    )
