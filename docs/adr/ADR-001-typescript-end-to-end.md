# ADR-001: Use TypeScript End-to-End

- Status: Accepted
- Date: 2026-07-13

## Context

Cognitive Guard includes a Next.js dashboard, a VS Code extension,
Express APIs, an asynchronous analysis worker and shared algorithm packages.

The project is developed by one person. Using multiple application languages
would increase context switching, duplicate data contracts and complicate
testing and deployment.

## Decision

All application and runtime code in the MVP will use TypeScript.

This applies to:

- Next.js dashboard.
- VS Code extension.
- API Gateway.
- Workspace Service.
- Intelligence API and Analysis Worker.
- Shared contracts and algorithm packages.

Configuration files and technology-specific schemas, such as Prisma schema
and Docker Compose, may use their required formats.

Public API and event contracts will be shared through validated schemas.
Service repositories and internal business logic will not be shared.

## Consequences

### Positive

- One type system and toolchain across the repository.
- API and event contracts can be reused safely.
- Less context switching for a solo developer.
- Static analysis and debt algorithms can run in the same ecosystem.

### Negative

- Advanced statistical analysis may be less convenient than in Python.
- Node.js worker isolation and timeouts must be handled carefully.
- TypeScript types alone do not validate data received at runtime.

## Guardrails

- TypeScript strict mode is required.
- External input must be validated with Zod.
- Unexplained `any` and arbitrary `@ts-ignore` are not allowed.
- Research statistics may be performed offline after anonymized data export,
  without adding a Python service to the MVP.
