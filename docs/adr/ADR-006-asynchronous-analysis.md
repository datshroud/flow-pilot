# ADR-006: Process Analysis Asynchronously

- Status: Accepted
- Date: 2026-07-13

## Context

AST parsing, dependency graph construction, debt calculation and optional LLM
calls have variable execution times and resource requirements.

Running this work inside the code-event HTTP request would increase latency,
cause timeouts and couple ingestion availability to analysis availability.

Acknowledged code events must not be lost if the worker or Redis temporarily
fails.

## Decision

Code-event ingestion and analysis execution will be separated.

The Workspace Service will persist the accepted code event and transactional
outbox record, then return `202 Accepted` with an `analysisId` and status URL.

An outbox publisher will enqueue a BullMQ job through Redis. The Analysis
Worker will consume the job, run analysis and persist results in the
Intelligence database.

Clients will retrieve analysis status and results through the Intelligence API.

Queue delivery is at least once. Consumers must therefore be idempotent.
Redis and BullMQ are transport infrastructure, not the permanent source of
business data.

## Consequences

### Positive

- HTTP ingestion remains responsive during expensive analysis.
- Worker failures do not require clients to keep connections open.
- Analysis workers can scale and restart independently.
- Retry and dead-letter behavior becomes explicit.
- Accepted events can survive temporary queue failures through the outbox.

### Negative

- Results are eventually consistent rather than immediately available.
- Clients must poll or otherwise refresh analysis status.
- Queue infrastructure adds operational and testing complexity.
- Duplicate delivery and partial failure must be handled deliberately.
- Status transitions require a versioned contract.

## Guardrails

- Ingestion must return `202`, not wait for analysis completion.
- A persisted event must not be reported as queued until publication succeeds.
- Status values must distinguish accepted, queued, running, completed and
  failed lifecycle stages before M1 implementation.
- Every job carries `eventId`, `analysisId` and `correlationId`.
- Consumers must handle duplicate delivery without duplicate business results.
- Processed-event recording and result persistence must be atomic.
- Retries use bounded exponential backoff with jitter.
- Poison jobs move to a dead-letter queue after the retry limit.
- Workers must support graceful shutdown and bounded processing time.
- Queue payloads must not contain an entire repository and must respect the
  configured source-size limit.
- Redis must not be treated as the source of truth for analysis results.
