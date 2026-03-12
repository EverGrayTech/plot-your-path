# Plan: MVP Web Frontend for Job Capture (URL-first with Text Fallback)

## Overview

Build a **single-page MVP capture UI** that prioritizes URL submission, then gracefully falls back to pasted job text when scraping/parsing fails.

This plan follows the streamlined UX you requested:
- User enters URL first (default path)
- Backend returns a **structured fallback error code** when URL parsing cannot proceed
- UI reveals/enables a text area and resubmits with pasted job description text
- User sees minimal, staged progress feedback and a clear success confirmation

## Product/UX Decisions (Confirmed)

1. **Page scope**: Single focused capture page only (fastest)
2. **Primary input path**: URL-first
3. **Fallback path**: Triggered by backend structured error code (`FALLBACK_TEXT_REQUIRED`)
4. **Progress UX**: Simple staged frontend loading states now; design to evolve to server-reported progress later

## Technical Design

## 1. Frontend Page (Next.js, single route)

Create one capture page as the MVP entry point:
- URL input (required)
- Submit button
- Conditionally shown/enabled fallback textarea (hidden until fallback is requested)
- Inline status/progress area
- Success banner/message with key result details (company/title/role id)

State model (client component):
- `url`
- `jobText` (fallback text)
- `needsFallbackText` (boolean)
- `phase` (`idle | submitting | success | error`)
- `progressStep` (e.g., `validating | scraping | parsing | saving`)
- `errorMessage`
- `result`

## 2. API Contract Enhancement (backend support for fallback)

Extend capture flow so one API contract can support both attempts:

- `POST /api/jobs/scrape`
  - Request:
    - `url` (required)
    - `fallback_text` (optional; only sent after fallback requested)
  - Behavior:
    - If `fallback_text` absent: attempt scrape-from-URL
    - If URL cannot be parsed/scraped in recoverable way, return structured error:
      - HTTP 422
      - `detail.code = "FALLBACK_TEXT_REQUIRED"`
      - human-readable message in `detail.message`
    - If `fallback_text` present: run clipboard/text capture pipeline using existing service path (`capture_from_clipboard_text`)

This keeps frontend logic simple and avoids introducing a second endpoint for MVP.

## 3. Frontend Progress Feedback (MVP-simple)

During request lifecycle, show staged progress text while awaiting backend:
- `Validating URL...`
- `Scraping job posting...`
- `Parsing job details...`
- `Saving role and skills...`

Implementation note:
- Use a timer-based phase rotation while request is pending.
- Stop timer on success/error.
- Keep copy honest ("working..."), but lightweight and reassuring.

## 4. Error Handling UX

Error handling branches:

1. **Fallback-required error** (`FALLBACK_TEXT_REQUIRED`):
   - Show explanatory message
   - Reveal textarea and keep URL populated
   - Change CTA label to e.g. "Submit with pasted text"

2. **Validation/network/generic failures**:
   - Show inline error alert
   - Keep current form values for retry

3. **Success**:
   - Show success message with returned metadata
   - Offer “Capture another job” reset action

## Implementation Steps

### 1. Scaffold minimal frontend app shell**
  - [x] Add Next.js app route files/layout for single capture page.
  - [x] Create minimal styling structure for readable form/status states.

### 2. Build capture form UI and client state flow**
  - [x] Implement URL input + submit.
  - [x] Add conditional fallback textarea UX.
  - [x] Add success and error message regions.

### 3. Add frontend API client integration**
  - [x] Implement typed request/response helpers in `src/frontend/lib/`.
  - [x] Parse structured backend errors, specifically `FALLBACK_TEXT_REQUIRED`.

### 4. Add MVP progress feedback behavior**
  - [x] Add staged progress text while request is in-flight.
  - [x] Ensure clean cancellation/cleanup of timers.

### 5. Update backend scrape contract for fallback flow**
  - [x] Extend request schema with optional `fallback_text`.
  - [x] Route to `capture_from_clipboard_text` when fallback text is present.
  - [x] Return structured `FALLBACK_TEXT_REQUIRED` error for recoverable scrape failures.

### 6. Add/adjust tests**
  - [x] Frontend tests for initial URL submit, fallback reveal, success rendering, and generic error state.
  - [x] Backend API tests for structured fallback error and fallback-text resubmission path.

### 7. Quality checks**
  - [x] Run Biome lint/format and frontend tests.
  - [x] Run backend tests impacted by API contract update.

## Affected Files (Planned)

- Frontend
  - `src/frontend/app/*` (new app route/layout/page)
  - `src/frontend/components/*` (capture form/status UI)
  - `src/frontend/lib/*` (API client + error typing)
  - `tests/frontend/app/*`
  - `tests/frontend/components/*`
  - `tests/frontend/lib/*`

- Backend
  - `src/backend/schemas/job.py` (optional fallback text field)
  - `src/backend/routers/jobs.py` (structured fallback error + alternate capture path)
  - `tests/backend/test_jobs_api.py` (new fallback contract assertions)

## Success Criteria

- User can submit URL from a single page.
- When URL scraping/parsing cannot proceed, UI receives structured fallback signal and prompts for pasted text.
- Resubmission with pasted text completes successfully through backend pipeline.
- User sees lightweight progress messaging during processing.
- User sees explicit success confirmation when complete.

## Future Evolution (post-MVP)

- Replace timer-based staged feedback with true backend progress reporting:
  - async job ID
  - status endpoint or SSE/websocket updates
  - real phase telemetry from scrape/LLM/persistence pipeline
