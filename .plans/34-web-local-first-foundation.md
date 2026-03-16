# Plan: Web Local-First Foundation

## Overview

Establish the new MVP foundation for Plot Your Path as a browser-hosted local-first web application rather than a Python-backed Tauri desktop app.

This phase is about setting the baseline architecture and contributor direction, not rebuilding every feature at once.

## Prerequisites

- `.plans/30-core-workflow-usability-simplification.md`
- review `docs/architecture-pivot-web-local-first.md`

## Goals

1. Make the new browser-local MVP direction explicit in the codebase and contributor workflows.
2. Establish the TypeScript-centered baseline for future implementation work.
3. Reduce ambiguity about whether desktop runtime work is still the primary path.
4. Prepare the repository for follow-on phases that remove dependency on the legacy backend path.

## Technical Design

### 1. Active architecture baseline

Refactor direction:
- Treat the web application as the primary runtime surface.
- Stop treating the packaged desktop path as the default target for MVP work.
- Preserve archived desktop material only as historical and transition context.

### 2. Contributor workflow alignment

Refactor direction:
- Make sure repository docs and development workflow cues point contributors toward the new MVP path first.
- Reduce the chance that future work accidentally expands the deprecated desktop/runtime path.

### 3. Implementation boundary definition

Refactor direction:
- Clarify which future work belongs in client-side TypeScript implementation phases.
- Separate architectural decision records from implementation plans.

## Implementation Steps

### 1. Align repository guidance
- [x] Ensure top-level and architecture docs point to the browser-local MVP as the active direction.
- [x] Mark desktop-runtime material as archived or transition-era where needed.

### 2. Define the implementation sequence baseline
- [x] Create follow-on plans for client persistence, AI workflows, and legacy retirement under the new direction.
- [x] Ensure those plans reference the architecture pivot doc rather than restating it inconsistently.

### 3. Reduce active ambiguity
- [x] Remove or relocate ad hoc notes that mix architecture rationale with phase-specific implementation work.
- [x] Ensure contributors can tell which phases are active versus archived.

## Affected Areas

- top-level repository docs
- architecture docs in `docs/`
- future implementation plan set in `.plans/`
- archived desktop guidance references

## Success Criteria

- [x] Contributors can identify the browser-hosted local-first MVP as the active architecture without ambiguity.
- [x] Architectural rationale lives in `docs/`, not mixed into implementation phases.
- [x] The follow-on plan set is ready for execution in scoped phases.
