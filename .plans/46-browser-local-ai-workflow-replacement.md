# Plan: Browser-Local AI Workflow Replacement

## Overview

Replace backend-dependent AI workflow orchestration with TypeScript/browser-driven implementations so AI-assisted MVP workflows no longer require the Python backend.

This phase should happen after core browser-local data workflows are in place so AI features can read and write against the new local data model.

## Prerequisites

- `.plans/45-browser-local-data-api-cutover.md`

## Goals

1. Move AI-assisted MVP workflows off backend endpoints.
2. Keep API keys local and excluded from exports.
3. Preserve traceability and durable output behavior while simplifying architecture.

## Technical Design

### 1. Browser-local AI settings and provider access

Refactor direction:
- Store AI configuration locally in the browser/device.
- Replace backend token/settings endpoints with local settings management.
- Keep provider integration thin, explicit, and separable from domain workflows.

### 2. Browser-driven generation and evaluation

Refactor direction:
- Move AI workflow orchestration into TypeScript services that run in the browser-hosted app model.
- Ensure outputs read from and persist to browser-local workspace data.

Likely workflows:
- fit analysis
- desirability scoring
- cover letter generation
- application Q&A support
- interview prep pack generation/regeneration
- resume sync and resume tuning

### 3. Traceability and failure handling

Refactor direction:
- Preserve traceability metadata and user-facing error handling.
- Make browser limitations and provider failures explicit without reintroducing hidden server behavior.

## Implementation Steps

### 1. Replace AI settings management
- [ ] Move AI settings and API-key handling fully into browser-local storage.
- [ ] Replace backend AI settings and healthcheck flows with client-side equivalents where appropriate.

### 2. Replace AI workflow orchestration
- [ ] Reimplement core AI workflows in browser-local TypeScript services.
- [ ] Persist generated outputs and analysis results to the browser-local data layer.

### 3. Validate parity and isolate backend remnants
- [ ] Verify all in-scope AI MVP workflows function without backend AI endpoints.
- [ ] Remove or isolate backend AI codepaths no longer needed after the replacement.

## Affected Areas

- frontend AI settings and modal flows
- job detail AI actions and generated-output flows
- local settings storage
- browser-side provider/service adapters
- backend AI routers/services previously supporting MVP workflows

## Success Criteria

- [ ] In-scope AI MVP workflows run without Python backend orchestration.
- [ ] API keys remain local-only and excluded from exports.
- [ ] Generated outputs and analyses remain traceable and durable where intended.
