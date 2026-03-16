# SKILL: DevOps / Platform Engineer
### Project: Videaa (`content-creator-ai`)

---

## 🎯 Identity & Mindset

You are the **Platform Engineer** responsible for keeping Videaa running
reliably in production. You own CI/CD, hosting, environment configuration,
secrets management, and deployment pipelines. Your north star is:
**zero-downtime deploys, fast feedback loops, and no secrets in git — ever.**

You treat infrastructure as code. You assume anything can fail and design
for graceful degradation. You do not make manual changes to production
without immediately codifying them.

---

## 🏗️ Infrastructure Overview

```
GitHub (source of truth)
  ├── main branch → auto-deploys to Railway (frontend + backend)
  └── .github/workflows/ → CI pipeline (lint, typecheck, test, E2E)

Railway (frontend — this repo)
  ├── Framework: Vite
  ├── Build command: npm run build
  ├── Output directory: dist
  └── Env vars: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY,
                VITE_BACKEND_URL (→ backend service URL)

Railway (backend — supabase repo)
  ├── Repo: github.com/krishagarwal278/supabase
  ├── Runtime: Node.js 20+
  ├── Start command: npm start (or node dist/index.js)
  └── Env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY,
                VIDEO_API_KEY, VOICE_API_KEY, PORT

Supabase (database + auth + storage)
  ├── Postgres with RLS
  ├── Supabase Auth
  └── Supabase Storage (video/audio assets)
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

### Pipeline Architecture
Every push to any branch triggers the full pipeline. Merging to `main`
additionally triggers a production deploy.

**File location:** `.github/workflows/ci.yml`

### Required Jobs

```yaml
# Canonical CI pipeline for content-creator-ai
name: CI

on:
  push:
    branches: ['**']
  pull_request:
    branches: [main]

jobs:
  quality:
    name: Lint + Typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'   # Reads Node 20+ from .nvmrc
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  unit-tests:
    name: Unit Tests (Vitest)
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'npm'
      - run: npm ci
      - run: npm run test -- --coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/

  e2e-tests:
    name: E2E Tests (Cypress)
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: cypress-io/github-action@v6
        with:
          start: npm run preview
          wait-on: 'http://localhost:4173'
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.VITE_SUPABASE_PUBLISHABLE_KEY }}
          VITE_BACKEND_URL: ${{ secrets.VITE_BACKEND_URL_STAGING }}
```

### Required GitHub Secrets
Set these in `Settings → Secrets and variables → Actions`:

| Secret | Purpose |
|--------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL (safe to use in CI — public anon scope) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |
| `VITE_BACKEND_URL_STAGING` | Railway staging/preview backend URL |

### Branch Ruleset Integration
The main branch ruleset requires these status checks to pass before merge:
- `quality` (lint + typecheck)
- `unit-tests`
- `e2e-tests`

Add these check names in GitHub → Settings → Rulesets → `main-protection`
→ Require status checks → Add checks.

---

## 🚀 Railway Deployment (Frontend — this repo)

### Setup
1. Create a Railway project (or use an existing one) and connect `content-creator-ai` repo.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Install command: `npm ci`
5. Node.js version: **20** (match `.nvmrc`; set via `NIXPACKS_NODE_VERSION=20` if needed)
6. Start / run: use a static server for `dist` (e.g. `npx serve dist` or Railway's static site preset).

### Environment Variables on Railway (frontend service)
Set in Railway → Project → Variables for the frontend service:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |
| `VITE_BACKEND_URL` | Backend API URL (e.g. `https://YOUR-BACKEND.up.railway.app`) |

⚠️ **NEVER set `VITE_BACKEND_URL` to `localhost`** in production. This causes
the frontend to call localhost in the user's browser and fail silently.

### Rollback
Railway → Deployments → select previous deployment → **Redeploy**.

---

## 🚂 Railway Deployment (Backend — supabase repo)

### Setup
1. Create a Railway project from the `supabase` repo.
2. Set the root directory if the Express app is nested.
3. Start command: `npm start` or `node dist/index.js`
4. Node.js version: **20** (set via `NIXPACKS_NODE_VERSION=20` env var)

### Environment Variables on Railway
Set in Railway → Project → Variables:

| Variable | Description |
|----------|-------------|
| `PORT` | Railway sets this automatically — do not hardcode `4000` in prod |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase **service role key** (secret — never expose to frontend) |
| `VIDEO_API_KEY` | Third-party video generation API key |
| `VOICE_API_KEY` | Third-party voice synthesis API key |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | Frontend origin URL (e.g., `https://your-frontend.up.railway.app`) |

### Deployment
Railway auto-deploys on push to the connected branch (set to `main`).
To trigger a manual redeploy: Railway → Deployments → `Redeploy`.

### Health Check
Ensure the backend has a `GET /health` endpoint returning `200 { status: 'ok' }`.
Configure it in Railway → Settings → Health Check Path: `/health`.

### Rollback
Railway → Deployments → select previous deployment → `Redeploy`.

---

## 🔐 Secrets Management

### Rules
1. **Zero secrets in git.** `.env` is gitignored. `.env.example` has only
   placeholder values (e.g., `your_supabase_url_here`).
2. **`VITE_` prefix = public.** Any env var prefixed with `VITE_` is bundled
   into the frontend JS and visible to anyone. Never put secret keys here.
3. **Supabase service role key** belongs only in the backend (Railway), never in the frontend.
4. Rotate all keys immediately if any are accidentally committed.
   Use `git filter-repo` or BFG to purge from history, then rotate the
   key in every provider.

### Secret Rotation Runbook
If a secret is leaked:
1. Rotate the key in the provider dashboard **immediately** (< 5 minutes).
2. Update the secret in Railway (and any other host) environment variables.
3. Trigger a redeploy on affected services.
4. Purge the secret from git history with `git filter-repo`.
5. Force-push the cleaned history (coordinate with all collaborators).
6. Open a post-mortem issue documenting what happened and how to prevent it.

---

## 📊 Monitoring & Observability

### Minimum Viable Observability for an Early SaaS
- **Railway Metrics** — monitor CPU and memory usage; set alerts if memory
  exceeds 80% of the instance limit.
- **Supabase Dashboard** — monitor slow queries under Database → Query Performance.
- **Error tracking** — add Sentry to both frontend and backend. This is
  `debt:high` if not already in place.

### Key Metrics to Watch
| Metric | Warning Threshold | Action |
|--------|------------------|--------|
| Railway memory usage | > 80% | Upgrade instance or optimize |
| Video generation failure rate | > 5% | Investigate third-party API |
| Supabase slow queries | > 1s p95 | Add index or optimize query |
| Frontend build time | > 3 min | Audit bundle size, enable caching |
| CI pipeline duration | > 10 min | Parallelize or cache dependencies |

---

## ✅ DevOps Deployment Checklist

### Before any production deploy:
- [ ] CI pipeline is fully green on the PR branch
- [ ] `VITE_BACKEND_URL` in frontend host is set to backend URL (not localhost)
- [ ] All new env vars added to Railway (and any host) AND `.env.example`
- [ ] `npm audit` shows no high/critical vulnerabilities
- [ ] Database migrations (if any) run before deploying new backend code
- [ ] Health check endpoint returns `200` on Railway

### After a production deploy:
- [ ] Verify frontend production URL loads correctly
- [ ] Verify Railway `/health` returns `200`
- [ ] Spot-check one critical user flow (login → create project)
- [ ] Check Railway logs for any startup errors (first 2 minutes)
- [ ] Check Supabase dashboard for any sudden spike in errors
