# Videaa (content-creator-ai) — Agent Instructions

## Cursor Cloud specific instructions

### Overview

This is a **frontend-only** React + Vite + TypeScript application (AI-powered video generation platform). The backend API (port 4000) is a separate repository and is **not** included here. Supabase (auth, DB, storage) is cloud-hosted — no local database setup needed.

### Key commands

| Task | Command |
|---|---|
| Dev server | `npm run dev` (port 8081) |
| Lint | `npm run lint:ci` (max 100 warnings) |
| Lint fix | `npm run lint:fix` |
| Typecheck | `npm run typecheck` |
| Unit tests | `npm run test:run` |
| Build | `npm run build` |
| E2E tests | `npm run test:e2e` (requires Cypress + full stack running) |

### Non-obvious caveats

- The `.env` file must exist at the repo root with `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_API_BASE_URL`, and `VITE_BACKEND_URL`. A reference file `.env 2` (note the space) ships in the repo and can be copied: `cp ".env 2" .env`.
- The lint script in `package.json` (`npm run lint`) calls `./scripts/lint.sh` — a thin wrapper that invokes `eslint` via an absolute Node path. For CI-style lint use `npm run lint:ci` instead, which calls `eslint` directly.
- Pre-commit hook (`.husky/pre-commit`) runs `lint-staged`, which auto-fixes lint + format on staged files.
- Unit tests (vitest) use `happy-dom` environment. 3 tests in `content-type-selector.spec.tsx` are pre-existing failures (test expectations don't match current component output).
- The backend API at `http://localhost:4000` is external. AI features, billing, and user preferences won't work without it, but the frontend loads and auth (Supabase) works independently.
