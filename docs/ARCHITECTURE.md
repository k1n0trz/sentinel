# Sentinel Architecture

Sentinel uses a pnpm monorepo organized for SaaS growth.

## Workspace

- `apps/web`: Next.js dashboard and scan console
- `apps/api`: Fastify API and scanner orchestration
- `packages/shared`: shared Zod validators and TypeScript types
- `packages/eslint-config`: shared lint configuration
- `prisma`: database schema
- `docs`: product and technical documentation
- `docker`: deployment-oriented Dockerfiles

## Backend

Fastify was selected for a clean, low-overhead API with explicit modular boundaries. The initial API exposes:

- `GET /health`
- `POST /scans/free`
- `GET /scans/:id`
- `GET /reports/:scanId`

Scanner services are kept interchangeable:

- Security headers scanner
- SSL scanner
- DNS scanner
- Scoring service

## Data Model

The Prisma schema prepares the SaaS model:

- User
- Project
- Domain
- Scan
- Finding
- Report
- Alert

The first implementation stores scans in memory for fast MVP iteration. Prisma is already modeled for phase 2 persistence.

## Jobs

Redis and BullMQ are included for future recurring scan jobs and monitoring workflows.

## AI

AI analysis should be introduced through a provider abstraction so the product is not coupled to a single model vendor.

