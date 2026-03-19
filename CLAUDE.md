# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (port 8080)
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # ESLint
npm run test         # Run tests once (Vitest)
npm run test:watch   # Run tests in watch mode
npm run preview      # Preview production build
```

## Architecture

**Stack**: React 18 + TypeScript + Vite SPA, backed by Supabase (PostgreSQL + Auth).

**Routing** (`src/App.tsx`): React Router v6 with these main sections:
- `/` — Landing page
- `/login`, `/signup`, `/forgot-password`, `/reset-password` — Auth flow
- `/dashboard` — User dashboard (resume/website management)
- `/resume/new`, `/resume/edit` — Multi-step resume builder
- `/website/new`, `/website/edit` — Website builder
- `/site/:id` — Public portfolio display
- `/settings` — User settings
- `/admin/*` — Admin panel (users, resumes, websites, analytics, contacts)

**Key directories**:
- `src/pages/` — One file per route
- `src/components/ui/` — shadcn/ui primitives (Radix-based)
- `src/components/resume/`, `website/`, `landing/`, `admin/` — Feature components
- `src/integrations/supabase/` — Supabase client + auto-generated TypeScript types
- `src/hooks/` — Custom React hooks
- `src/types/` — Shared TypeScript types
- `src/test/` — Test files and setup

**Data layer**: All server state via React Query (@tanstack/react-query v5) querying Supabase. Forms use React Hook Form + Zod validation.

**Supabase tables**: `profiles`, `resumes`, `websites`, `contact_submissions`. Types are auto-generated in `src/integrations/supabase/types.ts` — do not edit manually.

**Styling**: Tailwind CSS with CSS variables for theming. Dark mode via `next-themes`. Playfair Display for headings, Inter for body. Custom animations defined in `tailwind.config.ts`.

**PDF export**: `html2pdf.js` (client-side only).

**Path alias**: `@/` maps to `src/`.

**TypeScript config**: Lenient — no strict null checks, implicit any allowed.

**UI language**: French (landing page copy, UI text).
