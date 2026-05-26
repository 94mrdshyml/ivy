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

---

## Session 2a — Foundation: Schema, Auth & Dashboard Shell

**Date & Time (IST):** 2026-05-26 20:30 IST  
**Status:** Completed

### What We Built

Full platform foundation: Stripe-style ID generator, revised multi-tenant Prisma schema with soft delete, RLS migration SQL, Supabase SSR client helpers, Next.js App Router route groups, four auth pages, onboarding wizard, dashboard shell with sidebar and header, all placeholder pages, and settings pages for profile and connections.

### How We Built It

**ID generator (`packages/db/src/ids.ts`):** Uses `nanoid` with a custom 36-char alphabet (base36) and 24-char length. All models use prefixed IDs: `org_`, `usr_`, `mem_`, `inv_`, `acc_`, `aud_`. IDs always generated at application layer before insert — `id String @id` with no `@default()` in schema.

**Prisma schema replacement:** Full schema with 6 models (User, Organization, Membership, Invitation, SocialAccount, AuditLog), 4 enums (Role, Plan, InvitationStatus, Platform). Every org-scoped table has `@@index([orgId])` and `deletedAt DateTime?` for soft delete. `@@unique([orgId, platform])` on SocialAccount prevents duplicate platform connections per org.

**Soft delete middleware (`packages/db/src/client.ts`):** Prisma `$use` middleware intercepts `findUnique`, `findFirst`, `findMany` and injects `where.deletedAt = null` automatically. Global singleton pattern for hot reload safety.

**Org context utility (`packages/db/src/context.ts`):** `getOrgContext(userId)` returns `{ org, role, userId }` or throws typed `UnauthorizedError`/`ForbiddenError`. Fetches first membership ordered by `createdAt` — supports future multi-org switching.

**Supabase clients (`packages/db/src/supabase.ts`):** Three exports — browser client (publishable key), admin client (secret key), and async `createSupabaseServerClient()` factory using `@supabase/ssr` + `next/headers`. Factory uses the new key name convention (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_SECRET_KEY`).

**RLS (`packages/db/supabase/migrations/001_rls.sql`):** Helper function `auth.user_org_ids()` returns org IDs for current user. Six tables gated with `for select` policies. Run once via `pnpm db:migrate`.

**Route groups:**

- `(auth)` — centred card layout, no sidebar. Four pages: login, register, forgot-password, reset-password. All client components using `@supabase/supabase-js` browser client directly.
- `(app)` — server layout fetches session + dbUser, renders `Sidebar` + `Header` client components, protects route with redirect if no session.
- `app/auth/callback/route.ts` — exchanges Supabase auth code for session using server client, redirects to `/dashboard`.

**Auth pages design:** Dark bg `#08090C`, surface card `#15161E`, Ivy Green CTA `#00D97E`. Google OAuth + email/password on login and register. Forgot password shows success state after submit (no re-submit possible). Reset password validates password match client-side.

**Register flow:** `supabase.auth.signUp()` client-side → server action `createUserRecords()` creates User + Organization + Membership (OWNER) with generated IDs → redirect `/onboarding`.

**Onboarding wizard:** Two-step, React state only (no URL changes). Step 1: name + handle with 400ms debounced availability check via `/api/check-handle`. Step 2: platform card selection (Instagram/Facebook/YouTube, single select). On finish: server action `completeOnboarding()` updates User.name and Org.slug, redirects to `/dashboard`.

**Dashboard shell:** Fixed sidebar 240px, fixed header 56px. Sidebar uses `usePathname()` for active state — Ivy Green left border + `rgba(0,217,126,0.06)` background. Header title derived from pathname map. Both client components receiving user data from server layout.

**Social brand icons:** lucide-react v1+ removed Instagram/Facebook/YouTube brand icons. Created `components/social-icons.tsx` with inline SVG components (`InstagramIcon`, `FacebookIcon`, `YoutubeIcon`) accepting `size` and `color` props. `ComingSoon` component uses `React.ElementType` (not `LucideIcon`) to accept both lucide and custom icons.

**Settings pages:** Profile — avatar upload to Supabase Storage `avatars` bucket, name + handle fields, save button disabled until dirty. Uses Next.js `Image` for avatar (added `*.supabase.co` remote pattern to `next.config.mjs`). Connections — reads `SocialAccount` table, shows connection status per platform, Connect buttons are disabled placeholders for Session 2b. Billing — ComingSoon.

**Middleware (`apps/web/middleware.ts`):** Protects `/dashboard/*` and `/onboarding`. Redirects authenticated users away from auth pages. Uses `@supabase/ssr` `createServerClient` with full cookie forwarding. Excludes `_next/*` and `api/*` from matching.

### In Scope

- `packages/db/src/ids.ts` — ID generator
- `packages/db/src/client.ts` — Prisma client with soft-delete middleware
- `packages/db/src/context.ts` — `getOrgContext` utility
- `packages/db/src/supabase.ts` — browser, admin, and SSR server clients
- `packages/db/prisma/schema.prisma` — full multi-tenant schema
- `packages/db/supabase/migrations/001_rls.sql` — RLS policies
- `apps/web/middleware.ts` — route protection
- `apps/web/app/(auth)/*` — login, register, forgot-password, reset-password
- `apps/web/app/auth/callback/route.ts` — Supabase OAuth callback
- `apps/web/app/(app)/layout.tsx` — dashboard shell
- `apps/web/app/(app)/dashboard/page.tsx` — overview stub
- `apps/web/app/(app)/dashboard/analytics/{instagram,facebook,youtube}/page.tsx`
- `apps/web/app/(app)/dashboard/{link-in-bio,crm,dm}/page.tsx`
- `apps/web/app/(app)/dashboard/settings/{profile,connections,billing}/page.tsx`
- `apps/web/app/onboarding/page.tsx` — two-step wizard
- `apps/web/app/api/check-handle/route.ts` — handle availability check
- `apps/web/components/{sidebar,header,coming-soon,social-icons}.tsx`
- `apps/web/app/{not-found,error,loading}.tsx`

### Out of Scope

- Instagram/Facebook/YouTube OAuth (Session 2b)
- Analytics data fetching and charts (future sessions)
- Email verification flows
- Multi-org switching UI
- Link in Bio builder, CRM, DM Automation features

### Breaking Changes

- **Prisma schema fully replaced:** Old schema had a single `User` model with `handle` field. New schema has 6 models, no `handle` on User (handle is stored as `Organization.slug`). Any existing data would need migration.
- **Supabase key names changed:** `.env.example` now uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY` instead of `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`. Update `.env.local` accordingly.
- **`packages/db/src/index.ts` changed:** Now exports from separate files instead of the monolithic old `index.ts`. Any code that imported directly from `@ivy/db` will still work if it was importing standard Prisma types (re-exported via `export * from '@prisma/client'`).

### Notes for Future Sessions

- **Supabase key names:** The new key convention is `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (was `NEXT_PUBLIC_SUPABASE_ANON_KEY`) and `SUPABASE_SECRET_KEY` (was `SUPABASE_SERVICE_ROLE_KEY`). All code uses the new names. CI secrets in GitHub must be updated before deploy workflow succeeds.
- **lucide-react brand icons:** v1+ removed all social brand icons. Use `components/social-icons.tsx` for Instagram/Facebook/YouTube. Do not attempt to import these from lucide-react.
- **Prisma soft delete middleware caveat:** The `$use` middleware sets `deletedAt = null` on all reads. This means you cannot query for soft-deleted records via the `db` client. Use `supabaseAdmin` for admin operations that need to see deleted records.
- **`next` in `packages/db` deps:** Added `next` as a dependency to `@ivy/db` so `next/headers` resolves in `supabase.ts`. This couples the db package to Next.js — if workers or other non-Next apps ever import `@ivy/db`, they must not import `createSupabaseServerClient` or the import will fail at runtime.
- **Register → onboarding flow:** Email confirmation must be disabled in Supabase dashboard for the current flow to work. If enabled, `data.user` will be null after `signUp()` and the user won't be redirected to onboarding. Consider adding a confirmation-pending state if enabling email confirmation.
- **Supabase Storage `avatars` bucket:** Must be created manually in Supabase dashboard with public access before avatar upload works in Settings → Profile.
- **RLS migration:** `packages/db/supabase/migrations/001_rls.sql` is NOT a Prisma migration — it must be run manually against Supabase or via Supabase CLI (`supabase db push`). The `pnpm db:migrate` script runs `prisma migrate deploy` which won't apply this file.
- **`exactOptionalPropertyTypes: true`:** The tsconfig has this flag. All Prisma `where` clauses must use defined values — never pass `undefined` where a defined string is expected. Guard with `if (dbUser)` before using `dbUser.id` in queries.
- **playwright.config.ts `workers`:** Changed from `process.env.CI ? 1 : undefined` to `1` to satisfy `exactOptionalPropertyTypes`. This runs Playwright tests single-threaded always.
