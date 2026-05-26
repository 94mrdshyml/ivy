# Ivy — Session Log

---

## Session 1 — Monorepo Setup & CI Infrastructure

**Date & Time (IST):** 2026-05-26 18:25 IST  
**Status:** Completed

### What We Built

Full monorepo foundation for Ivy. No feature code — only tooling, package structure, and CI/CD pipelines. Everything a new engineer needs to start building features in Session 2.

### How We Built It

**Monorepo tooling:** pnpm workspaces + Turborepo. `pnpm-workspace.yaml` declares four package roots: `apps/*`, `packages/*`, and `packages/config/*` (the config sub-packages need their own workspace entry to be resolvable as `@ivy/*`).

**Package structure:**

- `packages/config/{eslint-config,prettier-config,tsconfig}` — three separate workspace packages (`@ivy/eslint-config`, `@ivy/prettier-config`, `@ivy/tsconfig`). tsconfigs use relative extends paths (e.g. `../config/tsconfig/base.json`) rather than package name resolution, which is more reliable across tools.
- `packages/types` — `Platform` enum (INSTAGRAM | FACEBOOK | YOUTUBE) and `Creator` interface. Vitest smoke test lives here.
- `packages/db` — Prisma 5 schema (postgresql, single `User` model) + Supabase JS client. `postinstall` runs `prisma generate` automatically.
- `packages/ui` — shadcn/ui New York-style components (Button, Input, Card, Badge, Separator, Skeleton) built from scratch with Radix UI primitives. `cn()` utility exported from `lib/utils.ts`.

**apps/web:** Next.js 14.2.4 App Router, TypeScript strict, Tailwind CSS 3 with dark-only CSS variables (background `#0a0a0a`), Inter font. Single placeholder page renders "Ivy — coming soon". shadcn/ui config at `components.json`. Playwright configured for chromium-only E2E with `webServer` auto-start.

**apps/workers:** Minimal Node.js TypeScript app with Inngest v3 client (`id: ivy-workers`) and one placeholder function `hello-ivy`. Serves via Node `http.createServer` wrapping Inngest's `serve()`.

**Code quality:** Husky v9 with pre-commit (lint-staged) and commit-msg (commitlint). Commitlint enforces conventional commits with types: feat, fix, chore, docs, style, refactor, test, ci. lint-staged runs ESLint fix + Prettier on `.ts/.tsx`.

**Testing:** Vitest at monorepo root discovers all `*.test.ts` files. One smoke test in `packages/types` asserts `Platform` enum has 3 values. Playwright in `apps/web` with one smoke test asserting homepage contains "Ivy".

**CI/CD — 9 GitHub Actions workflows:**
| Workflow | Trigger | Purpose |
|---|---|---|
| `ci-lint.yml` | All PRs | turbo lint + type-check |
| `ci-unit-tests.yml` | All PRs | Vitest |
| `ci-e2e.yml` | PRs → main | Playwright chromium |
| `preview-deploy.yml` | All PRs | Vercel preview + PR comment |
| `production-deploy.yml` | Push to main | migrate → build → `vercel deploy --prebuilt` |
| `db-migration-check.yml` | PRs touching `packages/db/**` | `prisma validate` + `prisma format --check` |
| `security-audit.yml` | All PRs | `pnpm audit --audit-level=high`, posts comment, does not block |
| `bundle-size.yml` | All PRs | Build web, post `.next/static` size as PR comment |
| `stale.yml` | Daily cron 09:00 UTC | Label stale after 14d, close after 7d more |

Production deploy follows CLAUDE.md pattern: `migrate` job → `build` job (typecheck + lint + build + `vercel pull`) → `deploy` job (`vercel deploy --prebuilt --prod`).

### In Scope

- pnpm + Turborepo monorepo scaffold
- All 4 shared packages (`config`, `types`, `db`, `ui`)
- `apps/web` Next.js 14 placeholder app
- `apps/workers` Inngest placeholder
- Husky + lint-staged + commitlint
- Vitest root config + Platform smoke test
- Playwright config + E2E smoke test
- 9 GitHub Actions workflow files
- `dependabot.yml` (weekly npm updates, 3 directories)
- `.env.example` in both apps
- `README.md`

### Out of Scope

- Authentication (WorkOS — future session)
- Any feature pages or API routes
- Actual database connection (Supabase/Neon credentials not configured)
- Inngest production deployment
- E2E tests beyond smoke test

### Breaking Changes

NONE — greenfield project.

### Notes for Future Sessions

- **pnpm v10 build scripts:** Root `package.json` has `"pnpm": { "onlyBuiltDependencies": [...] }` allowing esbuild, prisma, protobufjs, unrs-resolver to run postinstall. If adding new packages that need native binaries, add them here.
- **Next.js 14 config:** Must use `next.config.mjs` (not `.ts`) — `.ts` config support added in Next.js 15 only.
- **apps/web ESLint:** `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` must be direct devDeps in `apps/web/package.json`, not just in the shared config package.
- **tsconfig auto-modification:** Next.js dev server auto-adds `noEmit`, `esModuleInterop`, `resolveJsonModule`, `isolatedModules` to `apps/web/tsconfig.json` on first run. This is expected and correct.
- **WorkOS secrets:** CLAUDE.md lists `WORKOS_API_KEY`, `WORKOS_CLIENT_ID`, `NEXT_PUBLIC_WORKOS_REDIRECT_URI` as required secrets — these are not wired up yet. Auth session will need to add WorkOS to `apps/web/.env.example` and the production deploy workflow.
- **Vercel secrets needed before first deploy:** `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` must be added to GitHub repo secrets. Run `vercel link` locally to get org/project IDs.
- **No GitHub remote yet:** Repo is local only. Push to GitHub before CI workflows can run.
- **Prisma vs Drizzle:** Session 1 spec used Prisma. CLAUDE.md deploy job references `pnpm db:migrate` — currently wired to `prisma migrate deploy` in `@ivy/db`. If Drizzle is adopted later, update `packages/db` and the workflow.
