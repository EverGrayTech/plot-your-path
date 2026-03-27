# Plan: Homepage Intro Refresh

## Overview

Replace the current utility-style home page with a static welcome and introduction experience that helps first-time visitors understand Plot Your Path quickly, trust the product stance, and move into the live app with a clear next step. This phase should align homepage messaging with the company website app catalog so public-facing positioning stays consistent across both surfaces.

## Prerequisites

- `.plans/29-app-shell-and-navigation-refresh.md`
- `.plans/55-logo-integration.md`

## Goals

1. Explain Plot Your Path as a workspace for making better career decisions with clarity and confidence.
2. Help a first-time visitor understand the product within 5–10 seconds before asking for deeper reading.
3. Emphasize practical user value first, with technical and trust details supporting credibility later in the page.
4. Reuse the existing layout and style system while keeping the implementation static.
5. Align `src/app-metadata.ts` with the new public-facing positioning and reusable brand assets.

## Technical Design

### 1. Replace the current home page with an intro-first structure

Refactor direction:
- Keep the page as static server-rendered JSX and CSS.
- Replace the current grid of operational navigation cards with a content-led introduction page.
- Preserve a strong path into `/roles` so the intro page still functions as an entry point into the live app.

### 2. Lead with practical career-decision framing

Refactor direction:
- Use the agreed hero tagline: **Make better career decisions with clarity and confidence.**
- Support it with concise copy explaining that Plot Your Path helps users evaluate opportunities, reuse experience, and move through applications and interviews more intentionally.
- Keep tone grounded, product-focused, and trustworthy rather than promotional.

### 3. Lean into the path and reinforcing-loop story

Refactor direction:
- Introduce the idea that Plot Your Path is not just for one application cycle; it gets stronger as the user moves through capture, evaluation, preparation, evidence capture, and reflection.
- Add a section that explains this compounding loop in plain language.
- Where feasible in this phase, include a static visual treatment that suggests a reinforcing loop or circular journey.
- If a polished loop graphic is not cleanly achievable with the existing styling system, preserve the section and content structure now and note a follow-up for a dedicated SVG or illustration.

### 4. Use selective depth instead of long uninterrupted copy

Refactor direction:
- Organize the page into scannable sections with short introductions and concise lists or cards.
- Prioritize quick visitor understanding first, then optional deeper reading through later sections.
- Keep technical differentiators readable for non-engineers and position them as credibility signals rather than implementation trivia.

### 5. Align app metadata for external reuse

Refactor direction:
- Update `src/app-metadata.ts` so the app catalog can reuse the stronger homepage positioning.
- Add logo asset references based on `public/logo.svg` or a derived asset when useful for external consumption.
- Keep metadata easy to consume by the company website without requiring homepage scraping.

## Implementation Steps

### 1. Add the plan and lock messaging direction
- [x] Keep the content direction aligned with the product overview and system specification.

### 2. Replace the homepage content structure
- [x] Update `src/app/page.tsx` to render the new introduction sections.
- [x] Keep a primary CTA into `/roles` and at least one secondary orientation path.
- [x] Remove the old homepage framing that presents the page primarily as an operational dashboard.

### 3. Add supporting homepage styling
- [x] Extend `src/app/globals.css` with lightweight homepage-specific layout classes.
- [x] Reuse existing card, button, and grid patterns where possible.
- [x] Ensure the page remains readable and well-structured on narrow screens.

### 4. Align reusable metadata
- [x] Update `src/app-metadata.ts` with the revised tagline and short description.
- [x] Add logo asset references for downstream app-catalog reuse.
- [x] Keep capability language aligned with the homepage and product docs.

### 5. Validate homepage behavior
- [x] Update homepage tests for the new sections, primary CTA, and status messaging.
- [x] Run repository formatting.
- [x] Run the full frontend test suite.

## Affected Areas

- `.plans/56-homepage-intro-refresh.md`
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/app-metadata.ts`
- `tests/app/page.test.tsx`

## Success Criteria

- [x] The homepage clearly explains Plot Your Path within a few seconds of scanning.
- [x] The page emphasizes practical career decision value before technical detail.
- [x] The page includes a clear path into the live app.
- [x] The path or reinforcing-loop concept is communicated through content and, if feasible, a static visual treatment.
- [x] Styling stays aligned with the existing shell and design system.
- [x] `src/app-metadata.ts` reflects the new public-facing positioning and includes reusable logo asset references.
- [x] Homepage tests, formatting, and the full frontend test suite pass.
