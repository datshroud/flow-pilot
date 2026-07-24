# ADR-009: FlowPilot Service Catalog

- Status: Accepted
- Date: 2026-07-24
- Supersedes: ADR-004

## Context

On 2026-07-24 the thesis pivoted from Cognitive Guard to FlowPilot, an
event-driven multi-domain workflow platform with permission-aware AI
Agents. ADR-004's "exactly two domain services" boundary was designed
around the retired cognitive-debt domain and no longer fits.

FlowPilot's reference architecture describes eight services. For a solo
developer on the compressed 16-week track, eight deployables would create
empty shells and operational overhead without demonstrating anything.

## Decision

The target is six deployable services; development starts as a modular
monolith and services are split only when their data ownership is real:

1. api-gateway — stateless: token verification, tenant context
   propagation, SSE streaming, response aggregation. No business data.
2. identity — users, credentials, tenants, memberships, roles, policies.
3. platform — metadata + case combined: entity/field/form/view
   definitions, dynamic records, cases, tasks, comments, attachments.
4. workflow — workflow definitions, immutable published versions,
   instances, node executions, timers.
5. ai — conversations, agent runs, plans, tool calls, approval requests.
6. integration — connectors, webhook subscriptions, deliveries,
   notifications, plus audit events and analytics read models.

platform and integration are deliberate merges of the reference
architecture's metadata+case and integration+audit pairs. Module
boundaries and event contracts inside them stay split-ready.

## Consequences

### Positive

- Real distributed boundaries without eight half-empty deployables.
- Each service owns its data, migrations and failure profile.
- Later splits (case out of platform, audit out of integration) need no
  contract changes, only deployment changes.

### Negative

- platform is the largest service and risks becoming a monolith-in-hiding;
  its internal module boundaries need active policing.
- Merged services blur the reference document's topology; the report must
  explain the mapping.

## Guardrails

- No new service without a new ADR and a demonstrated data/failure/scaling
  boundary.
- Services never read each other's databases (ADR-005 still applies).
- Inside platform and integration, modules keep separate Prisma schema
  areas and communicate through application-layer interfaces, so a future
  split is mechanical.
- The gateway stays stateless and database-free (unchanged from ADR-004).
