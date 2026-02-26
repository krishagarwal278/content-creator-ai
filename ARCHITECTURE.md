# Architecture and scalability

High-level structure of the Videaa app and how to keep it ready for growth and dependency upgrades. Aligned with [OpenShift Console](https://github.com/openshift/console) practices on barrel exports and clear boundaries.

## Layers

```
┌─────────────────────────────────────────────────────────────┐
│  App entry (App.tsx) – routers, providers, no business logic │
├─────────────────────────────────────────────────────────────┤
│  Features (src/features/*) – pages and feature-specific UI   │
├─────────────────────────────────────────────────────────────┤
│  Common (src/common/) – shared UI, hooks, contexts, utils   │
├─────────────────────────────────────────────────────────────┤
│  API (src/api/) – backend client, Supabase, service modules  │
├─────────────────────────────────────────────────────────────┤
│  Config / styles (src/config, src/styles)                     │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
  Vite (build)  │  Backend: external repo (not in this codebase)
  Supabase      │  https://github.com/krishagarwal278/supabase
```

- **Features** do not import from other features. Shared code lives in `common/` or `api/`.
- **API layer** is the only place that knows about `VITE_BACKEND_URL`, Supabase client, and request shapes. Features call API **modules directly** (e.g. `@/api/video-generation-service`), not the barrel.
- **Backend:** The backend (Express, video/voice/slideshow APIs, Supabase server-side) lives in a **separate repository**: [github.com/krishagarwal278/supabase](https://github.com/krishagarwal278/supabase). This repo is **frontend-only**; `VITE_BACKEND_URL` points at the deployed or local backend from that repo.
- **Config** holds env-driven config and theme; no business logic.

## Barrel exports and direct imports (scalability)

We **move away from barrel exports** for the same reasons as [OpenShift Console](https://github.com/openshift/console/blob/main/STYLEGUIDE.md#importing-from-barrel-files-and-circular-dependencies): they can create circular dependencies, slow builds, and unclear boundaries. New code should prefer **direct imports** from the defining file.

### Policy

1. **Prefer direct imports**
   - Import from the file that defines the symbol: `@/common/components/ui/button`, `@/api/video-generation-service`, `@/common/contexts/AuthContext`.
   - Avoid `@/components/ui` or `@/api` when adding new code or touching a file that only needs one or two symbols; use the specific path instead.

2. **Barrels that remain (for now)**
   - **`src/api/index.ts`** – Re-exports services and client. Allowed for backward compatibility. New code can still prefer direct imports (e.g. `from "@/api/video-generation-service"`) to keep dependency graphs small.
   - **`src/common/components/ui/index.ts`** – Large UI barrel. **Do not add new re-exports** for new components; new consumers should import from `@/common/components/ui/<component-name>` (or `@/components/ui/<component-name>` via alias). Existing imports from `@/components/ui` are grandfathered until gradually migrated.
   - **`src/common/contexts/index.ts`** – Small (Auth, Project, Theme). Low risk; can stay. Prefer direct import if a file only needs one context (e.g. `from "@/common/contexts/AuthContext"`).

3. **Feature modules**
   - **No feature-level barrels.** Do not add `features/dashboard/index.ts` that re-exports pages or components. Entry points (e.g. App.tsx) import from full paths: `from "@/features/dashboard/DashboardPage"`. This avoids circular deps and keeps the dependency graph clear for future version bumps and code-splitting.

4. **App entry**
   - `App.tsx` already uses full paths for feature routes and avoids barrel re-exports where noted. Keep that pattern; add new routes with direct feature imports.

### Migration

- **New code:** Use direct imports (see [STYLEGUIDE.md](STYLEGUIDE.md#imports)).
- **Existing code:** When touching a file that imports from `@/components/ui` or `@/api`, consider switching to the direct path for the symbols you use. Migrate incrementally; no single “big bang” refactor required.

## Tech stack boundaries

- **Vite:** Owns build, dev server, env (e.g. `VITE_*`), and path aliases (`@/`). All frontend code is built by Vite; no duplicate bundler.
- **React / TypeScript:** Single version across the app; no mixed React versions or TS “skipLibCheck” as a permanent fix for upstream types.
- **Tailwind + shadcn:** Styling lives in utility classes and `src/common/components/ui`. Third-party UI that isn’t shadcn should be wrapped or isolated so design-system upgrades (e.g. Tailwind 4) stay manageable.
- **Supabase:** Used only via `src/api/client` and services in `src/api`. No direct Supabase imports in features or common UI.
- **Backend (external):** The backend is **not in this repo**. It is maintained in [github.com/krishagarwal278/supabase](https://github.com/krishagarwal278/supabase). That repo owns Express (or other) server, video/voice/slideshow APIs, and server-side Supabase usage. This frontend calls it via `VITE_BACKEND_URL`. Do not add a `backend/` directory here; keep frontend and backend versioning and dependency lifecycles separate.

## Scalability and version bumps

- **Feature-based structure:** Features are isolated; adding a new feature (e.g. “billing”) means new routes and a new subtree under `features/` without touching others. No cross-feature imports.
- **API surface:** Services in `src/api` are the only place that define request/response shapes and backend URLs. When the backend or a third-party API changes, only the corresponding service and types need updates.
- **Dependency upgrades:** Critical deps (React, Vite, TypeScript, Tailwind, Radix, Supabase) are listed and upgraded with the checklist in [DEPENDENCIES.md](DEPENDENCIES.md). Direct imports and small, explicit dependency graphs make it easier to track breakages during upgrades.
- **Testing:** Unit tests sit next to code or in `__tests__/`; E2E in `cypress/e2e/`. No tests in a separate “test package” that re-exports app code via barrels.

## Performance: code splitting and caching

- **Route-based code splitting:** Page components (Landing, Auth, Legal, Dashboard, Projects, History, Settings, NotFound) are loaded with `React.lazy()` and wrapped in `<Suspense>`. The initial bundle stays small; each route’s JS is fetched when the user navigates there. Fallback: `RouteFallback` in `src/common/components/RouteFallback.tsx`.
- **Vendor chunks:** Vite `manualChunks` split React, MUI/Emotion, Radix UI, forms, data (React Query + Supabase), and recharts into separate cacheable chunks. When only app code changes, vendor chunks keep the same hash and stay cached.
- **Caching:** Build output uses content hashes in filenames (`[name]-[hash].js`), so long-term caching is safe. First visit downloads the shell + the route chunk; repeat visits and other routes benefit from cached vendor and route chunks.

## Summary

- **Barrels:** Prefer direct imports; avoid new barrel re-exports; migrate away from the UI barrel over time.
- **Features:** No feature barrels; App and routers use full paths.
- **API:** Single place for backend and Supabase client usage; services are the contract.
- **Backend:** External repo ([supabase](https://github.com/krishagarwal278/supabase)); no backend code in this repo.
- **Upgrades:** One critical dep at a time; use DEPENDENCIES.md checklist and keep STYLEGUIDE and this doc updated.
