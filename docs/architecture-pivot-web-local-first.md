# Plot Your Path — Web Local-First Architecture Pivot

See also: [README](../README.md), [Product Overview](./product-overview.md#product-principles), [System Specification](./system-spec.md#architectural-direction), [Development Workflows](./development.md#current-direction-note), [Desktop Runtime Foundation](./desktop-runtime.md)

## Purpose

This document records the architectural change in direction for Plot Your Path.

It explains why the project is pivoting away from the earlier Python-plus-Tauri desktop path, what decisions have been made for the MVP, and what constraints should govern the implementation plans that follow.

This document belongs in `docs/` because it is architectural guidance and decision rationale, not an execution checklist for a single implementation phase.

## Direction change summary

Plot Your Path should pivot away from the split Python backend and Tauri desktop shell for the MVP.

The preferred MVP direction is:

- a browser-hosted local-first web application
- a TypeScript-centered implementation
- browser-local persistence for core single-user workflows
- explicit export and import for portability
- no mandatory backend or desktop runtime in the core MVP path

## Why the direction changed

### 1. The product promise is about ownership, not packaging

The product’s trust model is centered on sensitive career data remaining under the user’s control.

For MVP, that does not require native desktop packaging. It requires:

- local storage by default
- clear user understanding of where data lives
- explicit portability and backup behavior
- minimal hidden infrastructure

### 2. The old direction added complexity without proportional product value

The Python-plus-Tauri path introduced substantial complexity in:

- backend runtime management
- local HTTP orchestration
- desktop packaging and toolchains
- cross-platform release validation
- contributor setup burden

That work did not strengthen the core loop as much as it increased implementation drag.

### 3. The agreed MVP does not require native desktop capabilities

The required MVP capabilities remain:

- user provides resume content
- user provides job descriptions
- system evaluates fit and desirability
- system assists with application writing, especially cover letters and answer support

Those workflows can be implemented in a browser-hosted TypeScript application.

## MVP decisions established by this change

### Delivery and runtime

- regular browser-hosted web app first
- no desktop shell in MVP
- no packaged installer requirement in MVP
- PWA remains possible later, but is not an MVP requirement

### User model

- single user
- single local workspace
- single device is acceptable for MVP
- cross-device movement happens through export/import

### Input model

- resume input: pasted text only
- job description input: pasted text only
- arbitrary URL scraping is not required in MVP

### AI model

- bring-your-own API key
- one provider first
- API key stored locally for convenience
- provider/model settings may be exported
- API keys must never be exported

### Evaluation and output model

- role fit and desirability may be LLM-assisted
- cover letters are durable outputs
- other generated outputs may remain regenerable in MVP

### Browser support

- modern Chromium
- modern Firefox
- offline support is not required in MVP

## Persistence and portability direction

### Runtime persistence

The MVP should favor browser-local persistence appropriate for structured single-user data.

IndexedDB is the preferred baseline because it is the strongest compatibility fit for the current browser target.

OPFS may be explored later, but it should not be foundational to MVP correctness.

### Export/import

Portability must be a first-class product workflow.

The canonical export/import format should be:

- a zip archive
- readable JSON inside
- versioned manifest metadata

The export should include workspace data and durable artifacts, but should not export API keys.

### Import behavior

Import should merge rather than replace.

MVP merge rules should use:

- app-generated stable IDs
- deterministic matching by ID first
- `updatedAt` as the default tie-breaker when the same record exists in both places

## Risks introduced by the new direction

### Browser-local storage is less tangible than visible files

Mitigation:

- clear product messaging
- strong export/import UX
- backup reminders

### LLM-first evaluation may be inconsistent

Mitigation:

- structured outputs
- careful prompt design
- explicit UX framing that results are guidance, not authority

### Merge behavior can become brittle if identity rules are weak

Mitigation:

- stable IDs on durable entities
- timestamps on mutable entities
- import validation before merge

### Local API key storage is convenient but sensitive

Mitigation:

- clear settings UX
- easy reset/remove controls
- never exporting keys

## Relationship to the earlier desktop path

The earlier desktop runtime direction remains part of the repository history and should be preserved as archived context.

It should not remain the implied default for future phases unless later product evidence clearly justifies returning to that model.

## How this document should be used

Future implementation plans in `.plans/` should treat this document as the architectural baseline for the MVP pivot.

If a future phase proposes adding back a backend service, desktop shell, or deeper filesystem integration, it should justify that explicitly against this direction rather than assuming it by default.
