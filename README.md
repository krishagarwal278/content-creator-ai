# Videaa - AI Video Generator

Transform your documents, PDFs, slides, and notebooks into engaging short-form videos, reels, and cinematic content with AI-powered video generation.

## Getting Started

### Prerequisites

- **Node.js 20+** & npm (required for Supabase compatibility; Node 18 is EOL). Use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) and run `nvm use` in the project root (see `.nvmrc`).

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd content-creator-ai

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Tech Stack

- **Framework**: React + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **UI Components**: Material UI (MUI)
- **Backend**: External — [github.com/krishagarwal278/supabase](https://github.com/krishagarwal278/supabase) (Supabase, Express, video/voice APIs). Frontend talks to it via `VITE_BACKEND_URL`.
- **State Management**: React Query

## Project Structure

```
src/
├── api/           # API services and client
├── common/        # Shared components, hooks, contexts
├── components/    # UI component library
├── config/        # App configuration
├── features/      # Feature-based modules
│   ├── auth/
│   ├── dashboard/
│   ├── landing/
│   ├── projects/
│   └── settings/
├── styles/        # Global styles
└── test/          # Test utilities
```

## Environment Variables

Copy `.env.example` to `.env` and set:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_BACKEND_URL=http://localhost:4000
```

- **Local:** `VITE_BACKEND_URL` should be your local backend (e.g. `http://localhost:4000`).
- **Production:** Set `VITE_BACKEND_URL` in your deployment host (e.g. Railway) to your backend API URL (e.g. `https://YOUR-BACKEND.up.railway.app`, no trailing slash). Otherwise the app will try to call localhost in the user’s browser and fail.

The backend (Express, video/voice/slideshow APIs) is in a separate repo: [github.com/krishagarwal278/supabase](https://github.com/krishagarwal278/supabase). Point `VITE_BACKEND_URL` at that service.

## Documentation

- **[AGENTS.md](AGENTS.md)** — Entry point for AI coding agents (commands, structure, required refs)
- **[ARCHITECTURE.md](ARCHITECTURE.md)** — Layers, barrel vs direct imports, scalability, backend placement
- **[STYLEGUIDE.md](STYLEGUIDE.md)** — TypeScript, React, Vite, Tailwind, and file conventions
- **[DEPENDENCIES.md](DEPENDENCIES.md)** — Package management, version bumps, upgrade checklist
- **[CONVENTIONS.md](CONVENTIONS.md)** — Commit messages, branch naming, PR checks

## License

© 2026 Videaa AI. All rights reserved.
