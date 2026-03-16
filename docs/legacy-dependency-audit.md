# Plot Your Path — Legacy Dependency Audit

## Purpose

This document records the current dependency boundary between the active browser-local MVP direction and the repository's remaining legacy backend/desktop implementation.

It is the output of Plan 39 and should be used as the cut-line reference for later cleanup and deletion phases.

## Executive Summary

The product direction has pivoted successfully, but the implementation is still transitional.

The active user-facing architecture is now framed as:

- browser-hosted local-first web application
- TypeScript-centered MVP direction
- browser/device-local trust model
- explicit export/import for portability

However, the current implementation still has **material runtime dependence on backend-era HTTP APIs** and still carries **active repository/tooling baggage from the Python and Tauri phases**.

That means the project is currently in this state:

> **Product direction: browser-local MVP**  
> **Implementation reality: hybrid transition system**

## Audit Findings

### 1. Active frontend runtime dependencies on legacy-era services

The frontend still depends heavily on `src/frontend/lib/api.ts`, which is built around `fetch` calls to `NEXT_PUBLIC_API_URL` with a default of `http://localhost:8000`.

This is not just incidental. It currently powers core MVP workflows, including:

- jobs listing and detail retrieval
- job capture
- fit analysis
- desirability scoring
- application operations tracking
- interview and outcome workflows
- cover letter generation
- question-answer generation
- interview prep pack generation
- resume sync and resume tuning
- AI settings management
- data portability summary/export/import/reset

### 2. Meaning of that dependency

This means the frontend is **not yet implementation-local** in the full architectural sense.

Even though the product messaging now describes a browser-local MVP, the codebase still relies on:

- backend-shaped API contracts
- a network-style client abstraction
- server-oriented persistence and workflow orchestration assumptions

This is the single most important cut-line finding.

### 3. Active repository/tooling legacy surfaces

The repository still contains active legacy tooling and structure, including:

- `src/backend/`
- `src-tauri/`
- desktop build/dev scripts in `package.json`
- Python project files such as `pyproject.toml` and `uv.lock`
- transition-era development instructions in `docs/development.md`
- archived desktop runtime documentation in `docs/desktop-runtime.md`

Some of these are intentionally archived. Others are still active operational entry points and therefore still contribute ambiguity and maintenance cost.

## Classification

### Keep for now: required for active MVP execution

These areas should not be removed yet because the current app still depends on them directly or indirectly:

- `src/frontend/lib/api.ts`
- backend API contracts currently used by the frontend
- any backend implementation paths required to satisfy those active API calls
- data portability endpoints currently backing export/import/reset
- AI settings and generation endpoints currently backing browser MVP workflows

### Transitional: remove only after refactor

These areas are likely removable later, but only after browser-local replacements exist or active dependencies are rewritten:

- most of `src/backend/`
- backend persistence layer and associated schemas
- tests that validate backend-driven browser workflows
- runtime-oriented environment assumptions based on `NEXT_PUBLIC_API_URL`

### Archived reference only

These should remain clearly archived but should not appear as active defaults:

- `docs/desktop-runtime.md`
- `docs/windows-release-readiness.md`
- historical plan files related to desktop packaging

### Strong removal candidates

These look like good candidates for later deletion once dependency checks are complete:

- Tauri packaging workflows and `src-tauri/` if no active path still depends on them
- desktop build scripts in `package.json`
- Python/Tauri-specific contributor instructions that are no longer needed after transition work ends
- obsolete packaging helpers under `scripts/`
- Python project/config files if the backend is fully retired

## Cut Line

### Safe to remove now

The following category appears safe to stop treating as active immediately, even before code deletion:

- desktop/Tauri runtime as an active architectural default
- desktop build/release documentation as active onboarding material
- product and contributor messaging that implies the packaged runtime is current

### Not safe to remove yet

The following category is **not** safe to remove yet based on the current repository state:

- backend-facing frontend API layer
- backend implementation that currently supports core MVP workflows
- Python project support needed to run those backend workflows

### Required next cut-line work

Before large deletion work, the project needs a focused implementation audit that maps:

- which specific frontend features already have genuine browser-local implementations
- which features still call backend endpoints only because the client-side replacement has not been built
- whether `data-portability` and AI flows are truly browser-local or only browser-facing

## Recommended Sequence

1. remove legacy runtime from active docs/scripts/UI defaults
2. audit and replace backend-dependent frontend workflows with true browser-local implementations
3. delete backend and Tauri code only after those replacements are verified
4. restructure the repo around the surviving web architecture

## Decision

The legacy desktop runtime can be treated as retired now.

The legacy backend cannot yet be fully removed without further implementation work, because the current frontend still depends on backend-era APIs for major MVP workflows.

That distinction should drive the next cleanup phases.
