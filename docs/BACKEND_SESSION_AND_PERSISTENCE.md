# Backend: Session and Persistence Requirements

This doc describes what the **backend repo** ([github.com/krishagarwal278/supabase](https://github.com/krishagarwal278/supabase)) must implement so that:

1. Users don't lose their work when navigating (Dashboard ↔ History, etc.).
2. Generated slides/screenplays (including Kimi presentations) are saved and show up in History.
3. Credits are not wasted by duplicate or redundant calls.

The frontend (this repo) has been updated to **persist the last-opened project** and restore it when the user returns to the Dashboard. The following backend behavior is required for a consistent experience.

---

## 1. Auth / sessions (cookies)

- The frontend uses **Supabase Auth** (JWT in cookie or localStorage). The backend should:
  - Accept the same JWT (e.g. in `Authorization: Bearer <token>` or cookie, depending on your setup).
  - Use the JWT to resolve `userId` for all project/screenplay/history APIs so data is scoped per user.
- No custom "session store" is required in the backend if you rely on Supabase JWTs; just validate the token and use the subject as `userId`.

---

## 2. Persist screenplays and slides so they appear in History

### Problem

- When a user generates a **presentation/slideshow** (e.g. with Kimi), that output is not saved in a way the frontend can list.
- The frontend **History → Slides** tab calls `GET /api/v1/video/screenplays?userId=...` (`getAllScreenplays`). If the backend doesn't save slideshows there (or in an equivalent store), "saved slides" will be empty.

### What the backend should do

- **Whenever a screenplay or slideshow is generated** (including Kimi / content-AI presentations), persist it in the **same store** that you use to serve:
  - `GET /api/v1/video/project/:projectId/screenplays` (`getProjectScreenplays`)
  - `GET /api/v1/video/screenplays?userId=...` (`getAllScreenplays`)
- So:
  - **Screenplay generation** (e.g. from chat/ideate or generate-video flow): save the returned screenplay with `projectId` and `userId` so it appears under that project and in the user's list.
  - **Slideshow generation** (e.g. `POST /api/v1/video/generate-slideshow` with Kimi): after generating slides, **also persist** that result as a screenplay (or in the same table/collection that `getAllScreenplays` and `getProjectScreenplays` read from), with:
    - `userId`
    - `projectId` if the request is tied to a project
    - Enough data (title, scenes/slides, format, etc.) so the frontend can show it in History → Slides and, when applicable, under the project.

If slideshows are currently only returned in the HTTP response and never written to the DB, that's why they don't show up in History. Adding this persistence step will fix it.

---

## 3. Avoid duplicate work and credit waste

- **Idempotency**: For any endpoint that spends credits (e.g. generate video, generate slideshow), consider:
  - Requiring a client-generated `idempotencyKey` (or request id) in the body/header.
  - Deduplicating by that key so the same request is not processed twice if the client retries (e.g. after a navigation or refresh).
- **No auto-regeneration on load**: The frontend does not intend to call generate again when the user merely opens a project or the dashboard. Ensure the backend does not trigger generation on GET or "open project" calls; only on explicit user actions (e.g. "Generate", "Generate slideshow").
- **Clear success/failure and status**: So the frontend can show "completed" vs "failed" and avoid unnecessary retries that could double-charge.

---

## 4. Summary checklist (backend repo)

| Requirement | Notes |
|------------|--------|
| Auth | Validate Supabase JWT; use subject as `userId` for all project/screenplay/history APIs. |
| Persist screenplays | Every screenplay/slideshow generation (including Kimi) should write to the store that `getProjectScreenplays` and `getAllScreenplays` read from. |
| List by user | `GET /api/v1/video/screenplays?userId=...` must return all saved screenplays/slides for that user (and, if applicable, link to project). |
| List by project | `GET /api/v1/video/project/:projectId/screenplays` must return screenplays for that project. |
| Idempotency | For credit-consuming endpoints, support idempotency keys to avoid duplicate charges on retries. |
| No generation on GET | Do not run generation when the frontend fetches project or screenplay list; only when the user explicitly triggers generation. |
| Project chat | `GET/POST /api/v1/project/:projectId/chat` — see section 5. |

Once the backend persists all generated slides/screenplays and exposes them via the existing screenplay APIs, the frontend's History → Slides tab will show them without further frontend changes.

---

## 5. Persist project chat so conversation is restored when reopening a project

### Problem

- Chat messages (ideation and refinement) live only in React state. When the user navigates away or refreshes, the conversation is lost.
- The frontend needs to load and save chat per project so that reopening a project shows the same scrollable conversation.

### Supabase table: `chat_messages`

Use the existing **`chat_messages`** table. Column mapping:

| Table column   | API / frontend              | Notes |
|----------------|----------------------------|--------|
| `id`           | `id`                       | uuid, PK; use `gen_random_uuid()` on insert or keep client `id` if you store as uuid. |
| `project_id`   | —                          | Set to the project UUID for every row. |
| `user_id`      | —                          | Set from JWT for every row. |
| `role`         | `role`                     | `'user'`, `'assistant'`, or `'system'`. |
| `content`      | `content`                  | Message text. |
| `created_at`   | `timestamp`                | Return as ISO 8601 string in the API. |
| `screenplay_ver` | optional                  | Can stay NULL unless you version by screenplay. |
| `metadata`     | optional                   | Can stay `'{}'` or store extra data. |

### What the backend should do

- **GET** `GET /api/v1/project/:projectId/chat`
  - Query: `SELECT id, role, content, created_at FROM chat_messages WHERE project_id = $1 ORDER BY created_at ASC`.
  - Ensure the project belongs to the authenticated user (e.g. join with `projects` or check `projects.user_id`).
  - Return `{ messages: [ { id, role, content, timestamp: created_at in ISO 8601 } ] }`.
- **POST** `POST /api/v1/project/:projectId/chat`
  - Body: `{ messages: [ { id: string, role: "user" | "assistant" | "system", content: string, timestamp: string } ] }`.
  - Ensure the project belongs to the authenticated user.
  - **Replace** the project’s chat: e.g. `DELETE FROM chat_messages WHERE project_id = $1 AND user_id = $2`, then `INSERT` one row per message with `project_id`, `user_id`, `role`, `content`, and `created_at` (from payload `timestamp` or `now()`). Use the client-provided `id` as the row `id` if your column accepts it, or generate a new uuid and ignore client id.
- **Auth:** Resolve `userId` from JWT; only read/write rows for projects that belong to that user.

### Frontend usage

- On opening a project, the app calls `GET /api/v1/project/:projectId/chat` and initializes the chat panel with the returned messages (scrollable view).
- After each user message and each assistant reply, the app calls `POST /api/v1/project/:projectId/chat` with the full current messages array so the backend can persist it.
