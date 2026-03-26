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

## Lint and format

### Check the repository with Biome

Run:

```bash
pnpm lint
```

This runs `biome check .` and reports lint and formatting issues without modifying files.

### Apply Biome fixes

Run:

```bash
pnpm lint:fix
```

This runs `biome check --write .` and applies Biome's safe fixes across the repository.

### Typechecking

Run:

```bash
pnpm typecheck
```

## Run tests

### Frontend tests

Run all frontend tests:

```bash
pnpm test

Run a single frontend test file:

```bash
pnpm vitest run tests/app/page.test.tsx
```

## GitHub Pages static deployment

The app supports a dedicated static export flow for GitHub Pages while keeping normal local development unchanged.

### Build the GitHub Pages export locally

Run:

```bash
pnpm build:pages
```

This enables the static export build and writes the deployable site to `out/`.

### Repository-path deployment behavior

The GitHub Pages build currently targets the default project Pages URL for this repository, so it enables a repository subpath during the Pages build.

- `PYP_STATIC_EXPORT=true` turns on Next.js `output: "export"`
- `PYP_PAGES_ENABLE_REPO_PATH=true` enables repo-subpath URL generation
- `PYP_PAGES_REPO_PATH=/plot-your-path` sets the current repository base path

When the site later moves to a custom subdomain, disable the repo-path setting so the app serves from the domain root instead of the repository path.

### GitHub Actions deployment

The GitHub Pages workflow lives at `.github/workflows/deploy-pages.yml`.

- it runs on pushes to `main`
- it also supports manual dispatch
- it builds the static export with `pnpm build:pages`
- it uploads `out/` as the Pages artifact

If the default branch changes, update the workflow trigger to match.

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
