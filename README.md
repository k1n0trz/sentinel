# Sentinel

Sentinel is a defensive AI-ready cybersecurity agent for analyzing, testing, and monitoring websites, applications, and APIs before risks become incidents.

The MVP focuses on passive and low-impact checks: HTTP reachability, HTTPS, security headers, basic SSL certificate metadata, DNS resolution, scoring, and dashboard reporting.

## Authorized Use

Sentinel is designed for defensive security work on assets you own or are explicitly authorized to test. Deep scans must only run against verified domains. The public free scan is intentionally passive and low impact.

## Stack

- pnpm workspaces and Turbo
- Next.js, TypeScript, Tailwind CSS
- Fastify API in TypeScript
- Prisma, PostgreSQL
- Redis and BullMQ prepared for recurring jobs
- Playwright installed for later visual/sandbox checks
- ESLint, Prettier, Zod

## Local Setup

```bash
corepack enable
corepack prepare pnpm@9.15.4 --activate
pnpm install
cp .env.example .env
docker compose up -d
pnpm db:generate
pnpm db:migrate
pnpm dev
```

Web: http://localhost:3100

API: http://localhost:4100

## Commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm format:check
pnpm db:migrate
```

## Environment

See `.env.example` for required variables. Do not commit secrets.
If another local service already uses Postgres or Redis defaults, set `POSTGRES_PORT` or `REDIS_PORT` before running Docker Compose and adjust `DATABASE_URL` or `REDIS_URL` accordingly.

## Roadmap Status

- MVP foundation: in progress
- Passive scanner: initial implementation
- Verified domains and deep scans: planned
- AI analysis, visual sandbox, and continuous monitoring: planned
