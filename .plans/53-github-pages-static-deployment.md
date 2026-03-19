# Plan: GitHub Pages Static Deployment

## Overview

Prepare the App Router Next.js application for GitHub Pages deployment using a static export flow, while keeping local development behavior unchanged and preserving flexibility for a future custom subdomain cutover.

This follow-up also fixes the Pages workflow after CI failures related to pnpm workspace detection and modernizes the workflow actions/runtime expectations for another deployment attempt.

## Prerequisites

- `.plans/53-role-terminology-hard-cutover.md`

## Goals

1. Add a dedicated GitHub Pages build command that enables the existing static export mode without changing the normal local development workflow.
2. Extend Next.js configuration so GitHub Pages-compatible path settings can be enabled or disabled through environment variables.
3. Add an official GitHub Actions workflow that builds, uploads, and deploys the static export output to GitHub Pages.
4. Leave clear documentation in code and plan status about the expected static output directory, deployment assumptions, and remaining risks.

## Technical Design

### 1. Dedicated static export build entrypoint

Refactor direction:

- Keep the existing `build` script for standard production builds.
- Add a `build:pages` script that sets the static export environment flag and runs the production build through pnpm-compatible script invocation.

### 2. Environment-driven GitHub Pages path configuration

Refactor direction:

- Preserve the conditional `output: "export"` behavior that is already controlled by environment variables.
- Add `trailingSlash: true` so exported routes align with static hosting expectations on GitHub Pages.
- Introduce clearly named environment variables for repository subpath deployment so `basePath` and `assetPrefix` can be turned on for Pages and turned off later for a custom domain.
- Keep the intent documented inline with brief comments rather than adding separate documentation files.

### 3. Official Pages deployment workflow

Refactor direction:

- Add a workflow under `.github/workflows/` that runs on pushes to the default branch and on manual dispatch.
- Use pnpm for dependency installation, run the dedicated Pages build script, upload the exported static directory, and deploy with the official GitHub Pages actions.
- Include the required workflow permissions and Pages environment settings.

### 4. Deployment verification and rollout notes

Refactor direction:

- Confirm the exported output directory produced by Next.js static export.
- Record the assumed repository subpath and default branch expectations.
- Note remaining GitHub Pages risks, especially around static export compatibility and any future subdomain transition.

### 5. Workflow reliability hardening

Refactor direction:

- Make the repository's pnpm workspace metadata valid for a single-package setup so CI installation does not fail.
- Add an explicit pnpm package manager version to `package.json`.
- Upgrade workflow actions to current major versions that avoid the observed Node 20 deprecation warnings.
- Configure package installation auth if GitHub Packages access is required for `@evergraytech/design-system`.

## Implementation Steps

### 1. Add the Pages build entrypoint

- [x] Update `package.json` to add `build:pages` using `PYP_STATIC_EXPORT=true`.
- [x] Keep existing development and standard build commands unchanged.

### 2. Update Next.js deployment configuration

- [x] Add `trailingSlash: true` to `next.config.mjs`.
- [x] Add conditional `basePath` and `assetPrefix` settings driven by clear environment variables.
- [x] Document the intended use of the environment variables inline.

### 3. Add GitHub Pages workflow

- [x] Create `.github/workflows/deploy-pages.yml`.
- [x] Configure checkout, pnpm setup, dependency installation, static export build, artifact upload, and Pages deployment.
- [x] Include Pages permissions and environment configuration.

### 4. Verify output and close the plan

- [x] Confirm the static export output directory that GitHub Pages should publish.
- [x] Capture branch and repository path assumptions.
- [x] Document remaining deployment risks.

### 5. Fix workflow installation and auth issues

- [ ] Update `pnpm-workspace.yaml` to a simplest-valid single-package configuration if required.
- [ ] Add an explicit `packageManager` field to `package.json` using the current pnpm version.
- [ ] Upgrade workflow actions and keep Pages deployment behavior unchanged.
- [ ] Add GitHub Packages auth in the workflow if the design-system dependency requires it.
- [ ] Reconfirm whether the repo is ready for another Pages deployment attempt.

## Affected Areas

- `package.json`
- `next.config.mjs`
- `.github/workflows/deploy-pages.yml`
- `pnpm-workspace.yaml`

## Success Criteria

- [x] `package.json` includes a dedicated `build:pages` script for GitHub Pages static export.
- [x] `next.config.mjs` supports static export plus optional repository subpath settings through environment variables.
- [x] `.github/workflows/deploy-pages.yml` builds and deploys the exported static site using official GitHub Pages actions.
- [x] The expected exported output directory and publish target are explicitly confirmed.
- [x] Assumptions and remaining GitHub Pages risks are identified without unrelated refactors.
- [ ] pnpm workspace metadata is valid for CI in a single-package repository.
- [ ] `package.json` declares an explicit pnpm `packageManager` version.
- [ ] The Pages workflow uses current action versions and any required package registry auth.
