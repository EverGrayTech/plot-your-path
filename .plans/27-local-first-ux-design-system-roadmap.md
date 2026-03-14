# Plan: Local-First Distribution, UX Simplification, and Design System Roadmap

## Overview

This roadmap breaks the next major phase of Plot Your Path into a small set of focused, dependency-aware plans. The three strategic goals are:

1. make the product easy for non-technical users to run with local data
2. streamline the experience so the core workflow feels calm, clear, and delightful
3. adopt the EverGray Tech design system as the visual foundation for the app

These plans are intentionally sequenced so architectural and styling foundations land before broader workflow redesign and user packaging work.

## Why This Roadmap Exists

- The current app still reads as an internal development product rather than a polished user-ready tool.
- The frontend uses minimal inline styling and does not yet consume the company design system.
- The product flow is powerful but still exposes too many controls, modals, and decisions too early.
- Non-technical distribution requires more than a build artifact; it also needs a predictable runtime, understandable local data handling, and a safer first-run experience.

In short:

- establish the visual/design foundation first
- clarify the overall structure of the product next
- simplify the most important workflow after that
- package the product as a desktop app once the shell is stable
- finish with onboarding, portability, and release hardening

## Coordination Notes

- Plans 28 through 30 should stay tightly aligned with the product principles in `docs/product-overview.md`, especially immediate value first, progressive depth, and local-first trust.
- Plans 31 and 32 should preserve the existing backend guardrails in `docs/system-spec.md`, especially local storage, transparent data handling, and explicit control over sensitive career data.
- Desktop packaging should not introduce a cloud dependency or background service model that weakens the local-first positioning.

## Alignment Gate After Design System Updates

The design system has been updated to address the requirement gaps identified during roadmap creation. The following upstream plans are now complete:

- **Plan 04 — Application Shell and Navigation**: Shell regions, navigation state behavior, three-tier hierarchy rules, responsive posture, and two reference shell patterns (primary workspace and lightweight secondary) are fully documented with token mappings.
- **Plan 05 — Forms and Action Controls**: Core control patterns, action variants (primary/secondary/tertiary/destructive), form support text, density/spacing posture, and recommended variant naming are fully specified.
- **Plan 06 — Data-Dense Workspace Patterns**: Table layout, stacked row summaries, grouped metadata blocks, scan hierarchy, density posture, embedded interaction states (hover, selection, keyboard, inline actions, expand/collapse), and empty state patterns are all defined.
- **Plan 07 — Overlays and Feedback States**: Modal dialog, popover, and toast patterns; backdrop and elevated-layer behavior; enter/exit motion; and feedback state guidance (empty, loading, progress, success, warning, error) with structured message anatomy and tone rules are complete.
- **Plan 08 — Status, Priority, and Decision Signals**: Text badges, pills/tags, dot indicators, counter badges, row-level priority markers, color and non-color signaling rules, priority palette, and urgency escalation guidance are documented.

Additionally, the design system now publishes a **consumption guide** that defines the `@evergraytech/design-system` npm package, specific import paths (`dist/variables.css`, `dist/tokens.json`, `dist/logo.svg`), what must come from the design system vs. local decisions, exception handling process, and Next.js integration examples.

### Alignment findings

- All requirement areas identified during roadmap creation have been addressed upstream. No remaining product-local gaps require temporary exceptions at this time.
- Plans 28 through 30 have been updated to reference the specific upstream guidance documents and token mappings directly rather than inventing local visual rules.
- Plans 09 and 10 (website brand atmosphere and marketing site patterns) are not relevant to Plot Your Path plans.

## Success Criteria

- [x] The roadmap is split into focused plans with clear boundaries.
- [x] Each plan has an explicit dependency story.
- [x] Design system adoption is treated as a prerequisite foundation rather than late polish.
- [x] Non-technical distribution is planned as a product experience, not only a packaging exercise.
- [x] UX simplification is tied directly to the documented core user journey.
- [x] Design-system requirement gaps have been captured for upstream follow-up before implementation begins.
- [x] Upstream design-system updates are complete and alignment has been verified.
- [x] Plans 28–30 have been updated to reference upstream guidance directly.
