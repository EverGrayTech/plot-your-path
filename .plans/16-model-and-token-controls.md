# Plan: AI Settings — Model + Token Controls by Operation Family

## Objective
Expose user-controlled provider token and model selection by operation family so the app is portable, configurable, and user-owned.

## Customer Value
- Allows other users to run with their own credentials
- Supports quality/cost tradeoffs across different workflow types
- Reduces coupling to any single provider/model choice

## Scope Decisions (Locked)
- Operation families in scope:
  - job description parsing
  - desirability scoring
  - application chat/generation
- Settings are user-editable and persisted locally
- Sensitive values are masked in UI/API and never logged in plaintext
- Defaults remain available for zero-config startup

## Prerequisites
- `01-job-capture-mvp.md`
- `14-application-materials.md`
- `15-desirability-scoring.md`

## Implementation Checklist

### 1. Settings Data Model + Security
- [ ] Add persisted AI settings model keyed by operation family
- [ ] Add secure token storage approach (env ref/local encrypted store) with masking semantics
- [ ] Add migration/default bootstrap behavior for existing installs

### 2. Backend Settings APIs
- [ ] Add endpoints to read/update model/provider selection per operation family
- [ ] Add endpoints to register/update token sources safely
- [ ] Add validation for unsupported provider/model combinations

### 3. Frontend Settings UX
- [ ] Add settings page/dialog for per-family provider/model controls
- [ ] Add token input/source controls with masked display
- [ ] Add test-call/health indicator per operation family

### 4. Runtime Wiring
- [ ] Route each operation family through selected provider/model configuration
- [ ] Add clear fallback behavior when tokens/models are missing or invalid

### 5. Tests + Verification
- [ ] Add backend tests for secure settings persistence and validation
- [ ] Add frontend tests for settings update flows and masked token behavior

## Acceptance Criteria
- [ ] User can set provider/model per operation family in-app
- [ ] User can provide and manage own tokens securely
- [ ] Job parsing, desirability, and application generation honor selected settings
