# ADR-004: Use Minimal Microservices

- Status: Accepted
- Date: 2026-07-13

## Context

Cognitive Guard must demonstrate real service boundaries, asynchronous work
and failure handling without allowing infrastructure complexity to dominate
the Cognitive Debt research contribution.

Splitting the system by individual entities would create excessive deployment,
networking, testing and observability overhead for a solo developer.

A service boundary is justified only when it has independent data ownership,
failure characteristics or scaling needs.

## Decision

The MVP will contain exactly two domain services:

1. Workspace Service owns projects, sessions, artifacts, code events,
   provenance, consent records and the transactional outbox.
2. Intelligence Service owns analyses, dependency graphs, debt snapshots,
   probes and experiment outcomes.

The Intelligence API and Analysis Worker are separate processes within the
same Intelligence domain.

The API Gateway is a stateless infrastructure component. It is not a third
domain service and owns no business data.

No service will be created for an individual entity or technical operation.

## Consequences

### Positive

- The project demonstrates genuine distributed-system boundaries.
- Workspace ingestion remains available while analysis work is delayed.
- Analysis workers can scale independently from HTTP APIs.
- Data ownership and domain responsibilities remain understandable.
- Operational scope stays manageable for a solo developer.

### Negative

- Cross-domain operations require API or event contracts.
- The system must handle eventual consistency and partial failure.
- Local development requires multiple processes and dependencies.
- Integration, queue and contract tests become mandatory.

## Guardrails

- Do not add another service without a new ADR and measurable justification.
- Services must not read each other's databases.
- Internal repositories and business logic must not be shared across domains.
- The Gateway must remain stateless and database-free.
- The Analysis Worker belongs to the Intelligence domain.
- Modules inside a service should remain modules until an independent
  data, failure or scaling boundary is demonstrated.
- If distributed infrastructure blocks the end-to-end flow beyond its
  timebox, the Gateway may be co-located with Workspace as the documented
  fallback without merging the two domain data models.
