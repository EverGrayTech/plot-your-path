# Plan: Client Storage and Portability Foundation

## Overview

Implement the client-side persistence and portability foundation for the browser-hosted MVP.

This phase covers local storage, export/import behavior, merge rules, and backup expectations. It does not attempt to rebuild every feature that will use those foundations.

## Prerequisites

- `.plans/34-web-local-first-foundation.md`
- review `docs/architecture-pivot-web-local-first.md`
- review `docs/system-spec.md`

## Goals

1. Establish browser-local persistence as the runtime default.
2. Implement explicit export/import as the portability model.
3. Define deterministic merge behavior for imported backups.
4. Make the product’s local-first trust model concrete in data behavior.

## Technical Design

### 1. Runtime persistence baseline

Refactor direction:
- Use IndexedDB as the canonical runtime persistence layer for MVP.
- Keep storage access behind a light abstraction rather than scattering direct browser storage calls across the UI.

### 2. Export/import format

Refactor direction:
- Use a zip archive as the canonical export/import format.
- Store readable JSON inside the archive.
- Include manifest version metadata for validation and future evolution.

### 3. Merge behavior

Refactor direction:
- Use app-generated stable IDs on durable entities.
- Match by ID first during import.
- When the same record exists in both places, newer `updatedAt` wins for MVP.
- Surface a clear import summary.

### 4. Secret handling

Refactor direction:
- Export provider/model settings where appropriate.
- Never export API keys.

## Implementation Steps

### 1. Define local data contracts
- [ ] Define the durable entity and metadata requirements needed for local persistence.
- [ ] Ensure stable IDs and timestamps are available where merge behavior requires them.

### 2. Build the persistence layer
- [ ] Implement a light client-side repository/storage abstraction.
- [ ] Add IndexedDB-backed persistence for the core MVP workspace entities.

### 3. Build export/import workflows
- [ ] Implement zip-based export generation.
- [ ] Implement import validation against manifest/schema expectations.
- [ ] Implement merge-on-import with deterministic update rules.

### 4. Add trust-oriented UX hooks
- [ ] Add export/import status messaging.
- [ ] Add backup reminder support after major changes and over time.

## Affected Areas

- frontend storage and data-access code
- data portability workflow surfaces
- settings/data-management UI
- tests for export/import and merge behavior

## Success Criteria

- [ ] Core workspace data persists locally in the browser without relying on the legacy backend.
- [ ] Users can export a meaningful workspace archive.
- [ ] Users can import older backups without losing newer local data by default.
- [ ] API keys are excluded from exports.
