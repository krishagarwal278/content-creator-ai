# Videaa - AI Video Generator

Transform your documents, PDFs, slides, and notebooks into engaging short-form videos, reels, and cinematic content with AI-powered video generation.

## Getting Started

### Prerequisites

- Node.js 18+ & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

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
- **Backend**: Supabase (Auth, Database)
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

Create a `.env` file with:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_URL=http://localhost:4000
```

## License

© 2026 Videaa AI. All rights reserved.
