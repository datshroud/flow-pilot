# ADR-011: Hybrid JSONB Dynamic Records

- Status: Withdrawn by ADR-015
- Date: 2026-07-24

## Context

FlowPilot lets tenant admins define entities and fields at runtime.
Generating a SQL migration per admin action is operationally unsafe, but
classic EAV tables make every query a join festival, and storing whole
records as opaque blobs loses typing, indexing and constraints.

The platform still needs invariants the database can enforce: tenant
isolation, status transitions and optimistic concurrency.

## Decision

Dynamic records use a hybrid model in the platform service:

1. System fields are typed columns: id, tenantId, entityDefinitionId,
   schemaVersion, status, version, createdBy, createdAt, updatedAt.
2. Business fields live in a `data` JSONB column, validated at the
   application layer against a Zod schema generated from the entity's
   FieldDefinitions at that schemaVersion.
3. Fields that are frequently filtered or sorted get a GIN or expression
   index, or are promoted to a real column via a deliberate migration;
   promotion decisions are recorded per entity.
4. Records carry a version integer for optimistic concurrency; writes
   are conditional updates that return 409 on a stale version.
5. EntityDefinitions are versioned; records reference the schemaVersion
   they were written under and are migrated explicitly, never implicitly.

## Consequences

### Positive

- Admins add fields without migrations or downtime.
- System invariants stay in typed columns the database can enforce.
- Hot query paths keep real indexes instead of full JSONB scans.

### Negative

- Two validation layers (Zod + database) must stay in sync with the
  entity definition version.
- JSONB queries need discipline; a missed index shows up as a slow scan.
- Schema evolution of existing records is an explicit, testable chore.

## Guardrails

- tenantId, status and version are never stored inside `data`.
- No write path may skip Zod validation against the entity definition.
- Every list endpoint filters on typed columns first; JSONB predicates
  require a matching index or a documented exception.
- EXPLAIN ANALYZE runs on the top record queries before each release.
- Unknown fields are stripped, not stored (mass-assignment defense).
