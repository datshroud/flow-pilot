# ADR-016: Redis + BullMQ for Asynchronous Work, Outbox for Durability

- Status: Accepted
- Date: 2026-09-17
- Supersedes: ADR-010

## Context

ADR-010 chose Apache Kafka because one business fact in the FlowPilot
workflow topic fanned out to several independent consumer domains —
workflow, integration, audit read models — each with its own retention
and replay needs. That topology retired with the topic.

The helpdesk's asynchronous work is job-shaped, not fact-shaped: train a
model, score a batch of tickets, fire an SLA escalation, evaluate drift.
Each has exactly one consumer and no replay requirement. Kafka would be
a third stateful container justified by nothing the project can
demonstrate, and its operational surface would compete with model work
for the remaining budget.

The durability problem ADR-010 solved is still real. Writing a ticket to
PostgreSQL and enqueuing its scoring job are two systems; a crash
between them produces a ticket that is never scored.

## Decision

1. Kafka is removed from the architecture and from `docker-compose.yml`.
2. Redis + BullMQ carries all asynchronous work: model training, batch
   scoring, SLA timers and escalation, drift evaluation, notification
   retries.
3. Delivery is at-least-once. Every handler is idempotent, keyed by the
   business identifier in the payload.
4. Where a committed state change must reliably produce a job, the
   tickets service writes the domain row and an outbox row in one
   PostgreSQL transaction. A relay reads unpublished outbox rows,
   enqueues them and marks them published. The outbox lesson is kept;
   only the transport changed.
5. Retries use bounded exponential backoff with jitter. Poison jobs move
   to a dead-letter queue after the retry limit and are visible, not
   silently dropped.
6. The event envelope in `packages/contracts` stays. It now describes
   job payloads and audit records rather than broker messages, and keeps
   `eventId`, `occurredAt`, `tenantId`, `actor`, `correlationId` and
   `causationId` so a trace survives every hop.
7. If a later requirement demonstrates a genuine multi-consumer fan-out,
   reintroducing a broker requires a new ADR. Because producers already
   write to an outbox, that change is a relay swap, not a rewrite.

## Consequences

### Positive

- One fewer stateful container; Redis was already required.
- Scheduled and delayed work — the SLA timers this domain actually
  needs — is BullMQ's native strength and was awkward on Kafka.
- The outbox keeps the atomicity lesson and the migration path.

### Negative

- No replay and no event retention; a read model cannot be rebuilt from
  history, so derived state must be recomputable from the domain tables.
- Adding a second consumer to an existing job means changing the
  producer, which a broker would not have required.
- The project no longer demonstrates a log-based event backbone.

## Guardrails

- Job payloads carry identifiers only — never ticket text, never model
  artifacts, never secrets.
- No handler applies a side effect without an idempotency check.
- Redis is transport and scheduling infrastructure, never the source of
  truth for business or model state.
- A persisted row must not be reported as queued before enqueue succeeds.
- Workers support graceful shutdown and bounded processing time.
- Training jobs are cancellable and time-boxed.
- A failed or cancelled training job must never overwrite or unpublish
  the currently active model version.
