# Implementation Status

Last updated: 2026-07-24

## Project

FlowPilot — Event-driven multi-domain workflow platform with permission-aware AI Agents.
(Pivoted from the retired "cognitive-guard" topic on 2026-07-24.)

## Target architecture (solo, compressed 16-week track)

Six deployable services, started modular then split as boundaries prove out:

- api-gateway — stateless: auth, context propagation, SSE, response aggregation.
- identity — user, tenant, membership, role, policy.
- platform — metadata + case: entity/field/form definitions, dynamic records, cases, tasks.
- workflow — definition, version, instance, node execution, timers.
- ai — agent runs, plans, tool calls, approvals.
- integration — connectors, webhooks, notifications, audit events, read models.

## Current milestone

P1 — Platform core

## Current brick

P1.1 — To be planned

## Reused from the previous foundation (still valid)

- [x] pnpm workspace, Turborepo, strict TypeScript, ESLint, Prettier, Vitest.
- [x] GitHub Actions CI (format, lint, typecheck, test, build).
- [x] Zod health + public error contracts (error model matches FlowPilot section 16.5).
- [x] Express health skeleton (/health/live, /health/ready).
- [x] Local PostgreSQL + Redis via Docker Compose.

## To rework for FlowPilot (P0)

- [x] P0.2 Rewrite conflicting ADRs (004/006/007/008); add Kafka, outbox/inbox, JSONB, AI-guardrails, auth ADRs.
- [x] P0.3 Rename identity: package `flowpilot`, scope `@flowpilot/*`, DB names, README.
- [x] P0.4 Add Kafka (KRaft) to Docker Compose and provision the five FlowPilot service databases (MinIO/Mailpit deferred).
- [x] P0.5 Replace `project` contract with FlowPilot event envelope + first domain contracts.

## Pivot roadmap (compressed)

- P0 Pivot & re-foundation.
- P1 Platform core — identity, tenant/RBAC, metadata/form.
- P2 Distributed workflow — Kafka, outbox/inbox, workflow engine, case/task, BullMQ/SLA.
- P3 AI automation — tool registry, dry-run, approval, audit, evaluation.
- P4 Product & hardening — Next.js UX, 3 templates, observability, load/security tests, report.

## Blockers

None.
