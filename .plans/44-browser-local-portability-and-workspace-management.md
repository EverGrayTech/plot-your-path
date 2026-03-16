# Plan: Browser-Local Portability and Workspace Management

## Overview

Replace backend-backed data portability and workspace management with browser-local implementations.

This phase should make backup/export/import/reset truly local-first rather than browser-facing wrappers over backend behavior.

## Prerequisites

- `.plans/41-browser-local-storage-foundation.md`
- `.plans/42-browser-local-jobs-and-skills-migration.md`
- `.plans/43-browser-local-application-ops-and-outcomes-migration.md`

## Goals

1. Rebuild export/import/reset against browser-local data.
2. Preserve readable, versioned, merge-aware backups.
3. Keep workspace-management UX aligned with the trust model.

## Technical Design

### 1. Export/import implementation

Refactor direction:
- Implement browser-local export/import over the client-side data model.
- Preserve readable JSON, version metadata, and merge-aware behavior.

### 2. Workspace summary and reminders

Refactor direction:
- Build the data summary, last-export/import/reset tracking, and backup reminders from local metadata.
- Keep trust messaging intact.

### 3. Reset semantics

Refactor direction:
- Ensure reset/delete clears the intended local workspace data safely.
- Exclude local AI keys from exports while preserving separate local settings semantics.

## Implementation Steps

### 1. Replace portability endpoints
- [x] Replace export/import/reset logic with browser-local implementations.
- [x] Implement local workspace summary metadata and backup reminder calculations.

### 2. Validate import/export semantics
- [x] Preserve readable archive structure, versioning, and merge-oriented import behavior.
- [x] Add/update tests for browser-local backup and restore flows.

### 3. Validate reset and trust behavior
- [x] Ensure reset clears the intended local workspace data only.
- [x] Keep API keys excluded from export flows.

## Affected Areas

- data management panel
- portability/archive implementation
- local metadata and backup reminder logic
- browser-local workspace management tests

## Success Criteria

- [x] Export/import/reset no longer require backend persistence endpoints.
- [x] Workspace management works entirely from browser-local data.
- [x] Backup UX remains trustworthy and understandable.
