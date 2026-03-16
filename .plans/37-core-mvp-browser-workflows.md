# Plan: Core MVP Browser Workflows

## Overview

Rebuild the most important user-facing workflows on the browser-local architecture so the new MVP path provides real product value without relying on the legacy backend/runtime path.

This phase focuses on the minimum complete experience, not the full historical feature set.

## Prerequisites

- `.plans/35-client-storage-and-portability-foundation.md`
- `.plans/36-ai-workflows-browser-mvp.md`
- review `docs/architecture-pivot-web-local-first.md`

## Goals

1. Support pasted resume input.
2. Support pasted job description input.
3. Support browser-local role evaluation flows.
4. Support application-help flows that are useful in the MVP.

## Technical Design

### 1. Resume workflow

Refactor direction:
- Treat resume content as pasted text for MVP.
- Keep storage and editing simple.

### 2. Opportunity workflow

Refactor direction:
- Treat opportunities as pasted job descriptions for MVP.
- Avoid dependency on arbitrary URL capture or scraping.

### 3. Evaluation workflow

Refactor direction:
- Connect pasted user inputs to the browser-local evaluation path.
- Keep outputs understandable and easy to revisit.

### 4. Application-help workflow

Refactor direction:
- Support durable cover-letter outputs.
- Support regenerable assistance for application questions.

## Implementation Steps

### 1. Resume flow
- [x] Implement resume creation and editing from pasted text.
- [x] Persist resume content locally in the new storage path.

### 2. Job description flow
- [x] Implement job creation and editing from pasted text.
- [x] Persist role/job records locally in the new storage path.

### 3. Evaluation flow
- [x] Connect local role records and resume content to fit/desirability evaluation.
- [x] Surface saved versus regenerable outputs appropriately.

### 4. Application-help flow
- [x] Build the durable cover-letter workflow.
- [x] Build the temporary application-answer support workflow.

## Affected Areas

- jobs capture UI
- resume/profile UI
- evaluation results UI
- application assistance UI
- frontend data flow and persistence integration

## Success Criteria

- [x] A user can paste a resume, paste a job description, and evaluate the role in the browser-local MVP path.
- [x] A user can generate and retain a cover letter for a role.
- [x] The core MVP loop works without requiring the legacy Python/Tauri runtime path.
