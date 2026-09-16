# ADR-010: Kafka Event Backbone with Outbox/Inbox

- Status: Superseded by ADR-016
- Date: 2026-07-24
- Supersedes: ADR-006

## Context

ADR-006 routed all asynchronous work through Redis + BullMQ for the
retired analysis domain. FlowPilot is event-driven: one business fact
(case created, task completed, workflow published) fans out to several
independent consumers (workflow, integration, audit read models), must
survive consumer downtime and must be replayable.

A job queue models "work to do once"; it does not model "a fact that
happened" with multiple independent readers and retention. These are
different problems and need different tools.

Writing state to PostgreSQL and publishing to a broker are two systems;
without a pattern for atomicity, a crash between the two writes produces
state without events or events without state.

## Decision

1. Apache Kafka (KRaft, single broker in dev) is the backbone for domain
   events. Topics are per-producer-domain, versioned:
   `identity.events.v1`, `platform.events.v1`, `workflow.events.v1`,
   `agent.events.v1`, `integration.commands.v1`, plus `*.dlq.v1`.
2. Partition key is `tenantId:aggregateId`, so one aggregate's events
   stay ordered; no ordering is assumed across aggregates.
3. Every producing service uses the transactional outbox: domain state
   and the outbox row commit in one PostgreSQL transaction; a relay
   publishes to Kafka and marks rows published.
4. Delivery is at-least-once. Every consumer keeps an inbox table keyed
   by unique eventId, written in the same transaction as its side
   effects; duplicates are silently dropped.
5. Every event uses the standard envelope: eventId (ULID), eventType,
   eventVersion, occurredAt, producer, tenantId, actor, correlationId,
   causationId, aggregate {type,id,version}, data, metadata.
6. Poison messages go to the matching `*.dlq.v1` topic after bounded
   retries with exponential backoff and jitter.
7. Redis + BullMQ remain for delayed and scheduled work (SLA timers,
   reminders, notification retries) — unchanged from ADR-006's job
   mechanics, narrowed to that role.

## Consequences

### Positive

- New consumers (audit, analytics, notifications) attach without
  touching producers.
- Events are durable and replayable; read models can be rebuilt.
- Exactly-once _effects_ are achieved at the database layer without
  pretending the transport is exactly-once.

### Negative

- One more stateful piece of infrastructure to run and monitor.
- Eventual consistency: read models lag writes; tests must accept this.
- Outbox relay and inbox tables are extra moving parts every producing
  and consuming service must implement.

## Guardrails

- No service publishes to Kafka outside the outbox path.
- No consumer applies a side effect without an inbox uniqueness check.
- Never claim end-to-end exactly-once; consumers must stay idempotent.
- Kafka is not used for request/response; synchronous needs use REST
  through the gateway.
- BullMQ payloads carry identifiers only, never large or sensitive data.
- Breaking event changes create a new eventVersion or topic version;
  additive changes must not break consumers.
