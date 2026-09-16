# ADR-013: Authentication and Authorization Model

- Status: Accepted
- Date: 2026-07-24
- Note (2026-09-17): unchanged by the helpdesk pivot and already
  implemented. "The AI agent acts on behalf of users" now reads as: the
  worker and the ml service act asynchronously and must carry the same
  auditable tenant and actor context as a human request.

## Context

FlowPilot is multi-tenant. Requests cross the gateway into several
services, workers act asynchronously, and the AI agent acts on behalf of
users. Every hop must know who acts, in which tenant, with which
permissions — without shared sessions or shared databases.

## Decision

1. The identity service owns authentication: email/password with
   Argon2id, short-lived access tokens signed with an asymmetric key,
   refresh token rotation with family revocation.
2. Public keys are exposed via JWKS; the gateway verifies JWTs and
   propagates actor and tenant context downstream. Services trust that
   context only from authenticated internal callers.
3. Authorization is layered: RBAC roles for coarse capabilities, ABAC
   policies for scoping (department, ownership), field-level policies
   for sensitive fields, and action policies on task transitions.
4. Permission checks live in the application layer of the owning
   service; the gateway never makes business authorization decisions.
5. Permission decisions may be cached in Redis keyed by policyVersion;
   membership/role events bump the version to invalidate.
6. Every domain table carries a NOT NULL tenantId with composite
   indexes; repositories require a TenantContext — an unscoped
   findById must not exist.
7. The web app stores tokens in HttpOnly secure cookies, never
   localStorage.

## Consequences

### Positive

- Services verify tokens without calling identity on every request.
- Tenant isolation is enforced at repository, cache and event layers.
- Async and AI actors carry the same auditable context as humans.

### Negative

- Key rotation, JWKS caching and refresh rotation are non-trivial.
- Layered policies need a test matrix (role × scope × field × action).
- Caching authorization risks staleness; version bumping is mandatory.

## Guardrails

- No endpoint ships without an explicit permission declaration.
- Cross-tenant requests return 404/403 without leaking metadata.
- PostgreSQL RLS may be added for sensitive tables as defense-in-depth,
  never as a replacement for application checks.
- Security tests must cover IDOR and cross-tenant probes per service.
- No secret, token or password hash ever appears in logs or events.
