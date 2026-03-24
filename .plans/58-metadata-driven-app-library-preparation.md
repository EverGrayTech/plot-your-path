# Plan: Metadata-Driven App Library Preparation

## Overview

Prepare Plot Your Path for company website app-library integration by making `src/app-metadata.ts` the single structured source of truth for both public app-library consumption and the in-app introduction experience. This phase should move overview content out of `src/app/introduction/page.tsx` page-local constants and into reusable metadata, and expose that metadata through a stable public JSON endpoint so downstream consumers can generate an intro card and overview page without directly consuming JSX or copying values into another repo.

## Prerequisites

- `.plans/56-homepage-intro-refresh.md`
- `.plans/57-homepage-lifecycle-and-support-actions.md`

## Goals

1. Make `src/app-metadata.ts` the only direct integration surface needed by the company website for Plot Your Path’s app-library entry.
2. Move public-facing overview content into structured metadata rather than leaving it embedded in page-local constants.
3. Refactor `src/app/introduction/page.tsx` so it renders from metadata instead of maintaining a separate copy of overview content.
4. Keep the rendered introduction page functionally and visually aligned with the current user experience.
5. Expose the metadata through a stable public JSON surface so the company website can consume it dynamically from the running Plot Your Path instance.
6. Establish a metadata shape and delivery pattern that can be reused by other apps in the company app library over time.

## Technical Design

### 1. Expand `src/app-metadata.ts` into a richer app-library contract

Refactor direction:
- Keep existing top-level fields such as `slug`, `name`, `tagline`, `shortDescription`, `status`, `assets`, `urls`, and `capabilities`.
- Add a structured `overview` section that contains the content currently embedded in `src/app/introduction/page.tsx`.
- Prefer plain structured data over any JSX, HTML fragments, or page-specific rendering logic.
- Keep the shape readable and portable so the company website can consume it without scraping or parsing page code.

Suggested overview coverage:
- hero eyebrow/title/description
- outcomes
- key features
- differentiators
- getting started steps
- technical differentiators
- current status

### 2. Make the introduction page a renderer of metadata

Refactor direction:
- Replace page-local content constants in `src/app/introduction/page.tsx` with reads from `appMetadata`.
- Preserve the existing section order and public-facing messaging unless there is a strong cleanup reason.
- Avoid duplicated public content between the page and metadata.

### 3. Keep the contract suitable for external consumers

Refactor direction:
- Structure fields so the company website can use them for both:
  - an app-library intro card
  - an app overview/detail page
- Favor generic naming that could scale to future apps.
- If useful, add exported TypeScript types to make the contract explicit and safer to consume.

### 4. Expose metadata through a stable public JSON endpoint

Refactor direction:
- Add a public metadata endpoint such as `/app-metadata.json` backed by `src/app-metadata.ts`.
- Return structured JSON rather than rendered HTML or page-derived content.
- Make this endpoint the preferred company-website integration surface so app-library content can update when Plot Your Path ships.
- Preserve a stable response shape so future apps can follow the same pattern.

### 5. Preserve current homepage behavior while improving portability

Refactor direction:
- Do not treat this as a homepage redesign phase.
- Keep CTA behavior, section layout, and current introduction-page presentation intact.
- Limit changes to content ownership, typing, and rendering source-of-truth.

## Implementation Steps

### 1. Add the plan and define the target metadata shape
- [x] Create this plan file in `.plans/` using current repository conventions.
- [x] Define the target `appMetadata` structure, including a reusable `overview` section.
- [x] Decide whether to export supporting metadata types from `src/app-metadata.ts` or a nearby shared type location.

### 2. Move public introduction content into metadata
- [x] Add hero, outcomes, features, differentiators, getting-started, technical-differentiator, and current-status content to `src/app-metadata.ts`.
- [x] Keep wording aligned with the existing introduction page unless deliberately refined.
- [x] Ensure top-level summary fields still support lightweight app-library card use.

### 3. Refactor the introduction page to consume metadata
- [x] Update `src/app/introduction/page.tsx` to read overview content from `appMetadata`.
- [x] Remove duplicated page-local constants that are now represented in metadata.
- [x] Keep the rendered page structure and CTA paths stable.

### 4. Strengthen the metadata contract for downstream reuse
- [x] Add or refine TypeScript typing for the metadata structure.
- [x] Ensure URLs and asset references remain clear for external consumers.
- [x] Confirm the resulting shape is sufficient for a company-site intro card and overview page without needing direct page imports.

### 5. Expose metadata publicly for dynamic consumption
- [x] Add a stable public JSON metadata endpoint backed by `src/app-metadata.ts`.
- [x] Ensure the endpoint returns structured metadata without presentation-specific shaping.
- [x] Confirm the endpoint is suitable for dynamic company-website consumption without scraping rendered pages.

### 6. Validate behavior and regression safety
- [x] Update or add tests covering metadata-driven rendering of the introduction page.
- [x] Add or update tests covering the public metadata endpoint.
- [x] Run repository formatting.
- [x] Run focused tests for metadata, endpoint, and introduction-page behavior.

## Affected Areas

- `.plans/58-metadata-driven-app-library-preparation.md`
- `src/app-metadata.ts`
- `src/app/app-metadata.json/route.ts` or equivalent public metadata endpoint location
- `src/app/introduction/page.tsx`
- introduction-page related tests
- metadata-related tests if introduced

## Success Criteria

- [x] `src/app-metadata.ts` contains all public-facing content needed for Plot Your Path’s app-library intro card and overview page.
- [x] `src/app/introduction/page.tsx` renders from metadata rather than page-local duplicate content.
- [x] The current introduction page remains functionally consistent after the refactor.
- [x] The metadata shape is structured enough for external consumption without direct JSX/page imports.
- [x] Plot Your Path exposes the same metadata through a stable public JSON endpoint suitable for dynamic consumption.
- [x] The contract is reusable enough to inform future company app-library integrations.
- [x] Relevant tests, formatting, and focused validation pass.
