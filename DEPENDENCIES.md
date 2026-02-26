# Dependency management and version bumps

Guidelines for adding, updating, and upgrading dependencies so the repo stays stable and scalable. Aligned with [OpenShift Console dependency practices](https://github.com/openshift/console#dependency-management).

## Current stack (React 19 & Node 20+)

- **React 19:** This repo targets React 19 and uses the modern APIs (`createRoot`, hooks, functional components, `react-error-boundary`). No deprecated APIs (e.g. `ReactDOM.render`, string refs, PropTypes).
- **Node 20+:** Required for [Supabase](https://supabase.com) (CLI and recent `@supabase/supabase-js`; older Node versions can hit realtime issues). Node 18 is end-of-life (April 2025). Use `.nvmrc` and `engines.node` (e.g. `>=20.x`) for consistency.

## Principles

- **Reproducible installs:** Prefer exact versions (no `^` or `~`) for core tooling and critical libraries so `npm ci` and future installs are deterministic.
- **Critical deps first:** React, Vite, TypeScript, Tailwind, Radix/shadcn, Supabase, and test stack are essential; version bumps for these need a checklist and smoke tests.
- **One major at a time:** When upgrading, do one major (or high-impact) dependency per PR so regressions are easy to trace.

## Package manager and lockfile

- **Manager:** npm (this repo uses `package-lock.json`). Use the same manager everywhere; do not mix yarn/pnpm in this repo without updating docs and CI.
- **Lockfile:** Commit `package-lock.json`. CI and local installs should use `npm ci` for reproducible builds.
- **Node:** `engines.node` is `>=20.x`. Use Node 20+ for Supabase CLI and `@supabase/supabase-js` compatibility; Node 18 is EOL. A `.nvmrc` file pins the recommended version (e.g. `20`); run `nvm use` in the project root. Keep CI and local dev on the same range.

## Version policy

### Prefer exact versions for core tooling

For **critical path** dependencies, pin exact versions to avoid surprise breakages on `npm install`:

- **Build and runtime:** `vite`, `react`, `react-dom`, `typescript`
- **Styling:** `tailwindcss`, `postcss`, `autoprefixer`
- **Lint/format:** `eslint`, `prettier`, `typescript-eslint`
- **Testing:** `vitest`, `cypress`, `@testing-library/react`, `@testing-library/jest-dom`

In `package.json` use exact versions (e.g. `"vite": "5.2.9"`) or restrict ranges (e.g. `~5.2.0` for patch-only) where the maintainer documents that policy. Avoid `^` for these unless you explicitly accept minor bumps.

### Ranges for app dependencies

- **UI and data:** Radix, TanStack Query, Supabase, etc. can use `^` with a known-good minimum (e.g. `^19.0.0` for React) if the team is comfortable doing minor upgrades regularly.
- **Design-system-like stacks** (e.g. Radix): If they don’t follow strict semver, consider `~` to limit to patch updates, and run full test + manual smoke after any change.

## Adding a new dependency

1. **Version:** Prefer an exact or tight range: `npm install <pkg>@<version>` (e.g. `npm install date-fns@3.6.0`).
2. **Placement:** `dependencies` for runtime; `devDependencies` for build, lint, test, types.
3. **Types:** Add `@types/<pkg>` only if the package has no built-in types and the types are maintained.
4. **Document:** If the dependency is part of the “critical path” (build, render, auth, API client), add it to the list in this file and in the upgrade checklist below.

## Updating an existing dependency

1. **Check changelog:** Prefer reading the project’s CHANGELOG or GitHub releases for breaking changes.
2. **Update one at a time:** Prefer one dependency (or one logical group, e.g. all Radix) per PR.
3. **Run full checks:**
   - `npm run typecheck`
   - `npm run lint`
   - `npm run test:run`
   - `npm run test:e2e` (if applicable)
   - `npm run build`
4. **Smoke test:** Manually run the app and exercise the areas that use the updated library.

## Upgrade checklist for critical dependencies

Use this when bumping versions of essential packages (e.g. React 18 → 19, Vite 5 → 6, TypeScript 5.x, Tailwind 3 → 4).

- [ ] Read official migration/upgrade guide and changelog.
- [ ] Update version in `package.json` (and lockfile via `npm install`).
- [ ] Resolve type errors: `npm run typecheck`.
- [ ] Resolve lint: `npm run lint` (and `lint:fix` if safe).
- [ ] Fix or accept test changes: `npm run test:run`, `npm run test:e2e`.
- [ ] Production build: `npm run build`.
- [ ] Manual smoke: auth, dashboard, slideshow, export, settings.
- [ ] Update this doc and [STYLEGUIDE.md](STYLEGUIDE.md) if the upgrade changes conventions (e.g. new React compiler, new Vite plugin API).

## Critical dependencies (reference)

| Category   | Packages (examples) | Notes |
|-----------|----------------------|--------|
| Runtime   | react, react-dom     | React 19; keep in sync. Use `createRoot` (no `ReactDOM.render`). |
| Build     | vite, @vitejs/plugin-react-swc | Vite major bumps can change config and plugin APIs. |
| Language  | typescript           | TS major/minor can tighten types and break builds. |
| Styling   | tailwindcss, tailwind-merge, tailwindcss-animate | Tailwind 4 will have config and syntax changes. |
| UI        | @radix-ui/*, class-variance-authority, clsx | Many Radix packages; upgrade together and run UI tests. |
| Data/Auth | @supabase/supabase-js, @tanstack/react-query | Supabase and RQ have their own upgrade guides. |

## React 19–related bumps (done)

- **next-themes**: `^0.3.0` → `^0.4.6` (peer React 19; fixes `npm install` ERESOLVE).
- **vaul**: `^0.9.9` → `^1.1.2` (React 19 in peer deps; drawer API unchanged).
- **react-day-picker**: `^8.10.1` → `^9.4.4` (React 19; v9 breaking changes applied in `src/common/components/ui/calendar.tsx`: new `classNames` keys, `Chevron` component instead of `IconLeft`/`IconRight`).
| Testing   | vitest, cypress, @testing-library/* | Vitest and Cypress majors can change APIs. |

## Deduplication and overrides

- **Duplicate packages:** If `npm ls` shows multiple versions of the same dependency and it causes issues, try `npm dedupe` or add an `overrides` entry in `package.json` (npm) to force a single version. Document the override and why it’s needed.
- **Overrides in this repo:** `package.json` already uses `overrides` for specific packages (e.g. `@eslint/config-array`). Add new overrides only when necessary and note them here or in CONVENTIONS.

## Backend (external repository)

The backend is **not in this repository**. It is maintained separately at **[github.com/krishagarwal278/supabase](https://github.com/krishagarwal278/supabase)**. This repo is frontend-only; dependency management and version bumps in this doc apply only to the frontend. Backend dependency and version policy is owned by the supabase repo.
