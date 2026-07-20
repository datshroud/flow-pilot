# Implementation Status

Last updated: 2026-07-21

## Current milestone

M1 — Distributed skeleton

## Current brick

M1.2 — Workspace project endpoints

## Completed

- [x] Verified the Node.js, pnpm, Docker and Docker Compose toolchain.
- [x] Recorded ADR-001 through ADR-008.
- [x] Configured the pnpm workspace and pinned toolchain versions.
- [x] Added strict TypeScript and a buildable contracts package.
- [x] Configured Turborepo build, lint, typecheck, test and clean tasks.
- [x] Added repository formatting and line-ending standards.
- [x] Added typed ESLint rules with Prettier compatibility.
- [x] Added Vitest, V8 coverage and the first contracts smoke test.
- [x] Separated test typechecking from production build output.
- [x] Added Zod-backed health and public error contracts with unit tests.
- [x] Added local PostgreSQL and Redis infrastructure with health checks, isolated service database ownership and persistent named volumes.
- [x] Added buildable Express health skeletons for Gateway, Workspace and Intelligence with shared contracts and unit tests.
- [x] Added and verified GitHub Actions CI from a clean checkout.

- [x] Added strict Zod contracts for creating and reading projects, with unit tests.
- [x] Exported project contracts through the public entry point.
- [x] Documented the project HTTP contract in docs/api.

## In progress

- [ ] Set up Prisma and the Workspace database Project model.
- [ ] Implement POST /v1/projects and GET /v1/projects/:id in Workspace Service.
- [ ] Cover the endpoints with integration tests.

## Blockers

None.

## Pending decisions

None for M0.

## M0 exit gate

- [x] Monorepo installs from the lockfile.
- [x] Format, lint, typecheck, unit tests and build pass.
- [x] Gateway, Workspace and Intelligence health endpoints respond.
- [x] PostgreSQL and Redis containers are healthy.

## M1 exit gate

- [ ] A fake analysis event travels through the distributed flow end-to-end.
- [ ] Workspace and Intelligence persist data only in their own databases.
- [ ] Duplicate events do not create duplicate business results.
- [ ] Integration tests prove the main distributed flow.
