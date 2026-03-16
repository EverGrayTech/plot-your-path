# Plan: Local-First Trust UX and Legacy Retirement

## Overview

Finish the MVP pivot by making the new trust model visible to users and deliberately retiring or archiving the legacy backend/desktop path.

This phase is about cleanup and clarity. It should happen only after the browser-local MVP path is functional enough to stand on its own.

## Prerequisites

- `.plans/34-web-local-first-foundation.md`
- `.plans/35-client-storage-and-portability-foundation.md`
- `.plans/36-ai-workflows-browser-mvp.md`
- `.plans/37-core-mvp-browser-workflows.md`

## Goals

1. Make the local-first trust model visible in the product experience.
2. Add the UX needed for backup/export confidence.
3. Remove ambiguity about what parts of the old runtime path remain active.
4. Deliberately archive or retire outdated backend/desktop surfaces.

## Technical Design

### 1. Trust messaging

Refactor direction:
- Explain clearly that workspace data is stored locally in the browser/device by default.
- Explain how export/import works and why it matters.

### 2. Data-management UX

Refactor direction:
- Add reset/remove controls where appropriate.
- Make export/import easy to find.
- Add backup reminders after major changes and periodically afterward.

### 3. Legacy path retirement

Refactor direction:
- Remove or archive code, scripts, and docs that imply the old path is still the active MVP default.
- Keep only the amount of archived context needed for repository history and traceability.

## Implementation Steps

### 1. Add trust UX
- [x] Add clear local-storage and export/import messaging in the product.
- [x] Add reset/remove controls for local data and local AI settings where appropriate.

### 2. Add backup confidence features
- [x] Implement backup reminder behavior.
- [x] Improve export/import result messaging and confirmation surfaces.

### 3. Retire the legacy path deliberately
- [x] Audit legacy backend, desktop scripts, and runtime assumptions.
- [x] Remove or archive surfaces that no longer belong in the active MVP path.
- [x] Update contributor guidance so the active path is unambiguous.

## Affected Areas

- settings and data-management UI
- contributor docs and scripts
- archived desktop/backend materials
- repository cleanup follow-up tasks

## Success Criteria

- [x] Users understand that their data is local by default and know how to back it up.
- [x] The active MVP path no longer depends on the legacy desktop/backend runtime.
- [x] The repository clearly distinguishes active architecture from archived history.
