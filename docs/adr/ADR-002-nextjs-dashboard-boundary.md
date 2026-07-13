# ADR-002: Keep Next.js as the Dashboard Layer

- Status: Accepted
- Date: 2026-07-13

## Context

Cognitive Guard needs a web dashboard for projects, debt history,
dependency graphs, probes and research outcomes.

Next.js can technically access a database from server components or route
handlers. However, direct database access would couple the dashboard to
service persistence models and bypass validation, authorization and data
ownership boundaries.

The dashboard and VS Code extension must observe the same domain behavior.

## Decision

Next.js will be used only as the web presentation layer.

The dashboard will access domain data through the typed API client and the
API Gateway. It will not access Workspace or Intelligence databases directly.

Domain validation, persistence and Cognitive Debt calculations remain inside
their owning services and pure algorithm packages.

## Consequences

### Positive

- Web and extension clients use the same API contracts.
- Database ownership remains inside each domain service.
- Persistence changes do not require rewriting dashboard data access.
- Validation, authorization and observability remain consistent.

### Negative

- Dashboard requests require an additional HTTP hop.
- Server-rendered pages depend on backend service availability.
- Loading, empty and error states must be implemented explicitly.
- API contracts must be designed before dashboard features.

## Guardrails

- `apps/web` must not import Prisma Client or service repositories.
- `apps/web` must not contain the Cognitive Debt formula.
- Domain requests must use `packages/api-client`.
- Request and response payloads must follow `packages/contracts`.
- Public requests use the `/v1` API exposed by the Gateway.
- Next.js route handlers must not become hidden domain services.