# Plot Your Path — Development Workflows

This document covers the practical developer guide and contributor workflows for running and testing the project locally.

## Set up Development Environment

These steps assume development from the repository root.

### Install Node dependencies

```bash
pnpm install
```

### Run the app locally

Start the frontend:

```bash
pnpm dev --hostname 0.0.0.0 --port 3000
```

The frontend lives directly under `src`, so it can be started from the repository root without passing an app directory.

### Open the app

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
pnpm vitest run tests/app/page.test.tsx
```

## Design system consumption

The frontend uses the `@evergraytech/design-system` npm package as the source of truth for foundational visual values. The upstream consumption guide defines the full rules; here is a quick reference:

### What must come from the design system

Colors, typography, spacing, radii, motion, semantic states, and accent values. These are consumed via CSS custom properties imported from `@evergraytech/design-system/dist/variables.css` in `src/app/globals.css`.

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

If implementation direction starts to drift from these docs, resolve it deliberately rather than letting the project evolve by accident.
