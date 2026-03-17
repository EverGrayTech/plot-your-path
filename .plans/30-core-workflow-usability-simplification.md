# Plan: Core Workflow Usability Simplification

## Overview

Simplify the primary user workflow so the product feels more like a deliberate career workspace and less like a collection of powerful but loosely grouped capabilities. This phase focuses on the highest-value day-to-day experience: bringing in a role, understanding whether it matters, and acting on it without unnecessary friction.

The emphasis is not feature expansion. It is workflow clarity, hierarchy, copy, and interaction simplification.

## Prerequisites

- `.plans/28-design-system-foundation.md`
- `.plans/29-app-shell-and-navigation-refresh.md`

## Upstream Design System References

The following design system docs should be treated as the authoritative source for workflow surface, interaction, and feedback decisions:

- **Data-Dense Workspace Patterns** (`docs/data-dense-workspace-patterns.md`) — table layout, stacked row summaries, grouped metadata blocks, scan hierarchy (content priority tiers), density posture, embedded interaction states (hover, selection, keyboard focus, inline actions, expand/collapse), and empty state patterns.
- **Forms and Action Controls** (`docs/forms-and-action-controls.md`) — control patterns, action hierarchy (primary/secondary/tertiary/destructive), form support text (labels, helper, validation, success), density/spacing, and inline/page/section action placement.
- **Status, Priority, and Decision Signals** (`docs/status-priority-and-decision-signals.md`) — text badges, pills/tags, dot indicators, counter badges, row-level priority markers, color vs. non-color signaling, priority palette, and comparative signal guidance.
- **Overlays and Feedback States** (`docs/overlays-and-feedback-states.md`) — modal dialog, popover, and toast patterns; feedback states (empty, loading, progress, success, warning, error); prominence spectrum; structured message anatomy; and tone rules.

## Goals

1. Streamline the jobs experience around the core decisions users need to make.
2. Reduce cognitive load in the toolbar, list view, and role detail workflows.
3. Improve the capture flow so it feels reliable, guided, and forgiving.
4. Make status, next actions, and outcome-related information easier to scan.
5. Improve empty, loading, success, and error states so the product feels more confident and pleasant.

## Technical Design

### 1. Focus the Jobs Workspace on the Core Loop

Observed issues:
- The jobs experience exposes many adjacent capabilities at once.
- Important user decisions can get buried under secondary controls and modal entry points.

Refactor direction:
- Re-center the page around a smaller set of primary actions:
  - capture a role
  - review and prioritize roles
  - inspect one role deeply
  - take the next meaningful action
- Use progressive disclosure for advanced analysis and configuration-heavy features.
- Apply the upstream action hierarchy rules: page-level primary action (capture) uses accent treatment in the page header (right-aligned). Section-level actions (filter, sort) use ghost/icon buttons. Advanced configuration (AI settings, factor settings) moves to Tier 3 utility positions or behind overflow menus — per forms guidance Section 2.3 and app shell guidance Section 3.2.
- Inline actions within the jobs list should use icon-only buttons (tertiary/quiet), not text-label buttons, per data-dense guidance Section 4.4.

### 2. Simplify Capture and Early Evaluation

Observed issues:
- The capture flow is functional but visually bare.
- Fallback and progress states are useful, but they can feel mechanical rather than reassuring.

Refactor direction:
- Improve the capture interaction using upstream form patterns:
  - Labels above controls (`--typography-size-sm`, `--typography-weight-medium`) with helper text below (`--typography-size-xs`, `--color-text-tertiary`) per forms guidance Section 3.
  - Focus states with `--color-border-focus` ring per forms guidance Section 1.3.
  - Validation messages replace helper text on error per forms guidance Section 3.3.
  - The primary submit action uses the `primary` button variant (`--color-accent-solid`). Cancel/secondary actions use `secondary` or `tertiary` variants.
- Improve loading feedback during capture: use a spinner in the primary button (text replaced by animated dots, button non-interactive, width unchanged) per forms guidance Section 2.1.
- Make error and fallback states feel intentional and recoverable using the upstream structured message anatomy: title + description + recovery guidance + action — per overlays guidance Section 4.
- Use toast notifications for successful capture confirmations ("Role captured") that auto-dismiss after 4–5 seconds — per overlays guidance Section 1.1 (toast pattern).
- Keep the capture path fast for users who just want to add a role and move on.

### 3. Improve List Scannability and Prioritization

Refactor direction:
- Apply the upstream scan hierarchy to the jobs list. Adopt the content priority tiers from data-dense guidance Section 2.1:
  - **Tier 1 — Primary identity**: Role title and company name — `--color-text-primary`, `--typography-weight-medium`.
  - **Tier 2 — State/status**: Status badges using text badge pattern (e.g., "Captured", "Applied", "Interview", "Offer", "Closed") with semantic colors where appropriate (success for active/positive states, warning for needs-attention, error for blocked/rejected, neutral for draft/inactive) — per status signals guidance Section 1.1.
  - **Tier 3 — Key metadata**: Fit score, desirability score, date captured — `--color-text-secondary`, `--typography-weight-regular`, `--typography-size-sm`.
  - **Tier 4 — Action cues**: Quick actions (open detail, edit, archive) as icon-only buttons at `--color-text-secondary`.
  - **Tier 5 — Secondary analytics**: Skills count, materials count — `--color-text-tertiary`, `--typography-size-xs`.
- Choose between table layout and stacked row summaries based on data shape per data-dense guidance Section 1.1. Given PYP's variable metadata per role, a stacked row summary pattern may be more appropriate than a strict table.
- Use desirability/fit information as compact signals: consider dot indicators or subtle text badges rather than full-width analysis displays in the list view — per status signals guidance Section 1.2.
- Use row-level priority markers (`3px`–`4px` left-edge bar using the priority palette: critical=`--color-semantic-error-foreground`, high=`--color-semantic-warning-foreground`, medium=`--color-text-secondary`, low=`--color-text-tertiary`) for desirability-based visual triage — per status signals guidance Section 1.1 (row-level priority marker).
- Implement row hover (`--color-neutral-surface` background shift), selection (accent indicator bar + surface background), and keyboard focus (2px `--color-border-focus` ring) per data-dense guidance Section 4.
- Ensure sorting and filtering support decision-making rather than visual noise. Filter/sort controls go in a compact toolbar (`--spacing-sm` vertical padding, `--spacing-md` horizontal) per forms guidance Section 4.6.

### 4. Reduce Detail-View Overload

Observed issues:
- The detail experience currently aggregates many workflows and can feel dense.

Refactor direction:
- Reorganize the detail experience using grouped metadata blocks from data-dense guidance Section 1.1:
  - Core role information as a key-value metadata block (keys in `--color-text-secondary`, values in `--color-text-primary`, separated by `--spacing-sm`–`--spacing-md`).
  - Use section headers (`--typography-weight-semibold`, `--spacing-xl` above, `--spacing-md` below) to create clear vertical landmarks.
- Distinguish core decision content from optional AI-assisted or advanced support areas:
  - Core: role details, company info, status, fit summary, next action — always visible.
  - Secondary: detailed AI analysis, skills breakdown, traceability — available via progressive disclosure (expand/collapse per data-dense guidance Section 4.6, or behind tabs/section toggles).
  - Tertiary: materials prep, interview stages, outcome tracking — deeper-level sections.
- Action hierarchy within the detail view: the primary action (e.g., "Update Status", "Record Outcome") uses the `primary` button variant in the page header or section header. Supporting actions use `secondary`/`tertiary`. Destructive actions (archive, delete) go in a separate danger zone section or behind overflow — per forms guidance Section 2.3.
- Modal usage: apply the design system's inline-vs-modal decision guidance. Use modals only for irreversible confirmations or context-free input collection. Prefer inline expansion and popovers for routine interactions — per overlays guidance Section 1.5.

### 5. Raise the Quality of Feedback States

Refactor direction:
- Implement the upstream feedback state patterns across the core workflow:
  - **Empty states**: Centered within the surface, factual primary message (`--typography-size-base`, `--typography-weight-medium`), optional supporting message (`--typography-size-sm`, `--color-text-secondary`), optional action button, optional geometric icon (`--color-text-tertiary`). No mascots or playful illustrations — per overlays guidance Section 2.1 and data-dense guidance Section 5.6.
  - **Loading states**: Spinner (`20px`–`24px`, `--color-text-tertiary` track, `--color-text-secondary` arc) centered in the loading surface. For known-layout surfaces like the jobs list, use skeleton loading (pulsing `--color-neutral-surface` rectangles) — per overlays guidance Section 2.2.
  - **Success states**: Inline text or toast, transient (2–3 seconds fade), `--color-semantic-success-foreground`. Factual and brief: "Changes saved", "Role captured". No celebratory language — per overlays guidance Section 2.4 and Section 3.3.
  - **Error states**: Inline field errors (replace helper text, `--color-semantic-error-foreground`), error banners for page-level issues (persistent, `--color-semantic-error-background`), full-surface error for catastrophic failures — per overlays guidance Section 2.6 and forms guidance Section 3.3.
  - **Warning states**: Inline or banner, `--color-semantic-warning-foreground/background`, for non-blocking issues — per overlays guidance Section 2.5.
- Match feedback prominence to severity: inline for routine success, toast for background actions, banner for persistent issues, modal only for blocking errors — per overlays guidance Section 3.1.
- Use consistent matter-of-fact tone across all feedback messages. No exclamation marks for routine feedback, no casual language, no technical jargon in user-facing messages — per overlays guidance Section 4.3.

## Implementation Steps

### 1. Reassess the primary jobs workflow
- [x] Define the smallest coherent "capture → evaluate → act" path the page should optimize for.
- [x] Map controls and views to the upstream action hierarchy tiers (page-level, section-level, background utility).
- [x] Identify controls that should become secondary, contextual, or behind overflow menus.

### 2. Redesign the capture and list experience
- [x] Update the capture form using upstream form patterns: labeled inputs, focus states, validation, button loading states.
- [x] Implement toast notifications for capture success.
- [x] Apply the data-dense scan hierarchy to the jobs list (primary identity, state badges, key metadata, action cues, secondary analytics).
- [x] Implement row interaction states (hover, selection, keyboard focus) per data-dense guidance.
- [x] Add compact status signals to the list using text badges and/or row-level priority markers per status signals guidance.

### 3. Rework the role-detail experience
- [x] Reorganize the detail view using grouped metadata blocks and section headers.
- [x] Separate core decision content from advanced analysis via progressive disclosure.
- [x] Apply the inline-vs-modal decision framework: reduce unnecessary modals in favor of inline and popover patterns.
- [x] Implement action hierarchy in the detail view (primary, secondary, destructive placement).

### 4. Normalize product feedback states
- [x] Implement empty state patterns for jobs list, skills page, and detail sections.
- [x] Implement loading states (spinner and skeleton) across the workflow.
- [x] Implement success, error, and warning treatments per the upstream guidance.
- [x] Align user-facing copy with the product's calm, matter-of-fact analytical tone.

### 5. Verify usability and regression coverage
- [x] Update component and page-level tests for revised workflows.
- [x] Confirm the redesigned flow still preserves the existing product capabilities.

## Affected Areas

- `src/components/CaptureJobForm.tsx`
- `src/components/JobsPageClient.tsx`
- `src/components/jobs/`
- supporting frontend utilities under `src/lib/`
- frontend tests under `tests/`

## Success Criteria

- [x] A new user can understand the primary jobs workflow quickly.
- [x] Capture, evaluation, and next-action flows feel more guided and less cluttered.
- [x] The jobs list uses the upstream scan hierarchy with proper content priority tiers.
- [x] Status, fit, and desirability signals use the design system's compact signal patterns.
- [x] List and detail views communicate priority more clearly through row markers and badges.
- [x] Advanced capabilities remain available via progressive disclosure but no longer dominate the default experience.
- [x] Feedback states (empty, loading, success, error, warning) follow the upstream patterns with appropriate prominence.
- [x] Feedback copy is calm, matter-of-fact, and consistent across the workflow.
