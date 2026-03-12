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

Once the design system has been updated to address the requirement docs, add a short investigation/alignment pass before starting implementation plans.

That pass should:

- verify which requirement docs were fully satisfied upstream
- identify any remaining product-local gaps or temporary exceptions
- map new design-system guidance/outputs directly into Plan 28 implementation scope
- confirm whether Plans 29 and 30 should be adjusted based on new upstream patterns

This should be treated as a small prerequisite checkpoint, not a separate major refactor. Its purpose is to prevent starting app work against stale assumptions about the design system.

## Success Criteria

- [x] The roadmap is split into focused plans with clear boundaries.
- [x] Each plan has an explicit dependency story.
- [x] Design system adoption is treated as a prerequisite foundation rather than late polish.
- [x] Non-technical distribution is planned as a product experience, not only a packaging exercise.
- [x] UX simplification is tied directly to the documented core user journey.
- [x] Design-system requirement gaps have been captured for upstream follow-up before implementation begins.
