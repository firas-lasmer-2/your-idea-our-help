# Repository Guidelines

## Project Structure & Module Organization
`src/` contains the application code. Route-level pages live in `src/pages/`, shared UI primitives in `src/components/ui/`, and feature components under folders such as `src/components/resume/`, `website/`, `landing/`, and `admin/`. Reusable hooks are in `src/hooks/`, shared types in `src/types/`, and Supabase client code in `src/integrations/supabase/`. Static assets belong in `public/`. Database migrations and Edge Functions live in `supabase/migrations/` and `supabase/functions/`.

## Build, Test, and Development Commands
Use `npm install` to install dependencies. Key commands:

- `npm run dev` starts the Vite dev server on port 8080.
- `npm run build` creates a production bundle in `dist/`.
- `npm run build:dev` builds with development mode settings.
- `npm run lint` runs ESLint across the repo.
- `npm run test` runs Vitest once in `jsdom`.
- `npm run test:watch` runs Vitest in watch mode.
- `npm run preview` serves the production build locally.

## Coding Style & Naming Conventions
This repo uses TypeScript, React function components, and the `@/` path alias for `src/`. Follow the existing style: 2-space indentation, semicolons, and double quotes. Use PascalCase for page and component files such as `ResumeBuilder.tsx`, kebab-case for utility and hook files such as `use-resume.ts`, and keep shared UI primitives in lowercase files under `src/components/ui/`. Run `npm run lint` before opening a PR. There is no Prettier config, so match surrounding formatting closely.

## Testing Guidelines
Unit and component tests use Vitest with Testing Library. Place tests beside source files or under `src/test/` using `*.test.ts` or `*.test.tsx`. Keep tests focused on rendered behavior and hook outcomes, not implementation details. Update `src/test/setup.ts` only for global test fixtures. Playwright is configured, but there is no committed `tests/` suite yet.

## Commit & Pull Request Guidelines
Git history currently starts with a single `first commit`, so adopt clear imperative commit messages such as `Add resume import validation`. Keep each commit scoped to one change. PRs should include a brief summary, linked issue when applicable, test notes (`npm run lint`, `npm run test`), and screenshots for UI changes.

## Security & Configuration Tips
Treat `.env` as local-only and never commit secrets. Do not manually edit generated Supabase types in `src/integrations/supabase/types.ts`; regenerate them from the backend when schema changes land.
