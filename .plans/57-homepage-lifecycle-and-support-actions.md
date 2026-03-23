# Plan: Homepage Lifecycle and Support Actions

## Overview

Add lightweight lifecycle controls and support actions to the homepage so first-time visitors can benefit from the intro experience while returning users can get into the app faster. This phase should also provide clear paths for help, issue reporting, feature requests, and community support without turning the homepage into a promotional surface.

## Prerequisites

- `.plans/56-homepage-intro-refresh.md`

## Goals

1. Let returning users dismiss or skip the overview and go straight into the working app.
2. Provide a clear help path for support, feature requests, and issue reports.
3. Keep these controls useful and unobtrusive within the homepage experience.

## Technical Design

### 1. Add dismissible homepage behavior

Refactor direction:
- Introduce a browser-local preference so users can hide the overview after they no longer need it.
- Keep the default experience oriented toward first-time visitors.
- Preserve a way to revisit the overview later rather than making dismissal permanent or opaque.

### 2. Add utility support actions

Refactor direction:
- Add a help action that opens `mailto:support@EverGrayTech.com`.
- Make the help language clearly useful for issue reporting and feature requests.

### 3. Keep lifecycle actions secondary to the main app path

Refactor direction:
- Place skip/help actions where they remain visible but visually subordinate to the primary CTA.
- Avoid adding marketing-style visual weight.
- Keep the actions compatible with the app shell and homepage layout established in the intro refresh.

## Implementation Steps

### 1. Add lifecycle controls
- [x] Add a dismiss or skip action for the homepage overview.
- [x] Store the returning-user preference locally in the browser.
- [x] Provide a way to view the overview again after dismissal.

### 2. Add support utilities
- [x] Add a help action using `mailto:support@EverGrayTech.com`.
- [x] Keep the labels clear and product-appropriate.

### 3. Validate behavior
- [x] Add or update tests covering dismiss and utility action visibility.
- [x] Run repository formatting.
- [x] Run the full frontend test suite.

## Affected Areas

- `.plans/57-homepage-lifecycle-and-support-actions.md`
- `src/app/page.tsx`
- supporting homepage component(s) if introduced
- `src/app/globals.css`
- homepage-related tests

## Success Criteria

- [x] Returning users can skip the homepage overview.
- [x] The overview can still be revisited after dismissal.
- [x] Help actions are available and point to the correct destination.
- [x] The actions remain visually secondary to the main in-app CTA.
- [x] Tests, formatting, and the full frontend test suite pass.
