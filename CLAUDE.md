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
