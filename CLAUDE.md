# Ivy - Instagram Analytics SaaS — Claude Context

## Behavioral Guidelines

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

[Step] → verify: [check]
[Step] → verify: [check]
[Step] → verify: [check]

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

## E2E Test Requirements

Every feature session must include Playwright E2E tests covering the actual user
journey of the feature built. Tests must be written in the same session — not deferred.

### What must be tested

- The primary happy path: user performs the main action of the feature end to end
- Navigation: every new route stays on that route when visited by an authenticated user
- Empty states: page renders correctly when no data exists
- Auth protection: unauthenticated users are redirected to /login, not to dashboard

### The navigation test — required for every new dashboard route

Every new route added under /dashboard must have this test:

```typescript
test("stays on [route] when navigated to", async ({ page }) => {
  await loginAsTestUser(page);
  await page.goto("/dashboard/[route]");
  await page.waitForTimeout(2000);
  expect(page.url()).toContain("/dashboard/[route]");
});
```

This catches middleware redirect loops and auth errors before they reach main.

### CI gate

E2E tests run on every PR to main. A PR with failing E2E tests must not be merged.
If a test cannot be written because the feature requires external OAuth (Instagram etc),
document exactly why in the PR description and add a manual verification checklist instead.

## Hotfix Protocol

Hotfixes use branch naming fix/short-description.
Logged in SESSION_LOG.md as Hotfix X — not a session number.
Hotfixes that affect auth, schema, or RLS must be merged to main
before any in-progress feature session merges.

## Definition of Done — Non-negotiable

No session is complete until ALL of the following are true:

- pnpm build passes with zero TypeScript errors
- pnpm test passes (Vitest)
- pnpm e2e passes (Playwright) — including the navigation test for every new route
- Every new dashboard route stays on its URL for 2+ seconds when visited authenticated
- No console errors in the browser on any new page
- Tested manually in a real browser, not just in unit tests

---

## Tech Stack

- **Framework:** Next.js 14 App Router, TypeScript strict mode
- **Styling:** Tailwind CSS, shadcn/ui (New York style, dark mode via `class`), Framer Motion
- **Charts:** Recharts + Tremor
- **State:** Zustand (client), TanStack Query (server)
- **ORM:** Prisma
- **Database:** Supabase (Postgres + pgvector)
- **Cache / Queue:** Upstash Redis + BullMQ
- **Background Jobs:** Inngest
- **Auth:** Supabase Auth
- **Email:** Resend + React Email
- **Deployment:** Vercel
- **Monorepo:** Turborepo
- **Package Manager:** pnpm 9
- **Testing:** Vitest (unit), Playwright (E2E)

---

## GitHub Actions

Uses `pnpm/action-setup@v4` with `actions/setup-node@v4` (Node 20, pnpm 9). Secrets required: `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

### `ci.yml` — runs on every PR to `main`

1. Install deps: `pnpm install --frozen-lockfile`
2. Typecheck: `pnpm typecheck`
3. Lint: `pnpm lint`
4. Build: `pnpm build`

### `deploy.yml` — runs on push to `main` (two jobs)

**build job:**

1. Install deps: `pnpm install --frozen-lockfile`
2. Typecheck: `pnpm typecheck`
3. Lint: `pnpm lint`
4. Build: `pnpm build`
5. Upload `.vercel/output` as artifact

**deploy job** (needs: build):

1. Install deps: `pnpm install --frozen-lockfile`
2. Run `pnpm db:migrate` (applies pending Prisma migrations to Supabase Postgres)
3. Deploy to Vercel production:
   pnpm dlx vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
pnpm dlx vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}

---

## GH Actions Watch Protocol

After every push to main, Claude Code **must**:

1. Watch the Actions tab until the workflow completes. Do not ask for my permission to watch the actions.
2. If it fails, read the full error log.
3. Fix the root cause (not just the symptom).
4. Push the fix and watch again.
5. Once all GH Actions are green, **also check Vercel deploy status** using `vercel ls ivy-idm --scope mridushyamal-barmans-projects`. If the latest deployment shows `● Error`, fetch its logs with `vercel inspect <deployment-url> --scope mridushyamal-barmans-projects --logs` and fix the root cause.
6. Only report success once the deploy workflow is green AND the Vercel deployment status is not Error.

Use `gh run watch` or poll `gh run list --limit 1` to track GH Actions status. Use `vercel ls` to track Vercel deploy status.

---

## Branch & PR Strategy

- Session 1 is pushed directly to `main` to initialise the repo and verify CI.
- Every session from Session 2 onwards works on a feature branch: `feature/session-XX-feature-name`.
- Open a PR to `main` when the session is complete and the definition of done is met.
- CI must be green before merging. Never merge a red PR.
- Deploy action fires automatically on merge to `main`.

---

### Vercel Deploy Watch Protocol

After GH Actions production deploy completes successfully:

1. Run `vercel ls ivy-idm --scope mridushyamal-barmans-projects` — check latest deployment shows `● Ready`, not `● Error`.
2. If `● Error`, run `vercel inspect <deployment-url> --scope mridushyamal-barmans-projects --logs` and read the full build/runtime log.
3. Fix the root cause. Do NOT push another guess — read all relevant code and logs first, understand completely, then fix once.
4. Watch the new deploy cycle again from step 1.
5. After `● Ready`, manually test the affected pages in a browser (or via `browse` skill) before reporting success.

**Only report success once: GH Actions green AND Vercel `● Ready` AND the page loads without runtime errors in Vercel logs.**

---

## E2E Test Requirements

Every feature session must include Playwright E2E tests covering the actual user
journey of the feature built. Tests must be written in the same session — not deferred.

### What must be tested

- The primary happy path: user performs the main action of the feature end to end
- Navigation: every new route stays on that route when visited by an authenticated user
- Empty states: page renders correctly when no data exists
- Auth protection: unauthenticated users are redirected to /login, not to dashboard

### The navigation test — required for every new dashboard route

Every new route added under /dashboard must have this test:

```typescript
test("stays on [route] when navigated to", async ({ page }) => {
  await loginAsTestUser(page);
  await page.goto("/dashboard/[route]");
  await page.waitForTimeout(2000);
  expect(page.url()).toContain("/dashboard/[route]");
});
```

This catches middleware redirect loops and auth errors before they reach main.

### CI gate

E2E tests run on every PR to main. A PR with failing E2E tests must not be merged.
If a test cannot be written because the feature requires external OAuth (Instagram etc),
document exactly why in the PR description and add a manual verification checklist instead.

## Hotfix Protocol

Hotfixes use branch naming fix/short-description.
Logged in SESSION_LOG.md as Hotfix X — not a session number.
Hotfixes that affect auth, schema, or RLS must be merged to main
before any in-progress feature session merges.

## Definition of Done — Non-negotiable

No session is complete until ALL of the following are true:

- pnpm build passes with zero TypeScript errors
- pnpm test passes (Vitest)
- pnpm e2e passes (Playwright) — including the navigation test for every new route
- Every new dashboard route stays on its URL for 2+ seconds when visited authenticated
- No console errors in the browser on any new page
- Tested manually in a real browser, not just in unit tests

Three things this adds that matter most:
The navigation test template is the direct fix for what just happened. It's a two-line Playwright test that would have caught this bug in CI before it ever reached your browser.
The CI gate makes E2E tests a hard blocker on merges, not an optional nicety. Right now they're running but probably not blocking anything.
The Definition of Done replaces the soft checklist at the bottom of each session prompt with a non-negotiable gate. Claude Code cannot call a session complete until every item is checked — including manual browser verification. That last point matters because automated tests can pass while a real browser still shows a redirect loop.

---

## Known Gotchas

Accumulates across sessions. Read this before touching related code.

- **User model has `firstName` and `lastName` — never a single `name` field.** Always use `getDisplayName()` from `packages/db/src/utils.ts` when displaying a user's name anywhere in the UI. Call it in server components and pass the result as a `displayName: string` prop to client components — do NOT import `@ivy/db` in client components.
- **`createBrowserClient` everywhere for client-side Supabase auth** — never `createClient` from `@supabase/supabase-js`. The SSR client writes to cookies; the plain client uses localStorage. Middleware reads cookies only.
- **`@prisma/nextjs-monorepo-workaround-plugin` must stay in `next.config.mjs`** — removing it breaks Prisma engine resolution on Vercel due to `transpilePackages: ['@ivy/db']` bundling `@prisma/client`.
- **lucide-react brand icons removed** — use `components/social-icons.tsx` for Instagram/Facebook/YouTube. Do not import from lucide-react.
- **Prisma soft-delete middleware** — `db` client auto-injects `deletedAt: null` on all reads. Cannot query soft-deleted records via `db`. Use `supabaseAdmin` for admin operations needing deleted records.
- **`DATABASE_URL` vs `DIRECT_URL`** — `DATABASE_URL` is transaction pooler (port 6543, `?pgbouncer=true`); `DIRECT_URL` is session pooler (port 5432, no pgbouncer). Both must be set in GH Secrets and Vercel env. `DIRECT_URL` mandatory for migrations.
- **`[username]` catch-all route** — `app/[username]/page.tsx` catches all root-level paths not matched by explicit routes. Reserved paths (`api`, `dashboard`, `login`, `onboarding`, `auth`) are safe because explicit routes take priority in Next.js App Router. Validate usernames to exclude reserved slugs when implementing signup.

---

## Session Logging Protocol

After every session completes, Claude Code **must** append a new entry to `docs/SESSION_LOG.md` at the repo root. Create the file if it does not exist.

### Log entry format

```markdown
---

## Session [N] — [Feature Name]

**Date & Time (IST):** YYYY-MM-DD HH:MM IST
**Status:** Completed / Partially Completed / Blocked

### What We Built

A concise description of the feature or infrastructure delivered in this session.

### How We Built It

Key technical decisions, libraries used, patterns followed, and why. Enough detail
that a new engineer can understand the approach without reading the code.

### In Scope

- Everything that was planned and delivered in this session

### Out of Scope

- Anything explicitly deferred to a future session
- Anything that came up but was intentionally not addressed

### Breaking Changes

- Any changes that affect existing functionality, APIs, schema, or environment variables
- Write NONE if there are none

### Notes for Future Sessions

- Anything the next session must know before starting
- Known technical debt introduced and why
- Gotchas, edge cases, or unresolved decisions that need attention
- Environment variables added — list each one and what it does
```

### Rules

- Always use IST for timestamps. Convert from UTC using UTC+5:30.
- Be specific in "How We Built It" — vague entries are useless. Name the files created, the patterns used, the decisions made.
- "Notes for Future Sessions" is the most important section. Never leave it empty. If there is truly nothing to note, write why.
- Never edit a previous session's entry. The log is append-only.
- Commit the updated `SESSION_LOG.md` as part of the session's final commit with message `docs: log session [N]`.
