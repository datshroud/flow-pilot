# Implementation Status

Last updated: 2026-09-17

## Project

FlowPilot — Helpdesk Intelligence Platform. A multi-tenant helpdesk whose
tickets are classified, prioritised, deduplicated and risk-scored by
machine learning at intake, with agent corrections feeding retraining.

Course context: Introduction to Machine Learning. The project must carry
a defensible ML contribution (six learning tasks, comparative evaluation,
reproducible runs) and a production-shaped backend (multi-tenancy, auth,
async jobs, model governance) in one system.

Topic history: cognitive-guard (retired 2026-07-24) → FlowPilot workflow
platform (retired 2026-09-17) → this.

## Target architecture

Four deployables plus one worker process (ADR-015):

- api-gateway — stateless: token verification, tenant/actor context, request
  IDs, rate limiting, timeouts. No database.
- identity — users, credentials, tenants, memberships, roles.
- tickets — tickets, comments, assignment, status lifecycle, SLA state,
  prediction log, label corrections, model registry metadata.
- worker — BullMQ consumer over the tickets domain: training triggers, batch
  scoring, SLA timers, drift evaluation.
- ml — Python/FastAPI: feature extraction, training, evaluation, inference.
  Owns model artifacts and training snapshots, no business database.

## Current milestone

M0 — Pivot & re-foundation

## Current brick

M0.5 — Ticket and prediction contracts in `packages/contracts`

## Carried over from the previous foundation (still valid, unchanged)

- [x] pnpm workspace, Turborepo, strict TypeScript, ESLint, Prettier, Vitest.
- [x] GitHub Actions CI (format, lint, typecheck, test, build).
- [x] Zod health, public error and event-envelope contracts.
- [x] Express health skeleton (`/health/live`, `/health/ready`) in every service.
- [x] Local PostgreSQL + Redis via Docker Compose.
- [x] **identity service, complete**: register, login, Argon2id password
      hashing, ES256 access tokens, JWKS endpoint, refresh-token rotation
      with family revocation, four-layer DDD structure, unit + integration
      tests. Untouched by this pivot.

## M0 — Pivot & re-foundation

- [x] M0.1 Rewrite the decision layer: supersede ADR-001/009/010/012, withdraw
      ADR-011, annotate ADR-002/003/005/013, add ADR-014 (polyglot),
      ADR-015 (service catalog), ADR-016 (BullMQ + outbox), ADR-017 (model
      registry), ADR-018 (human-in-the-loop + drift).
- [x] M0.2 Rewrite README and this document for the helpdesk topic.
- [x] M0.3 Rename `apps/platform` → `apps/tickets`; scaffold `apps/worker`
      and `services/ml` (FastAPI + pip-tools lockfiles + health routes).
- [x] M0.4 Remove Kafka from `docker-compose.yml` (ADR-016); replace the five
      FlowPilot databases with `flowpilot_identity` and `flowpilot_tickets`;
      rewrite `.env.example` for the new topology.
- [ ] M0.5 Extend `packages/contracts` with ticket and prediction schemas;
      widen the Zod ↔ Pydantic drift tests to cover them, including the
      `z.string().min(1)` constraints currently marked `xfail` in
      `services/ml/tests/test_contracts.py`.
- [x] M0.6 Add Python to CI: a parallel job running ruff, ruff format, mypy
      strict and pytest, plus a lockfile drift check against the `.in` files.

Verified green on 2026-09-17: `pnpm format:check`, `pnpm lint`,
`pnpm typecheck`, `pnpm test`, `pnpm build`; `ruff check`, `ruff format
--check`, `mypy` (strict), `pytest` (12 passed, 1 xfailed).

The package name stays `flowpilot` and the import scope stays
`@flowpilot/*`. Renaming would touch every import for no functional gain.

## Roadmap

- **M0 Pivot & re-foundation** — decisions, scaffolding, CI for two runtimes.
- **M1 Ticket core** — CRUD, tenant scoping, RBAC, comments, assignment,
  status lifecycle, SLA fields. Pure backend, no ML.
- **M2 ML service v1** — dataset ingest, EDA notebook, T1 category model,
  comparative evaluation of four algorithms, FastAPI `/predict`, first
  TypeScript ↔ Python integration test.
- **M3 Prediction pipeline** — predict on intake, prediction log, suggestion
  UI with confidence and model version, agent override → label correction
  (ADR-018), degrade-open behaviour under ml-service failure.
- **M4 Full model suite** — T2 priority, T3 resolution time, T4 duplicates,
  T5 topics, T6 escalation risk. Model registry, training as a BullMQ job,
  champion/challenger promotion (ADR-017).
- **M5 Quality & ops** — drift monitoring, correction-rate dashboard, batch
  rescoring, SLA escalation timers, observability, load and security tests.
- **M6 Report & demo** — notebooks, comparative metric tables per task,
  seeded demo tenant, demo script, written report.

## Open questions

- Dataset choice for T1/T2: 20 Newsgroups gives a clean multi-class baseline
  that runs today with no download; a real support corpus is more defensible
  but needs label cleaning. Decide before M2 starts.
- T3 resolution-time labels do not exist in public text corpora and may need
  to be synthesised from a documented generative process — if so, the report
  must state it plainly and not claim a real-world regression result.

## Blockers

None.
