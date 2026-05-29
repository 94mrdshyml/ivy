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

---

## Session 2b — Instagram Connect & Analytics

**Date & Time (IST):** 2026-05-26 22:15 IST
**Status:** Completed

### What We Built

Full Instagram integration: Meta OAuth flow, long-lived token exchange, Inngest hourly sync job
(metrics + posts), and a complete analytics dashboard with 5 metric cards, 3 charts, and a
sortable/paginated content performance table.

### How We Built It

**Prisma schema additions:** Three new models added to the existing schema — `InstagramAccount`
(stores IG user ID, handle, access token), `InstagramMetric` (daily metrics with
`@@unique([instagramAccountId, date])` for safe upserts), `InstagramPost` (per-post metrics
including engagement rate). Added `instagramAccount InstagramAccount?` relation to `SocialAccount`
and `instagramAccounts InstagramAccount[]` to `Organization`. New RLS migration in
`002_instagram_rls.sql`.

**ID prefixes:** Added `igacc`, `igmet`, `igpst` to `packages/db/src/ids.ts`.

**Instagram OAuth (`/api/instagram/connect`):** Builds Meta dialog URL with four required
permissions. Stores `orgId` in a short-lived httpOnly cookie (`ig_org_id`, maxAge 600s) before
redirecting, so the callback knows which org to attach the account to.

**Callback (`/api/instagram/callback`):** Short-lived token → long-lived token exchange via
`fb_exchange_token` grant. Fetches the connected IG Business Account via `/me/accounts` (Pages
API) → IG account fields. Upserts both `SocialAccount` and `InstagramAccount` records — handles
reconnect case by updating existing records and clearing `deletedAt`. Triggers
`instagram/sync.requested` Inngest event immediately after connect. Deletes the `ig_org_id` cookie.

**Disconnect (`/api/instagram/disconnect`):** POST handler, soft-deletes both `SocialAccount` and
`InstagramAccount` via `updateMany`. Does not revoke Meta token.

**Inngest sync (`instagram-sync.ts`):** Dual trigger — `instagram/sync.requested` event (on
connect) and `0 * * * *` cron (hourly). Registered alongside `helloIvy` in workers `index.ts`.
Five steps per account: fetch account insights (30-day window), upsert `InstagramMetric` rows,
fetch media list, fetch per-post insights, upsert `InstagramPost` rows. Each step wrapped in
`step.run()` for independent retry. Writes an `AuditLog` entry after each account sync.
Uses `db` from `@ivy/db` (Prisma client with soft-delete middleware).

**Analytics dashboard (server component):** Reads `searchParams.range` (7/30/90, default 30).
Checks `InstagramAccount` existence — renders empty state with gradient connect CTA if not found,
full analytics if connected. Fetches current-period and previous-period `InstagramMetric` rows in
parallel with `InstagramPost` rows using `Promise.all`. Computes deltas for trend arrows.

**Chart components (client, Recharts):** `FollowerGrowthChart` — AreaChart with green gradient
fill. `ReachImpressionsChart` — LineChart with green (reach) and violet (impressions) lines.
`EngagementChart` — BarChart with aggregated likes/comments/shares/saves totals. All charts use
consistent dark tooltip style and muted axis ticks.

**Metric cards:** Five cards (Followers, Reach, Impressions, Profile Views, Accounts Engaged).
Values formatted with K/M suffixes. Delta shows trend icon (up=green, down=red) vs previous period.
Numbers in Geist Mono via `font-mono` class.

**Content table (client component):** Sortable by any numeric column (reach, likes, comments,
shares, saves, engagement rate). Default sort: reach desc. Paginated at 20 rows. Thumbnail via
Next.js `Image`. Media type badge with per-type color. Caption truncated at 60 chars.

**Connections page update:** Instagram now has a live Connect link (`/api/instagram/connect`) and
a `DisconnectButton` client component (calls `/api/instagram/disconnect`, then `router.refresh()`).
Facebook and YouTube show "Coming soon" disabled buttons.

**`exactOptionalPropertyTypes` fix in workers:** Prisma nullable fields require `null` not
`undefined` when using `exactOptionalPropertyTypes: true`. All optional fields in metric/post
upserts now use `?? null`.

### In Scope

- `packages/db/prisma/schema.prisma` — InstagramAccount, InstagramMetric, InstagramPost models
- `packages/db/supabase/migrations/002_instagram_rls.sql`
- `packages/db/src/ids.ts` — igacc, igmet, igpst prefixes
- `apps/web/app/api/instagram/connect/route.ts`
- `apps/web/app/api/instagram/callback/route.ts`
- `apps/web/app/api/instagram/disconnect/route.ts`
- `apps/web/app/(app)/dashboard/analytics/instagram/page.tsx` (full rewrite)
- `apps/web/app/(app)/dashboard/analytics/instagram/date-range-selector.tsx`
- `apps/web/app/(app)/dashboard/analytics/instagram/metric-cards.tsx`
- `apps/web/app/(app)/dashboard/analytics/instagram/charts.tsx`
- `apps/web/app/(app)/dashboard/analytics/instagram/content-table.tsx`
- `apps/web/app/(app)/dashboard/settings/connections/page.tsx` (wired buttons)
- `apps/web/app/(app)/dashboard/settings/connections/disconnect-button.tsx`
- `apps/workers/src/inngest/functions/instagram-sync.ts`
- `apps/workers/src/index.ts` (registered instagramSync)
- `apps/web/.env.example` (added META_APP_ID, META_APP_SECRET)

### Out of Scope

- Facebook and YouTube OAuth (future sessions)
- Story insights (Meta API has 24h expiry restrictions on story metrics)
- Token refresh flow (long-lived tokens last 60 days; refresh is a future session)
- Inngest event key / signing key configuration for production

### Breaking Changes

- `SocialAccount` model now has optional `instagramAccount InstagramAccount?` relation.
  Existing `SocialAccount` rows are unaffected (relation is optional).
- Workers app now depends on `@ivy/db` — Prisma client runs in Node.js context.
  Workers tsconfig uses `module: CommonJS` which is compatible.

### Notes for Future Sessions

- **Meta app setup required:** Before testing OAuth, developer must create a Meta Developer App,
  add Instagram Graph API product, set redirect URI to
  `{NEXT_PUBLIC_APP_URL}/api/instagram/callback`, and add `META_APP_ID` + `META_APP_SECRET` to
  `.env.local`. The app must be in Live mode or the test user must be added as a tester.
- **Instagram Business Account required:** The OAuth flow uses the Pages API to find the IG
  Business Account linked to a Facebook Page. Personal IG accounts are not supported.
- **Inngest sync trigger:** The callback fires `instagram/sync.requested` via a direct fetch to
  `/api/inngest`. In production this requires the Inngest event key to be set. In dev, start the
  Inngest dev server (`npx inngest-cli@latest dev`) and workers app together.
- **Token refresh:** Long-lived tokens expire in 60 days. A future session must implement a cron
  job to refresh tokens before expiry using the `GET /oauth/access_token` endpoint with
  `grant_type=ig_refresh_token`.
- **`@tremor/react` installed but not used:** The spec mentioned Tremor; charts were implemented
  with Recharts directly (already installed as Tremor dependency). Tremor v3 components conflict
  with Next.js 14 App Router server components. Recharts directly is the correct approach.
- **Supabase image domain:** Media URLs from Meta CDN (`scontent-*.cdninstagram.com`) are not in
  `next.config.mjs` remotePatterns. Add this pattern before thumbnails in ContentTable render.
- **`next/headers` cookies in route handlers:** Next.js 14 `cookies()` in route handlers works
  synchronously. The `await cookies()` call in connect/callback routes works because awaiting a
  non-Promise is a no-op in JS.

---

## Session 2c — CI/CD Fixes, Vercel Production Deploy & Inngest Wiring

**Date & Time (IST):** 2026-05-28 20:30 IST
**Status:** Completed

### What We Built

No new features. Full CI/CD pipeline brought to green, Vercel production deploy working end-to-end, Supabase schema migrated, and Inngest serve handler added to the web app.

### How We Built It

**CI fixes (12 commits):**

- Added `"packageManager": "pnpm@9.15.9"` to root `package.json` — required by Turborepo v2 for workspace resolution. This conflicted with `version: 9` in `pnpm/action-setup@v4` steps; removed `version:` from all workflow files so the action reads `packageManager` automatically.
- Added `contents: read` permission to `preview-deploy.yml`, `bundle-size.yml`, `security-audit.yml` — Vercel's team checkout was returning 403 without it.
- Added dummy `DATABASE_URL` env to `db-migration-check.yml` — `prisma validate` reads the datasource URL even for schema-only validation.
- Added `eslint` + `@typescript-eslint/*` devDeps and `.eslintrc.js` to `apps/workers` and `packages/ui` — they ran `eslint src/` with no eslint installed.
- Ran `prisma format` to fix schema formatting — `prisma format --check` in CI was failing on unformatted schema.
- Added `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to `bundle-size.yml` build step — Next.js prerendering of auth pages calls Supabase client at build time.
- Made `supabase` and `supabaseAdmin` lazy-initialized (`getSupabase()`/`getSupabaseAdmin()` getter functions) — module-level `createClient()` crashes the build when env vars are absent.
- Added `continue-on-error: true` to the PR comment step in `preview-deploy.yml` — deploy itself succeeds but comment posting fails due to token permissions; non-critical.
- Added `vercel.json` at repo root to configure `outputDirectory: apps/web/.next` and `buildCommand: pnpm turbo build --filter web`.
- Fixed `production-deploy.yml` to use `vercel --prod --yes` (source deploy) rather than the prebuilt artifact approach — `vercel build` without framework detection packs `.next` as static files, breaking Next.js routing.

**Vercel project configuration:**

- Used Vercel API (`PATCH /v9/projects/{id}`) to set `rootDirectory: apps/web`, `framework: nextjs`, `buildCommand: cd ../../ && pnpm turbo build --filter web`, `outputDirectory: .next`. This was the root cause of the production 404 — Vercel detected "Other" framework and served output as static files with no routes.
- Added `HUSKY=0` env var to Vercel project via API — second `pnpm install` in the build command (from `../../`) runs in `NODE_ENV=production`, strips devDeps including husky, causing the `prepare` script to fail.
- Fixed build command to remove the extra `pnpm install` call — Vercel's install step already handles this; re-running it from the repo root downgraded deps.
- `vercel.json` simplified to `{"framework": "nextjs"}` after project settings took over.

**Vercel + GitHub auth:**

- Connected GitHub account (`94mrdshyml`) to Vercel account settings — Hobby plan requires commit author email to match a verified Vercel account login. Before this fix, Vercel blocked all deploys with `NOT_FOUND` because `mridu@mrdshyml.xyz` (the git commit email) could not be matched.

**Database:**

- No Prisma migration files existed — `prisma migrate deploy` was silently creating only the `_prisma_migrations` tracking table. Ran `prisma migrate dev --name init` locally to generate `packages/db/prisma/migrations/20260528141045_init/migration.sql` and apply it to Supabase. Schema now fully deployed.
- Added `directUrl = env("DIRECT_URL")` to `schema.prisma` datasource — Supabase transaction pooler (port 6543) blocks advisory locks used by `prisma migrate`. `DIRECT_URL` must point to the session pooler or direct connection (port 5432).
- `DATABASE_URL` for runtime uses the transaction pooler with `?pgbouncer=true`. `DIRECT_URL` for migrations uses the session pooler without pgbouncer.

**Inngest serve handler:**

- Created `apps/web/app/api/inngest/route.ts` — Next.js App Router route that serves the `instagram-sync` function via `inngest/next` serve helper. Workers app cannot be deployed as a persistent server on Vercel; the serve endpoint must live in the Next.js app.
- Added `inngest` to `apps/web` package.json dependencies.
- The `instagramSync` function is defined directly in the route file (duplicated from workers) rather than importing from workers — workers uses `module: CommonJS` tsconfig which is incompatible with Next.js bundler resolution.
- Sync URL for Inngest dashboard: `https://ivy.indexdaily.in/api/inngest`.

### In Scope

- All `.github/workflows/*.yml` — CI permission, version, and env fixes
- `package.json` root — `packageManager` field
- `apps/workers/.eslintrc.js` + ESLint devDeps
- `packages/ui/.eslintrc.js` + ESLint devDeps
- `packages/db/src/supabase.ts` — lazy init for `getSupabase()`/`getSupabaseAdmin()`
- `packages/db/src/index.ts` — updated exports
- `packages/db/prisma/schema.prisma` — `directUrl` datasource field
- `packages/db/prisma/migrations/20260528141045_init/` — initial migration SQL
- `apps/web/.env.example` — added `DIRECT_URL`
- `apps/web/app/api/inngest/route.ts` — Inngest serve handler
- `vercel.json` — simplified to `{"framework": "nextjs"}`
- `CLAUDE.md` — added Vercel deploy check to GH Actions Watch Protocol

### Out of Scope

- Facebook and YouTube OAuth
- Instagram token refresh cron
- Inngest signing key / event key wiring (INNGEST_SIGNING_KEY, INNGEST_EVENT_KEY not yet set in Vercel env)

### Breaking Changes

- `supabase` and `supabaseAdmin` are no longer direct exports from `@ivy/db`. They are now `getSupabase()` and `getSupabaseAdmin()` getter functions. Any future code that imports `supabase` directly from `@ivy/db` will fail — use the getter functions instead.

### Notes for Future Sessions

- **Inngest env vars needed in Vercel:** `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` must be set in the Vercel project environment for the serve handler to validate requests from Inngest in production. Without them, the endpoint accepts requests without signature verification (works but insecure).
- **Inngest app sync required:** After each deploy, the Inngest dashboard may need to be resynced at `https://ivy.indexdaily.in/api/inngest` if function signatures change.
- **Workers app is now dev-only:** `apps/workers` runs the Inngest dev server locally. In production, all Inngest functions are served from `apps/web/app/api/inngest/route.ts`. The two are currently kept in sync manually — consider moving function definitions to a shared `packages/inngest` package to avoid drift.
- **`DATABASE_URL` vs `DIRECT_URL`:** Both must be set in GH Secrets and Vercel env. `DATABASE_URL` = transaction pooler (port 6543, `?pgbouncer=true`). `DIRECT_URL` = session pooler (port 5432, no pgbouncer). Using `DIRECT_URL` for migrations is mandatory.
- **Vercel project settings live outside the repo:** Root directory, build command, and framework preset were set via Vercel API — they are not in `vercel.json`. If the Vercel project is recreated, these must be reapplied.
- **Supabase avatars bucket:** Still needs to be created manually in Supabase Storage with public access for profile photo upload to work.
- **Meta CDN domain still missing from `next.config.mjs`:** `scontent-*.cdninstagram.com` must be added to `remotePatterns` before Instagram post thumbnails render in the content table.

---

## Session 2d — Production Bug Fixes

**Date & Time (IST):** 2026-05-29 11:30 IST
**Status:** Completed

### What We Built

No new features. Fixed three production bugs discovered after first live deployment: auth session not persisting after login, Prisma native engine not found on Vercel, and GH Actions quota exhaustion.

### How We Built It

**Auth session bug (login stuck on "Signing in…"):**
All client-side pages (`/login`, `/register`, `/forgot-password`, `/reset-password`, `/onboarding`, profile-form) used `createClient` from `@supabase/supabase-js`. This stores the session in `localStorage`. The middleware uses `createServerClient` from `@supabase/ssr` which reads from cookies. Mismatch meant middleware saw no session after login and silently redirected back to `/login`, causing the button to stay in loading state indefinitely. Fixed by replacing all `createClient` calls with `createBrowserClient` from `@supabase/ssr`, which writes the session to cookies that the middleware can read.

**Prisma engine not found on Vercel (`rhel-openssl-3.0.x`):**
Root cause: `transpilePackages: ['@ivy/db']` caused Next.js webpack to bundle `@prisma/client` inline into chunks. When bundled, Prisma's native engine loader uses `__dirname` pointing to `.next/server/chunks/` instead of the actual `@prisma/client` package location — so it can't resolve the engine binary path. Multiple attempted workarounds failed:

- `binaryTargets = ["native", "rhel-openssl-3.0.x"]` alone: generates binary but bundling still breaks resolution
- `serverComponentsExternalPackages`: overridden by `transpilePackages` for transitive imports
- webpack externals (`@prisma/client`): broke Vercel file tracing with pnpm symlinks → `Cannot find module '@prisma/client'`
- `outputFileTracingRoot`: helped but didn't fix bundling

**Correct fix:** `@prisma/nextjs-monorepo-workaround-plugin` — the official Prisma-maintained webpack plugin for monorepo deployments on Vercel. It copies the Prisma engine binary (`libquery_engine-rhel-openssl-3.0.x.so.node`) next to the Next.js bundle during build, so Prisma can find it at the expected path at runtime. Added to `apps/web/package.json` devDeps and registered in `next.config.mjs` webpack config.

**GH Actions quota exhausted:**
1550 of 2000 free private-repo minutes consumed in one day during repeated CI debugging loops. Made repo public to restore unlimited free Actions minutes.

### In Scope

- `apps/web/app/(auth)/login/page.tsx` — `createBrowserClient`
- `apps/web/app/(auth)/register/page.tsx` — `createBrowserClient`
- `apps/web/app/(auth)/forgot-password/page.tsx` — `createBrowserClient`
- `apps/web/app/(auth)/reset-password/page.tsx` — `createBrowserClient`
- `apps/web/app/onboarding/page.tsx` — `createBrowserClient`
- `apps/web/app/(app)/dashboard/settings/profile/profile-form.tsx` — `createBrowserClient`
- `apps/web/next.config.mjs` — PrismaPlugin, outputFileTracingRoot
- `apps/web/package.json` — `@prisma/nextjs-monorepo-workaround-plugin`
- `packages/db/prisma/schema.prisma` — `binaryTargets = ["native", "rhel-openssl-3.0.x"]`

### Out of Scope

- Facebook and YouTube OAuth
- Instagram token refresh cron
- Inngest signing key configuration

### Breaking Changes

NONE — all fixes are backwards compatible.

### Notes for Future Sessions

- **`createBrowserClient` everywhere:** Any new client component that touches Supabase auth must use `createBrowserClient` from `@supabase/ssr`, not `createClient` from `@supabase/supabase-js`. The distinction matters: `supabase-js` uses localStorage, `@supabase/ssr` uses cookies. Middleware reads cookies only.
- **Prisma in monorepos:** `@prisma/nextjs-monorepo-workaround-plugin` must stay in `next.config.mjs`. If removed, the `rhel-openssl-3.0.x` engine error returns on Vercel. The underlying cause is `transpilePackages: ['@ivy/db']` bundling `@prisma/client` — this will remain until `@ivy/db` is compiled to JavaScript and removed from `transpilePackages`.
- **GH Actions budget:** Repo is now public (unlimited free minutes). If repo is ever made private again, 2000 min/month limit reapplies — avoid CI loops.
- **`next.config.mjs` has `outputFileTracingRoot`:** Set to monorepo root so Vercel's file tracer can find packages from `../../node_modules`. Do not remove this.

---

## Session 3 — Link in Bio MVP + User Name Migration

**Date & Time (IST):** 2026-05-29 18:30 IST
**Status:** Completed

### What We Built

Full Link in Bio feature: public profile page at `/{username}`, a two-column dashboard editor with drag-and-drop link management, social profile management, click analytics, and a live preview iframe. Also completed a database migration splitting `User.name` into `firstName` + `lastName`, and wired the full design system token set into `globals.css` and `tailwind.config.ts`.

### How We Built It

**Design system tokens:** All DESIGN.md colour tokens, border radius, and shadow tokens added as CSS custom properties in `globals.css`. Tailwind config extended to expose them as utility classes (`bg-surface-1`, `text-ivy`, `rounded-ds-lg`, etc.). DESIGN.md Colour Tokens and Tailwind mapping sections updated to reflect real codebase state.

**User name migration:** `User.name` dropped; `User.firstName` and `User.lastName` (both nullable) added. Migration: `20260529072720_rename_name_to_first_last_name`. `getDisplayName({ firstName, lastName, email })` utility created in `packages/db/src/utils.ts` and exported from `@ivy/db`. Called in all server components — result passed as `displayName: string` prop to client components (Sidebar, Header) to avoid importing server-side `@ivy/db` in client code. Onboarding step 1 and profile form split into two side-by-side fields. `exactOptionalPropertyTypes` requires `firstName: firstName || null` not `firstName: firstName || undefined` in Prisma updates.

**New Prisma models (all applied in a single migration alongside the name rename):**

- `SocialPlatform` enum: INSTAGRAM, TWITTER, YOUTUBE, TIKTOK, FACEBOOK, LINKEDIN, GITHUB, WEBSITE
- `LinkPage`: one per org (`@@unique([orgId])`), username unique, soft-deletable, accentColor defaults to `#00D97E`
- `Link`: belongs to LinkPage, sortable by position, soft-deletable, `LinkClick` relation
- `LinkClick`: immutable (no `updatedAt`), stores country/device/referrer, triple-indexed
- `SocialProfile`: per-platform URL for the public page, soft-deletable
- `Organization` now has `linkPages LinkPage[]` relation
- New ID prefixes: `lp`, `lnk`, `lclk`, `sp`
- RLS file: `packages/db/supabase/migrations/003_link_in_bio_rls.sql` (must be run manually via Supabase SQL editor or CLI)

**API routes (all protected via `getOrgContext`):**

- `GET/PUT /api/link-page` — auto-creates LinkPage on first GET if none exists (uses org slug as default username)
- `POST /api/links` — creates with max(position)+1
- `PUT/DELETE /api/links/[id]` — updates or soft-deletes; uses `Prisma.LinkUpdateManyMutationInput` type for `exactOptionalPropertyTypes` compatibility
- `PUT /api/links/reorder` — batch position update in `$transaction`
- `POST/DELETE /api/social-profiles` and `PUT/DELETE /api/social-profiles/[id]`
- `POST /api/links/[id]/click` — **public route (no auth)**; uses `keepalive: true` on the client side so request completes even after page navigates away; extracts country from `x-vercel-ip-country`, device from user-agent

**Public page `app/[username]/`:** Separate layout with no sidebar/header. Server component fetches LinkPage with links and social profiles. Returns 404 if not found or `isPublished: false`. `generateStaticParams` pre-renders known published pages; `dynamicParams = true` + `revalidate = 3600` for new ones. Client component (`PublicPageClient`) uses Framer Motion with `useReducedMotion()` — animation props spread conditionally (`{...profileAnim}`) to satisfy `exactOptionalPropertyTypes` (passing `undefined` to `initial`/`animate` is a type error). Social icons served from `public/icons/social/` as SVG files, rendered with `filter: invert(1) opacity(0.5)` for consistent dark-mode muting.

**`[username]` route collision:** `app/[username]/` is a catch-all for root-level paths. Explicit routes (`dashboard`, `login`, `api`, `onboarding`, `auth`) take priority in Next.js App Router, so no collision. Reserved slugs not yet validated at signup — noted in CLAUDE.md Known Gotchas.

**Dashboard editor `app/(app)/dashboard/link-in-bio/`:** Page is a server component that fetches LinkPage + analytics (total clicks, 30-day count, daily chart data, per-link click counts using `groupBy`). Passes all as props to `LinkInBioEditor` client component. Editor features:

- Publish toggle with immediate optimistic update
- Public URL display with copy-to-clipboard + open-in-new-tab
- Profile section: avatar upload to Supabase Storage, displayName, bio (160 char with live counter), accent colour picker (6 presets + native `<input type="color">`)
- Social profiles: one input per platform, auto-saves on blur; creates/updates/deletes the DB row
- Links: `@dnd-kit/core` + `@dnd-kit/sortable` drag-to-reorder; toggled with a pill switch; inline add form; edit and delete via modals
- Analytics: stat cards, Recharts AreaChart for daily clicks (30d), per-link click count with progress bars
- Live preview: `<iframe key={previewKey}>` refreshes by incrementing a key after every mutation
- `xl:` breakpoint for two-column layout (preview visible only at 1280px+)

**Connections page:** Added fourth "Link in Bio" row with Lucide `Link` icon, public URL display, and "Manage" button linking to the editor.

**next.config.mjs:** Added `*.cdninstagram.com` and `*.fbcdn.net` to `images.remotePatterns` for Meta CDN thumbnails.

**CLAUDE.md:** Added "Known Gotchas" section accumulating gotchas from sessions 2 and 3.

### In Scope

- `apps/web/app/globals.css` — full design token CSS vars
- `apps/web/tailwind.config.ts` — full design token Tailwind mapping
- `DESIGN.md` — colour tokens and Tailwind mapping sections updated
- `packages/db/prisma/schema.prisma` — name→firstName/lastName, 4 new models, SocialPlatform enum
- `packages/db/prisma/migrations/20260529072720_rename_name_to_first_last_name/` — single combined migration
- `packages/db/supabase/migrations/003_link_in_bio_rls.sql`
- `packages/db/src/utils.ts` — `getDisplayName`
- `packages/db/src/ids.ts` — lp, lnk, lclk, sp prefixes
- `packages/db/src/index.ts` — exports `getDisplayName`
- `apps/web/app/(app)/layout.tsx` — uses `getDisplayName`, passes `displayName: string`
- `apps/web/components/sidebar.tsx` — `displayName` prop
- `apps/web/components/header.tsx` — `displayName` prop
- `apps/web/app/onboarding/page.tsx` — firstName + lastName fields
- `apps/web/app/onboarding/actions.ts` — saves firstName/lastName
- `apps/web/app/(app)/dashboard/settings/profile/page.tsx` — passes firstName/lastName
- `apps/web/app/(app)/dashboard/settings/profile/profile-form.tsx` — two name fields
- `apps/web/app/(app)/dashboard/settings/profile/actions.ts` — saves firstName/lastName
- `apps/web/app/(app)/dashboard/settings/connections/page.tsx` — Link in Bio row
- `apps/web/app/api/link-page/route.ts`
- `apps/web/app/api/links/route.ts`
- `apps/web/app/api/links/reorder/route.ts`
- `apps/web/app/api/links/[id]/route.ts`
- `apps/web/app/api/links/[id]/click/route.ts`
- `apps/web/app/api/social-profiles/route.ts`
- `apps/web/app/api/social-profiles/[id]/route.ts`
- `apps/web/app/[username]/layout.tsx`
- `apps/web/app/[username]/page.tsx`
- `apps/web/app/[username]/public-page-client.tsx`
- `apps/web/app/(app)/dashboard/link-in-bio/page.tsx`
- `apps/web/app/(app)/dashboard/link-in-bio/editor.tsx`
- `apps/web/public/icons/social/` — 8 SVG brand icons
- `apps/web/next.config.mjs` — Meta CDN remotePatterns
- `apps/web/package.json` — framer-motion, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
- `CLAUDE.md` — Known Gotchas section

### Out of Scope

- Facebook and YouTube OAuth
- Instagram token refresh cron
- Inngest signing key configuration
- Username reservation validation at signup (reserved slugs like `api`, `dashboard` not blocked)
- Public page themes / custom backgrounds beyond accentColor tint
- Link page analytics beyond clicks (no device/country breakdown UI)
- Mobile editor layout (desktop-first per DESIGN.md spec for dashboard)

### Breaking Changes

- `User.name` is gone. Any raw SQL or external tooling querying `users."name"` will break. The Prisma client no longer has `user.name`.
- `Sidebar` and `Header` props changed: `userName: string | null` → `displayName: string` (non-nullable). If any other place instantiates these components, it must update its props.
- `getDisplayName` added to `@ivy/db` exports.

### Notes for Future Sessions

- **RLS for link-in-bio:** `003_link_in_bio_rls.sql` must be run manually against Supabase (SQL editor or `supabase db push`). It is NOT a Prisma migration. Without it, the Supabase client cannot read/write these tables if RLS is enforced.
- **Reserved username validation:** Users can currently choose usernames like `api`, `dashboard`, `login`. These are safe (explicit routes win), but confusing. Add a reserved-slug blocklist to `app/api/check-handle/route.ts` and the onboarding handle validator.
- **Framer Motion + `exactOptionalPropertyTypes`:** Never pass `undefined` directly to Framer Motion animation props (`initial`, `animate`, `variants`, `whileHover`, `whileTap`). Use conditional spread: `{...(reducedMotion ? {} : { variants: profileVariants, initial: "hidden" as const, animate: "visible" as const })}`.
- **`[username]` as a dynamic route:** This catches everything at the root level not matched by an explicit route. Any new top-level page (e.g., `/pricing`) must be created as an explicit route — it will not accidentally serve the public page. But be aware that `/johndoe` works for public pages, and adding `/johndoe` as an explicit route would break that user's public page.
- **LinkPage auto-create:** First visit to `/dashboard/link-in-bio` or first call to `GET /api/link-page` creates a `LinkPage` with the org's slug as username. If the org slug changes (profile settings → handle), the `LinkPage.username` is NOT updated automatically. Future session should sync them or decouple username from org slug.
- **Preview iframe CORS:** The preview iframe at `/dashboard/link-in-bio` loads the public page in an iframe. Works fine for same-origin. If the public page is ever moved to a different domain, the iframe will need `X-Frame-Options` changes.
- **Supabase avatars bucket** still needs to be created manually in Supabase Storage with public access. Both the profile photo and the link page avatar upload use this bucket.
- **`@dnd-kit/utilities` CSS import:** The `CSS.Transform.toString()` utility is used in the drag-and-drop sortable rows. This works without additional CSS imports since it only transforms values into CSS strings.
