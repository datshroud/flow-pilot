# Project HTTP Contract

Status: Draft
Date: 2026-07-21
Source: blueprint §11.2 (endpoint list), §10.1 (Project table), §9 (conventions)

The Gateway exposes these endpoints under `/v1`. Payloads are validated with
the Zod schemas in `@cognitive-guard/contracts`.

## Create a project

`POST /v1/projects` (owner: Workspace)

- Request body: `createProjectRequestSchema`
- Success: `201 Created` with body `projectResponseSchema`
- Validation failure: `400 Bad Request` with the shared error envelope
- Unknown fields are rejected (schema is strict)

## Read a project

`GET /v1/projects/:id` (owner: Workspace)

- Path parameter `id` must be a UUID
- Success: `200 OK` with body `projectResponseSchema`
- Not found: `404 Not Found` with the shared error envelope

## Conventions (blueprint §9, §11.1)

- Resource names are plural nouns; JSON bodies use camelCase.
- Timestamps are ISO 8601 UTC.
- `Content-Type: application/json` is required.
- The client may send `X-Request-Id`; the Gateway generates one if missing.
- Project creation is synchronous. It does not use the `202 Accepted`
  asynchronous flow that ADR-006 / §11.1 reserve for analysis operations.
- All error responses use the envelope from `errorEnvelopeSchema` (§9.1).
