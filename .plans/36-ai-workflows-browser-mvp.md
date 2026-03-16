# Plan: AI Workflows for the Browser MVP

## Overview

Implement the MVP AI workflows on the new browser-local architecture.

This phase covers provider configuration, role evaluation flows, and application-help generation boundaries. It assumes the client storage foundation is in place.

## Prerequisites

- `.plans/35-client-storage-and-portability-foundation.md`
- review `docs/architecture-pivot-web-local-first.md`
- review `docs/product-overview.md`

## Goals

1. Support one AI provider in the browser-hosted MVP.
2. Enable BYO API key configuration stored locally for convenience.
3. Implement LLM-assisted role evaluation and application-help workflows.
4. Keep AI outputs useful, traceable, and honestly framed.

## Technical Design

### 1. Provider model

Refactor direction:
- Support one provider first.
- Store API keys locally in browser storage/settings.
- Keep provider settings distinct from exported secrets.

### 2. Role evaluation flow

Refactor direction:
- Implement LLM-assisted fit/desirability analysis from pasted resume and job description inputs.
- Structure requests and responses so rendering is stable even if wording varies.

### 3. Application assistance flow

Refactor direction:
- Prioritize cover letter support and form-answer help.
- Treat cover letters as durable outputs.
- Allow other support outputs to remain regenerable in MVP.

### 4. UX framing

Refactor direction:
- Present AI outputs as assistance rather than objective truth.
- Preserve awareness of source inputs and user authorship.

## Implementation Steps

### 1. Add provider settings
- [ ] Add settings UX for one provider and local API key storage.
- [ ] Ensure keys are removable/resettable.

### 2. Implement evaluation flows
- [ ] Build the fit/desirability evaluation workflow around the browser-local data model.
- [ ] Ensure the outputs are shaped for reliable UI rendering.

### 3. Implement application-help flows
- [ ] Build durable cover letter generation/storage behavior.
- [ ] Build regenerable assistance flows for form/question help.

### 4. Add safeguards and messaging
- [ ] Add input validation for missing or weak pasted input.
- [ ] Add user-facing messaging about model variability and responsibility for final output.

## Affected Areas

- AI settings and provider adapters
- evaluation and generation workflows
- jobs/application UI flows
- tests around provider configuration and output handling

## Success Criteria

- [ ] Users can configure one provider locally and use it without a server-managed secret flow.
- [ ] Role evaluation works from pasted inputs in the browser-hosted MVP.
- [ ] Cover letters are saved durably while other temporary outputs can be regenerated.
- [ ] The UI frames AI outputs as helpful guidance rather than authority.
