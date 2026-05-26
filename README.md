# Ivy

Creator analytics and tools platform for understanding your audience and growing your presence.

## Prerequisites

- Node.js 20+
- pnpm 9+

## Getting Started

```bash
pnpm install
```

## Development

```bash
# Run web app
pnpm dev --filter web

# Run workers
pnpm dev --filter workers

# Run everything
pnpm dev
```

## Testing

```bash
# Unit tests (Vitest)
pnpm test

# E2E tests (Playwright)
pnpm e2e
```

## Monorepo Structure

```
ivy/
├── apps/
│   ├── web/          # Next.js 14 App Router (main application)
│   └── workers/      # Inngest background job workers
├── packages/
│   ├── db/           # Prisma schema + Supabase client
│   ├── ui/           # Shared shadcn/ui components
│   ├── types/        # Shared TypeScript types
│   └── config/       # Shared ESLint, Prettier, TypeScript configs
└── .github/
    ├── workflows/    # GitHub Actions
    └── dependabot.yml
```
