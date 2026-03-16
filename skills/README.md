# 🧠 Agent Skills Directory — `content-creator-ai` (Videaa)

This directory contains role-based skill instruction files for an autonomous agent
sustaining the **Videaa** project at production quality. Each file defines the
mental model, decision frameworks, tooling, and execution patterns the agent must
operate under for a given domain.

---

## 📁 Skill Files

| File | Role | Activate When... |
|------|------|-----------------|
| [`SKILL_fullstack.md`](./SKILL_fullstack.md) | Senior Principal Full-Stack Developer | Building features, writing/reviewing React or Express code |
| [`SKILL_architect.md`](./SKILL_architect.md) | Technical Architect | Making system/design decisions, adding new services or integrations |
| [`SKILL_staff_engineer.md`](./SKILL_staff_engineer.md) | Staff / Principal Engineer | Cross-cutting refactors, code standards, PR reviews, tech debt |
| [`SKILL_devops.md`](./SKILL_devops.md) | DevOps / Platform Engineer | CI/CD, Railway deploys (frontend + backend), env vars, infra changes |
| [`SKILL_debugger.md`](./SKILL_debugger.md) | Debugging & Troubleshooting Specialist | Any broken behaviour, failed CI, runtime errors, prod incidents |

---

## 🔁 How to Use These Skills

1. **Classify your task** before starting work.
2. **Read the matching skill file in full** before writing a single line.
3. **Follow that skill's checklist and decision tree** — do not skip steps.
4. **Combine skills when needed** — a new feature needs FULLSTACK + ARCHITECT;
   a prod incident needs DEBUGGER + DEVOPS; a refactor needs STAFF + FULLSTACK.
5. **Never leave the project in a broken state** — if you can't finish a task
   cleanly, revert and open an issue instead of leaving half-done work.

---

## 🗂️ Project Snapshot

| Dimension | Details |
|-----------|---------|
| **Product** | Videaa — AI-powered short-form video generator from docs/PDFs/slides |
| **Frontend repo** | `github.com/krishagarwal278/content-creator-ai` |
| **Backend repo** | `github.com/krishagarwal278/supabase` (Express + video/voice APIs) |
| **Frontend stack** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, MUI, React Query |
| **Backend stack** | Express.js, Supabase (Postgres + Auth + Storage), video/voice/slideshow APIs |
| **Node requirement** | Node.js 20+ (see `.nvmrc`). Node 18 is EOL and breaks Supabase. |
| **Testing** | Vitest (unit), Cypress (E2E) |
| **Linting/formatting** | ESLint (`eslint.config.js`), Prettier (`.prettierrc`) |
| **Git hooks** | Husky (`.husky/`) — runs lint + typecheck on pre-commit |
| **CI** | GitHub Actions (`.github/workflows/`) |
| **Frontend deploy** | Railway (or host of choice) — set `VITE_BACKEND_URL` to backend URL |
| **Backend deploy** | Railway — `https://YOUR-APP.up.railway.app` |
| **Key env vars** | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_BACKEND_URL` |

---

## ⚠️ Hard Rules (All Roles)

- **Never commit secrets.** All secrets go in `.env` (gitignored). Use `.env.example` for templates.
- **Never commit directly to `main`.** All changes go through a PR.
- **Never skip Husky hooks.** If `--no-verify` is tempting, fix the lint error instead.
- **Never introduce a new package** without reading `DEPENDENCIES.md` first.
- **Never mix barrel imports and direct imports** inconsistently — follow `ARCHITECTURE.md`.
- **`VITE_BACKEND_URL` must never be `localhost` in any production env var.**
- **Always run `nvm use` before any `npm` command** to ensure Node 20+ is active.
