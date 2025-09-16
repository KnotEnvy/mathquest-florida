# Repository Guidelines

## Project Structure & Module Organization
MathQuest Florida is a pnpm/turbo monorepo. The Next.js app lives in pps/web, with routes and layouts in src/app, shared UI in src/components, and client helpers in src/lib. Shared packages sit under packages: ui for component primitives, config for lint/ts presets, and database for Prisma schema and seed scripts. Product docs and UX briefs are stored in docs/. Environment scaffolding stays in the *.env.example files; keep real secrets local.

## Build, Test, and Development Commands
Run pnpm install once, then pnpm dev to launch all workspace dev servers via Turbo. Use pnpm --filter @mathquest/web dev when you only need the web client. pnpm build, pnpm lint, and pnpm type-check map to Next.js build, ESLint, and TypeScript checks respectively. Execute pnpm --filter @mathquest/web test for Vitest suites and pnpm --filter @mathquest/web test:e2e for Playwright specs in pps/web/tests/e2e.

## Coding Style & Naming Conventions
ESLint extends the Next.js profile, and Prettier enforces 2-space indentation, single quotes, and trailing commas (run pnpm format before pushing). Tailwind classes are auto-sorted by the Prettier plugin�avoid manual reordering. Name React components with PascalCase (LessonTracker.tsx), hooks with camelCase (useSupabaseAuth.ts), and Vitest files with .test.ts(x). Prisma models belong in packages/database/prisma/schema.prisma; migrations should be grouped per feature.

## Testing Guidelines
Write unit and integration tests alongside the code they cover or under src/__tests__. Favor Testing Library patterns and clear spec names ("shows retry banner"). High-impact flows require Playwright coverage in 	ests/e2e; tag specs per route to keep runs focused. Aim to maintain existing coverage baselines (>80% in learning flows). Before opening a PR, run pnpm lint, pnpm type-check, unit tests, and at least the affected Playwright suite.

## Commit & Pull Request Guidelines
Commits follow the short lower-case phrase style seen in history (	ighten lesson stats copy). Group related work and keep commits focused. PRs should outline the change, link tracking tickets, attach screenshots for UI changes, and note testing results. Confirm reviewers from the owning squad, let CI finish, then squash-merge once approvals and checks are green.

## Security & Configuration Tips
Copy .env.example to .env.local within each workspace and populate Supabase credentials with least-privilege keys. Never commit .env files; secrets are rotated if exposed. Reset local data using pnpm --filter @mathquest/database db:push before running seed scripts.
