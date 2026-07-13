# ADR-005: Use a Database per Domain Service

- Status: Accepted
- Date: 2026-07-13

## Context

Workspace and Intelligence have different data ownership, failure and
lifecycle requirements.

A shared database would allow convenient joins, but it would also let one
service bypass another service's validation and business rules. Shared tables,
foreign keys and migrations would tightly couple both domains.

Local development should remain simple and may use one PostgreSQL server.

## Decision

Workspace and Intelligence will each own a separate PostgreSQL database,
Prisma schema, migration history and database credential.

Workspace owns `cognitive_guard_workspace`.

Intelligence owns `cognitive_guard_intelligence`.

Both databases may run on the same PostgreSQL server or container during local
development. Physical co-location does not change ownership boundaries.

Cross-domain data will move through versioned events or authenticated internal
APIs. External references such as `projectId` and `artifactRef` are stored as
opaque identifiers without cross-database foreign keys.

## Consequences

### Positive

- Each service controls its own schema and migrations.
- Persistence changes cannot silently break another service.
- Database credentials enforce domain ownership.
- Services can evolve or recover independently.
- Failure boundaries remain visible during testing.

### Negative

- Cross-domain SQL joins are unavailable.
- Some identifiers and derived data must be duplicated.
- Cross-domain views require APIs, events or read models.
- The system must tolerate eventual consistency.
- Deletion and consent workflows require explicit coordination.

## Guardrails

- A service must never connect to another service's database.
- No cross-database joins, views or foreign keys are allowed.
- Prisma clients and repositories remain private to their owning service.
- Migrations are executed and versioned independently.
- Cross-domain references must not imply database-level ownership.
- Business transactions must not span both databases.
- Workspace uses a transactional outbox when committed data must produce an
  asynchronous event.
- Cross-domain deletion and consent withdrawal use an explicit API or event
  workflow.