# Plan: Backend Correctness & Reliability Stabilization

## Overview

Address backend risks that currently threaten correctness, operability, and future refactors. The primary issues are inconsistent async/sync execution boundaries, brittle database/file persistence coupling, naive timezone handling, schema bootstrapping inside application startup, and broad exception handling that obscures failure modes.

This should be completed **before** larger API or frontend refactors because it establishes the behavioral guarantees those refactors need to rely on.

## Why This Comes First

- Several LLM-backed workflows call async code from sync contexts using `asyncio.run(...)`, which is fragile and can break under alternate hosting/runtime conditions.
- File persistence is coupled to database writes in a way that can leave orphaned files or stale database references when failures occur mid-pipeline.
- Datetime handling currently mixes UTC-aware and naive values, increasing the chance of subtle sorting, filtering, and deadline bugs.
- Automatic `create_all()` on startup hides schema drift and makes production behavior less predictable.
- Broad `except Exception` fallbacks reduce observability and make real defects look like recoverable degradations.

## Goals

1. Establish one consistent async/sync boundary model for backend workflows.
2. Make database and filesystem persistence behavior deterministic and recoverable.
3. Standardize datetime storage/comparison semantics across the backend.
4. Replace implicit schema mutation on app startup with explicit initialization/migration expectations.
5. Tighten exception taxonomy so callers can distinguish expected degradation from defects.

## Technical Design

### 1. Execution Boundary Cleanup

Observed issues:
- `asyncio.run(...)` is used inside request-handling and service code.
- LLM-backed services mix sync SQLAlchemy work, sync file writes, and async provider calls without a consistent orchestration model.

Refactor direction:
- Define explicit rules for which services are async and which are sync.
- Keep pure CRUD/query services synchronous.
- Make LLM-backed orchestration flows explicitly async end-to-end.
- Isolate blocking database/file work behind clearly defined sync boundaries rather than invoking nested event loops.
- Ensure route handlers invoke services in a way compatible with FastAPI lifecycle/runtime expectations.

### 2. Persistence Consistency

Observed issues:
- File writes happen during logical transactions without a clear rollback/cleanup strategy.
- Sentinel values such as `pending` and `clipboard` overload path fields with source semantics.
- The current path strategy is more consistent than before, but the data model still blurs “where content came from” and “where content is stored.”

Refactor direction:
- Separate source semantics from storage semantics.
- Define explicit rules for nullable paths vs. non-file-backed sources.
- Introduce a persistence workflow that can clean up staged files on failure.
- Document canonical storage path rules and compatibility handling for legacy data.

### 3. Time Handling Normalization

Observed issues:
- Repeated use of `datetime.now(UTC).replace(tzinfo=None)` indicates timezone information is being stripped to fit current persistence/query behavior.

Refactor direction:
- Standardize on a single backend time policy.
- Ensure models, schema serialization, comparisons, and UI-facing timestamps all follow that policy.
- Centralize helper functions for “current time” and datetime normalization rather than repeating ad hoc conversions.

### 4. Explicit Schema Lifecycle

Observed issues:
- Table creation currently occurs during app startup.

Refactor direction:
- Move schema creation/migration responsibility out of request-serving startup.
- Keep local developer bootstrap simple, but make initialization explicit.
- Align runtime expectations with future migration tooling.

### 5. Exception Taxonomy and Recovery Rules

Observed issues:
- Multiple services catch broad exceptions and silently fall back.
- Some failures that should be surfaced as defects are currently treated as normal degradation.

Refactor direction:
- Define expected domain/integration errors per workflow.
- Separate “provider unavailable / fallback allowed” from “invalid data / bug / persistence failure.”
- Make API responses and logs map cleanly to those categories.

## Implementation Steps

### 1. Execution model definition
- [x] Document the backend execution model for CRUD, orchestration, file I/O, and LLM calls.
- [x] Identify all nested event-loop usage and replace it with the chosen boundary pattern.

### 2. Persistence workflow hardening
- [x] Separate source metadata from file path metadata where currently overloaded.
- [x] Introduce deterministic staged-write and cleanup behavior for file-backed artifacts.
- [x] Add compatibility rules for legacy stored values.

### 3. Datetime normalization
- [x] Define one canonical time policy.
- [x] Replace repeated naive/aware conversion patterns with shared helpers.
- [x] Verify pipeline, deadline, and history views behave consistently under the new policy.

### 4. Schema lifecycle cleanup
- [x] Remove implicit schema mutation from app startup.
- [x] Introduce or document the supported init/migration path for local and future production use.

### 5. Exception handling refinement
- [x] Replace broad catch-all blocks in critical workflows with typed failure handling.
- [x] Preserve intentional fallback behavior only where product requirements explicitly allow it.

### 6. Test coverage
- [x] Add regression tests for async/sync boundary behavior.
- [x] Add tests for failed persistence cleanup behavior.
- [x] Add tests for timezone-sensitive comparisons and serialized responses.
- [x] Add tests for startup/init behavior without implicit table creation.

## Affected Areas

- `src/backend/main.py`
- `src/backend/database.py`
- `src/backend/services/job_capture.py`
- `src/backend/services/application_materials.py`
- `src/backend/services/fit_analyzer.py`
- `src/backend/services/desirability_scorer.py`
- `src/backend/utils/file_storage.py`
- related routers, schemas, and tests

## Success Criteria

- [x] No backend workflow relies on nested `asyncio.run(...)` during request handling.
- [x] File-backed persistence either completes atomically from the caller’s perspective or cleans up safely on failure.
- [x] Datetime storage and comparisons use one documented policy across the backend.
- [x] Application startup no longer mutates schema implicitly.
- [x] API and service layers expose clearer, typed failure behavior with targeted fallbacks only where intended.
