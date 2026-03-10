# Plot Your Path — Development Workflows

## Run the web app locally

These steps are optimized for running the app from **WSL** while viewing it in your browser.

### 1. Install dependencies

```bash
# Python/backend deps
uv sync

# Node/frontend deps
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Defaults already work for local development:

- Backend API: `http://localhost:8000`
- Frontend app: `http://localhost:3000`

### 3. Start backend (terminal 1)

```bash
uv run uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Start frontend (terminal 2)

```bash
pnpm dev src/frontend --hostname 0.0.0.0 --port 3000
```

Why this command: the Next.js app lives in `src/frontend`, so it must be passed
as the Next.js app directory when running from the repository root.

### 5. Open the app

From Windows or WSL browser, open:

- `http://localhost:3000`

If localhost forwarding is unavailable in your setup, use your WSL IP instead:

```bash
hostname -I
```

Then open `http://<wsl-ip>:3000`.

## Running tests

This project has both backend (Python) and frontend (TypeScript) tests.

### Backend tests (pytest)

Make sure dev dependencies are installed:

```bash
uv sync --extra dev
```

Run all backend tests:

```bash
uv run pytest tests/backend
```

Run backend tests with coverage output (terminal + htmlcov/):

```bash
uv run pytest --cov=src/backend --cov-report=term-missing --cov-report=html tests/backend
```

### Frontend tests (vitest)

Run all frontend tests:

```bash
pnpm test
```

Run frontend tests with coverage:

```bash
pnpm test:coverage
```

Run a single frontend test file (example):

```bash
pnpm vitest run tests/frontend/app/jobs.page.test.tsx
```
