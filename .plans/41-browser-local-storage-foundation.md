# Plan: Browser-Local Storage Foundation

## Overview

Create the browser-local storage and repository foundation needed to replace backend persistence safely.

This phase should establish the core client-side storage model before feature-by-feature workflow migration begins.

## Prerequisites

- `.plans/39-legacy-dependency-audit-and-cut-line.md`
- `.plans/40-remove-archived-runtime-from-active-surface-area.md`

## Goals

1. Establish a durable browser-local persistence layer for core MVP entities.
2. Define local repository/service boundaries that the frontend can migrate onto.
3. Create a storage foundation that supports later export/import/reset and AI workflow persistence.

## Technical Design

### 1. Storage engine and schema foundation

Refactor direction:
- Implement a browser-local storage engine suitable for structured MVP data.
- Define versioned local schema/storage conventions for durable entities.

### 2. Repository boundary

Refactor direction:
- Introduce repository/service interfaces for local data access.
- Keep the storage layer decoupled from UI components and hooks.

### 3. Migration readiness

Refactor direction:
- Create the minimum shared utilities needed for later feature migration.
- Avoid feature-specific logic in the storage foundation itself.

## Implementation Steps

### 1. Build the storage foundation
- [ ] Implement the browser-local storage engine and schema/version scaffolding.
- [ ] Add repository/service primitives for core entity access.

### 2. Add cross-cutting local-data utilities
- [ ] Add ID, timestamp, serialization, and migration helpers as needed.
- [ ] Add test coverage for storage initialization and basic CRUD behavior.

### 3. Prepare later migrations
- [ ] Document the local data boundaries future phases should migrate to.
- [ ] Ensure the foundation supports later portability and AI artifact persistence work.

## Affected Areas

- frontend local data/storage layer
- shared browser-local data utilities
- tests for storage and repositories

## Success Criteria

- [ ] The app has a real browser-local persistence foundation.
- [ ] Later workflow migrations can target local repositories rather than inventing storage ad hoc.
- [ ] Storage/versioning concerns are handled centrally.
