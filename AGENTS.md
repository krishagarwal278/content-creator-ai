# Instructions for AI coding agents (Videaa)

This is the entry point for AI-assisted development. Read this first and follow links for details.

Inspired by [OpenShift Console](https://github.com/openshift/console) agent and style conventions.

## Project overview

- **Product:** Videaa — AI-powered course video generator (documents/slides → instructional videos, voiceover, slideshow, SCORM).
- **Stack:** React 18 + TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix), Supabase (auth + DB). Backend is **external** at [github.com/krishagarwal278/supabase](https://github.com/krishagarwal278/supabase); frontend calls it via `VITE_BACKEND_URL`.
- **Structure:**
  - `src/api/` — API services and Supabase client (video generation, slideshow, voice, storage, etc.)
  - `src/common/` — Shared components (`ui/`), hooks, contexts, utils
  - `src/features/` — Feature modules (auth, dashboard, landing, projects, settings)
  - `src/config/`, `src/styles/` — Config and global styles
  - `src/test/` — Test utilities and setup
- **Paths:** Use `@/` aliases (e.g. `@/api`, `@/components`, `@/features`). See [vite.config.ts](vite.config.ts).
- **Imports:** Prefer **direct imports** from the defining file (e.g. `@/api/video-generation-service`, `@/components/ui/button`). We are moving away from barrel exports for scalability and safer version bumps; see [ARCHITECTURE.md](ARCHITECTURE.md#barrel-exports-and-direct-imports-scalability) and [STYLEGUIDE.md](STYLEGUIDE.md#barrel-exports-and-direct-imports).

## Common commands

```bash
npm install              # Install dependencies
npm run dev              # Start dev server (default port 8081)
npm run build            # TypeScript check + production build
npm run preview          # Preview production build (port 8082)

npm run lint             # ESLint (strict, max-warnings 0)
npm run lint:fix         # ESLint with auto-fix
npm run format           # Prettier write
npm run format:check     # Prettier check
npm run typecheck        # tsc --noEmit

npm run test             # Vitest (watch)
npm run test:run         # Vitest single run
npm run test:coverage    # Vitest with coverage
npm run test:e2e         # Cypress headless
npm run test:e2e:open    # Cypress UI
npm run test:all         # Unit + E2E
```

## Global practices

### Commit strategy

- **Logical units:** One commit per logical change (one feature/fix, not mixed).
- **Commit message format:** Subject line = what changed; body (optional) = why. Example:
  ```
  Add Content AI dropdown for slideshow (Kimi / GPT-4o)
  Sends contentAiModel in generate-slideshow and preview request body.
  ```
- **Sensitive data:** Never commit `.env` or API keys; use `.env.example` for variable names only.

### Branch naming

- **Default branch:** `main`
- **Feature:** `feature/short-name` or `feat/voiceover-selector`
- **Fix:** `fix/export-slideshow-download` or `bugfix/cypress-selector`

## Required reference files for AI coding agents

**Before generating or modifying code**, consult the relevant file(s) so changes match architecture and standards.

### General

- **[README.md](README.md)** — Setup, tech stack, project structure, env vars
- **[ARCHITECTURE.md](ARCHITECTURE.md)** — Layers, barrel vs direct imports, scalability, external backend repo
- **[STYLEGUIDE.md](STYLEGUIDE.md)** — TypeScript, React, Vite, Express, Tailwind, file naming, imports, patterns
- **[DEPENDENCIES.md](DEPENDENCIES.md)** — Package management, version policy, upgrade checklist, critical deps
- **[CONVENTIONS.md](CONVENTIONS.md)** — Commits, branches, workflow, dependency checks

### API and backend contract

- **[API_INTEGRATION.md](API_INTEGRATION.md)** — How frontend calls backend (if present)
- **[docs/BACKEND_VOICEOVER_PROMPT.md](docs/BACKEND_VOICEOVER_PROMPT.md)** — Backend voiceover/TTS contract and OpenAI mapping
- **[DATABASE_CONSTRAINTS.md](DATABASE_CONSTRAINTS.md)** — Supabase schema / constraints when touching data

### Testing

- Unit tests live next to code (`*.spec.ts`, `*.spec.tsx`) or in `__tests__/`; E2E in `cypress/e2e/`. Run `npm run test:run` and `npm run test:e2e` before submitting.

## Skills and Cursor

- Project-specific Cursor rules/skills can live in `.cursor/` (e.g. rules, skills). Refer to them when the task matches (e.g. create-rule, create-skill).
- Prefer **direct imports** from the defining file; do not add new barrel re-exports. See [STYLEGUIDE.md](STYLEGUIDE.md#barrel-exports-and-direct-imports) and [ARCHITECTURE.md](ARCHITECTURE.md#barrel-exports-and-direct-imports-scalability).
