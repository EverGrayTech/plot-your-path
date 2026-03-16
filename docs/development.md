# Plot Your Path — Development Workflows

See also: [README](../README.md), [Product Overview](./product-overview.md#in-scope), [System Specification](./system-spec.md#roadmap-framing)

## Purpose

This document covers the practical workflows for running and testing the project locally.

For product intent and architectural direction, start with [Product Overview → In scope](./product-overview.md#in-scope) and [System Specification → Roadmap framing](./system-spec.md#roadmap-framing).

## Current direction note

The active MVP direction is a browser-hosted local-first web application with a TypeScript-centered architecture.

This document treats the web app as the default development path. Legacy Python-backend and desktop-runtime materials remain archived repository context only and should not be treated as the normal way to run or contribute to the app.

## Set up Development Environment

These steps assume development from the repository root.

### 1. Install Node dependencies

```bash
pnpm install
```

### 2. Configure the environment

```bash
cp .env.example .env
```

The primary local app URL is:

- frontend app: `http://localhost:3000`

### 3. Archived legacy tooling note

The repository still contains legacy Python/Tauri materials during the transition away from that architecture.

Those tools are not part of the active default development workflow. If you need to inspect archived runtime history, use the archived docs rather than treating those workflows as current setup steps.

## Run the app locally

### Preferred current workflow

Start the frontend:

```bash
pnpm dev src/frontend --hostname 0.0.0.0 --port 3000
```

The frontend lives in `src/frontend`, so the app directory must be passed when running from the repository root.

Open:

- `http://localhost:3000`

### Open the app

Open:

- `http://localhost:3000`

If localhost forwarding is unavailable in your environment, determine the machine IP and open the app with that address instead.

```bash
hostname -I
```

## Run tests

### Frontend tests

Run all frontend tests:

```bash
pnpm test
```

Run frontend tests with coverage:

```bash
pnpm test:coverage
```

Run a single frontend test file:

```bash
pnpm vitest run tests/frontend/app/jobs.page.test.tsx
```

## Archived runtime references

If you need historical context about the retired desktop/runtime path, see:

- [Desktop Runtime Foundation](./desktop-runtime.md)
- [Windows Release Readiness](./windows-release-readiness.md)

Those materials are archived context, not active contributor guidance.

## Design system consumption

The frontend uses the `@evergraytech/design-system` npm package as the source of truth for foundational visual values. The upstream consumption guide defines the full rules; here is a quick reference:

### What must come from the design system

Colors, typography, spacing, radii, motion, semantic states, and accent values. These are consumed via CSS custom properties imported from `@evergraytech/design-system/dist/variables.css` in `src/frontend/app/globals.css`.

### What remains local

Layout composition, component-internal dimensions, app-specific breakpoints, content-driven spacing adjustments, and z-index layering.

### Exception handling

If a value does not exist in the token set: check if an existing token fits, request upstream if not, and document a temporary local override with a `/* TODO: upstream to design system */` comment.

### Update flow

Bump `@evergraytech/design-system` version in `package.json`, review changelog, rebuild.

## Documentation use during development

When making non-trivial changes:

1. use the [Product Overview](./product-overview.md) to check product intent and scope
2. use the [Concept Model](./concept-model.md) to keep terminology consistent
3. use the [System Specification](./system-spec.md) to preserve architectural guardrails
4. use the [Web Local-First Architecture Pivot](./architecture-pivot-web-local-first.md) when deciding whether work belongs on the new MVP path or in archived transition context

If implementation direction starts to drift from these docs, resolve it deliberately rather than letting the project evolve by accident.
