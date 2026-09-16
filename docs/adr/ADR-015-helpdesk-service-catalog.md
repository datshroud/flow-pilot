# ADR-015: Helpdesk Intelligence Service Catalog

- Status: Accepted
- Date: 2026-09-17
- Supersedes: ADR-009
- Withdraws: ADR-011

## Context

ADR-009 catalogued six services for the retired FlowPilot workflow
topic: gateway, identity, platform, workflow, ai and integration. Four
of those existed to serve requirements that left with that topic — a
runtime-configurable metadata engine, a versioned workflow engine, an
LLM agent and a connector framework.

The helpdesk topic has one business domain with a small, known entity
set: tickets, comments, assignments, predictions, corrections and model
versions. Six services over that domain would recreate the empty-shell
problem ADR-009 was itself written to avoid.

ADR-011's hybrid JSONB dynamic-record model existed so tenant admins
could define entities at runtime. The helpdesk has no such requirement.

## Decision

Four deployables and one additional process:

1. **api-gateway** (TypeScript) — stateless edge: token verification,
   tenant and actor context propagation, request IDs, rate limiting,
   timeouts. No business data, no database.
2. **identity** (TypeScript) — users, credentials, tenants, memberships,
   roles. Already built; unchanged by this ADR.
3. **tickets** (TypeScript) — the business domain: tickets, comments,
   assignment, status lifecycle, SLA state, the prediction log, label
   corrections and model-version metadata.
4. **ml** (Python) — training and inference, owner of model artifacts
   and training snapshots. No business database (ADR-014).
5. **worker** (TypeScript, BullMQ) — a second process over the tickets
   domain, not a second domain. It shares the tickets database and
   Prisma schema, and runs training triggers, batch scoring, SLA timers
   and drift evaluation. It has no HTTP surface beyond health.

`apps/platform` is renamed `apps/tickets`. ADR-011 is withdrawn: ticket
fields are a typed, migrated set. If per-tenant custom fields are needed
later, they arrive as a bounded JSONB column with a new ADR, not as a
runtime entity engine.

## Consequences

### Positive

- Every service has real content on day one.
- The TypeScript/Python split is the one boundary that genuinely earns
  a process separation, and it is visible in the topology.
- Removing the metadata engine removes the project's largest source of
  accidental complexity, freeing budget for model quality.

### Negative

- `tickets` is the only business service, so the project demonstrates
  fewer cross-service business flows than ADR-009 promised.
- The gateway in front of two backends is thin; its value is
  cross-cutting policy, not routing complexity.

## Guardrails

- No new service without a new ADR and a demonstrated data, failure or
  scaling boundary.
- Services never read each other's databases (ADR-005 still applies).
- The ml service never reads a business database (ADR-014).
- The worker shares the tickets database and Prisma schema but not its
  HTTP layer; domain logic lives in the tickets application layer and is
  imported, never duplicated into the worker.
- The gateway stays stateless and database-free.
- Inside `tickets`, the ticket, prediction and model-registry modules
  keep separate application-layer interfaces so a later split is
  mechanical.
