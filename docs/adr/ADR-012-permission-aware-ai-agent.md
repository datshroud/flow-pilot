# ADR-012: Permission-aware AI Agent with Risk Tiers and Human Approval

- Status: Accepted
- Date: 2026-07-24
- Supersedes: ADR-007, ADR-008

## Context

ADR-007 (controlled provenance capture) and ADR-008 (local-first, external
providers disabled) governed the retired cognitive-debt domain. FlowPilot
inverts the premise: an external-LLM-backed agent is a core feature that
creates entities, workflows and cases on behalf of users.

That creates a new risk surface: unauthorized actions, prompt injection,
argument tampering between preview and execution, and runaway cost. The
privacy discipline from ADR-008 remains valuable and is carried forward.

## Decision

1. The agent is a special client of the business APIs. It never bypasses
   permissions, transactions or application services, and it holds no
   database credentials.
2. Every capability is a registered tool with a Zod input schema, a
   version, requiredPermissions and a risk tier:
   - R0 Read: auto-run, permission-filtered.
   - R1 Draft: auto-run, undoable.
   - R2 Operational: auto-run when the user holds the permission.
   - R3 High impact (publish, bulk, external send): explicit human
     approval required, bound to a hash of the exact arguments.
   - R4 Prohibited (grant roles, bypass permissions, raw SQL/shell):
     never exposed as a tool; attempts are rejected and audited.
3. Write tools support dry-run/preview; the user sees a diff before
   anything high-impact executes.
4. Runs are bounded: max steps, max tool calls, token budget, timeout
   and cancellation.
5. tenantId and actor come from the verified token context, never from
   tool arguments. Record content is untrusted data, never instructions.
6. The LLM provider sits behind an adapter; switching providers must not
   touch domain tools.
7. Carried forward from ADR-008: logs redact prompts, source, secrets
   and PII; raw prompts are not stored by default; provider secrets live
   in environment configuration only.

## Consequences

### Positive

- The agent's blast radius is bounded and testable per tier.
- Approval binds to exact arguments, closing the swap-after-preview hole.
- Audit can attribute every change to USER, AGENT or SYSTEM.

### Negative

- Every capability costs a tool contract, policy wiring and tests.
- Approval flows add product friction and implementation work.
- External provider dependency needs mocking for tests and demos.

## Guardrails

- No tool may execute without passing Zod validation and a permission
  check; domain APIs re-validate regardless.
- An approval is single-use and invalid if the arguments hash changes.
- The agent role can never grant roles or change permissions.
- Every ToolCall stores inputs hash, outcome, cost and correlationId.
- An evaluation dataset (including permission-attack prompts) runs
  before each release; unauthorized executed actions must be zero.
