# ADR-003: Use Express at the HTTP Boundary

- Status: Accepted
- Date: 2026-07-13
- Note (2026-09-17): the decision holds unchanged. The named services are
  now those in ADR-015; the layering rules apply to the tickets service
  as written. The ml service is FastAPI, not Express, and is governed by
  ADR-014 — but its handlers are held to the same rule: the HTTP layer
  adapts, it does not compute.

## Context

Cognitive Guard requires an API Gateway and HTTP APIs for the Workspace and
Intelligence domains.

The project needs explicit control over routing, middleware, validation,
timeouts, error handling and observability. Business use cases must remain
testable without starting an HTTP server or constructing Express objects.

## Decision

Express will be used as the HTTP framework for the API Gateway, Workspace
Service and Intelligence API.

Express is limited to the HTTP adapter layer:

1. Routes select middleware and controllers.
2. Middleware handles cross-cutting HTTP concerns.
3. Controllers translate validated HTTP input into service calls.
4. Services implement business use cases without Express types.
5. Repositories own Prisma queries and persistence mapping.

The API Gateway handles routing, request IDs, authentication, rate limiting
and timeouts. It has no database and contains no domain business logic.

Each HTTP application separates `app.ts` from `server.ts` so that tests can
exercise the app without binding a network port.

## Consequences

### Positive

- HTTP behavior remains explicit and easy to inspect.
- Business services can be unit tested without Express.
- Controllers, services and repositories have clear responsibilities.
- Gateway policies can be tested independently from domain behavior.

### Negative

- Validation, errors and API documentation require explicit configuration.
- The layered structure creates more files than a simple route-only API.
- Developers must prevent convenience shortcuts across layer boundaries.
- Shared middleware must remain infrastructure-focused, not domain-focused.

## Guardrails

- Business services must not accept Express `Request` or `Response`.
- Controllers must not query Prisma directly.
- Repositories must not format HTTP responses.
- The Gateway must not own a database.
- Every external boundary must validate input with Zod.
- Errors must use the shared error envelope.
- Request and correlation identifiers must propagate through logs and calls.
- Health endpoints must separate liveness from readiness.
