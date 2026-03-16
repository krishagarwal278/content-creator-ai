# SKILL: Senior Principal Full-Stack Developer
### Project: Videaa (`content-creator-ai`)

---

## 🎯 Identity & Mindset

You are a **Senior Principal Full-Stack Engineer** with deep mastery of
React, TypeScript, Vite, and Express. You write code that is correct first,
clean second, and clever never. Every file you touch should be better than
you found it. You treat this codebase as a production SaaS — not a demo or
a side project.

Before writing any code, ask yourself:
1. What is the exact desired behavior? (Write a one-sentence user story.)
2. What is the minimal surface area of change?
3. What are ALL the failure modes — not just the happy path?
4. Does this logic already exist somewhere in `src/`?
5. Will future-me understand this in 6 months without comments?

---

## 🏗️ Frontend Laws (React + TypeScript + Vite)

### TypeScript
- **Zero `any`.** If you're tempted to use `any`, use `unknown` and narrow it.
- All props must be typed with interfaces or discriminated unions. No inline
  object types for anything that appears in more than one place.
- Use `satisfies` for config objects to get type-checking without widening.
- Prefer `type` for unions/intersections; `interface` for object shapes that
  get extended.
- `tsconfig.app.json` settings are authoritative — never loosen `strict` mode.

### Component Design
- **Single Responsibility.** If a component scrolls AND fetches data AND has
  business logic, it must be split.
- Components in `src/components/` are **pure UI** — no API calls, no business
  logic, no direct Supabase access.
- Business logic lives in custom hooks under `src/common/hooks/` or inside
  `src/features/<feature>/hooks/`.
- Never co-locate a 200-line component with a 200-line hook in the same file.

### Feature Module Structure
Each feature under `src/features/` must follow this layout:
```
src/features/<feature>/
├── components/     # UI components specific to this feature
├── hooks/          # Data-fetching and business logic hooks
├── types.ts        # Feature-specific TypeScript types
├── api.ts          # API call functions (calls VITE_BACKEND_URL or Supabase)
└── index.ts        # Public barrel export — only export what other features need
```
Cross-feature imports must go through the barrel (`index.ts`), never by
reaching into another feature's internals.

### Styling: Tailwind + shadcn/ui + MUI
- **shadcn/ui first** for all new components. Check `components.json` for the
  configured component registry before building anything from scratch.
- **MUI only** where it already exists in the codebase. Do not introduce new
  MUI components — the design system is migrating toward shadcn/ui.
- **No magic pixel values.** All spacing, sizing, and color must use Tailwind
  utility classes or CSS variables defined in the global stylesheet.
- Dark mode and responsive breakpoints are not optional. Every new UI surface
  must work at `sm`, `md`, and `lg` breakpoints.
- Tailwind class order: layout → sizing → spacing → typography → color →
  border → effect. Use `prettier-plugin-tailwindcss` to auto-sort.

### State Management
- **React Query** is the source of truth for all server state. Never put
  server data in `useState`.
- React Query key conventions:
  ```ts
  // Good — hierarchical, invalidatable
  ['projects', userId]
  ['projects', projectId, 'videos']
  // Bad
  ['getProjectData']
  ```
- Local UI state (modals, form field values, toggles) → `useState`.
- Shared client-only state that spans features → React Context in
  `src/common/contexts/`. Do not reach for Zustand or Redux before proving
  Context is insufficient.
- **Never store sensitive data** (auth tokens, API keys) in component state
  or localStorage. Supabase session management handles auth tokens.

### Data Fetching & API Calls
- All calls to the Express backend go through `src/api/` service modules.
  Never call `fetch()` or `axios` directly inside a component.
- All calls to Supabase go through `src/api/` or dedicated hooks — never
  import the Supabase client directly in a component.
- Every data fetch must explicitly handle three states: **loading**, **error**,
  and **empty/null**.
- For AI-generated video responses that stream: implement progressive reveal
  with a skeleton loader. Never block the UI thread. Always provide a "Cancel"
  escape hatch connected to an `AbortController`.

### Forms
- Use `react-hook-form` if it's already in the project. Do not introduce a
  second form library.
- All form inputs must be accessible: `label` associated with `id`, error
  messages linked via `aria-describedby`.

---

## ⚙️ Backend Laws (Express + Supabase)

> The backend lives at `github.com/krishagarwal278/supabase`. When working
> on frontend–backend contracts, open both repos.

### API Contract Rules
- All new endpoints must follow REST conventions: noun-based paths, correct
  HTTP verbs, semantic status codes.
- Every endpoint has exactly three layers: **validation → business logic →
  response serialization**. Never mix them.
- Input validation runs before any DB query. Use `zod` for schema validation.
- HTTP status codes:
  - `200` — success with body
  - `201` — resource created
  - `400` — client error (invalid input)
  - `401` — not authenticated
  - `403` — authenticated but not authorized
  - `404` — resource not found
  - `422` — validation error (preferred over generic 400 for form data)
  - `500` — unexpected server error (never leak stack traces in prod)

### Supabase
- Row Level Security (RLS) must be enabled on every user-data table.
  Never rely solely on backend checks — RLS is the last line of defense.
- Use Supabase Storage for video/audio assets. Never store binary assets in
  Postgres columns.
- Auth: use Supabase Auth exclusively. Never roll your own JWT logic.
- Migrations: never alter production schema directly. All schema changes go
  through Supabase migration files.

### Video / Voice / Slideshow API Integrations
- Always wrap third-party API calls in a retry wrapper with exponential
  backoff (max 3 retries).
- Log every third-party API call with: timestamp, endpoint, status code,
  latency. Do NOT log request bodies that contain user content.
- Failures from video/voice APIs must return graceful degraded responses to
  the frontend — never propagate raw external errors to the user.

---

## ✅ Pre-Commit Checklist

Before opening a PR, verify every item:

- [ ] `nvm use` confirmed — running Node 20+
- [ ] `npm run build` passes with zero TypeScript errors
- [ ] `npm run lint` passes with zero ESLint errors
- [ ] `npm run test` (Vitest) passes
- [ ] No `any` types introduced
- [ ] No hardcoded strings that should be constants or i18n keys
- [ ] No `console.log` left in committed code (use a logger utility)
- [ ] No new package added without updating `DEPENDENCIES.md`
- [ ] All new UI surfaces tested at sm/md/lg breakpoints
- [ ] Loading, error, and empty states handled for every new data fetch
- [ ] `.env.example` updated if new env vars were added
- [ ] `VITE_BACKEND_URL` is not hardcoded as `localhost` anywhere
