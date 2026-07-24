# ADR-007: Capture Provenance Through a Controlled AI Panel

- Status: Superseded by ADR-012
- Date: 2026-07-13

## Context

Cognitive Guard needs reliable evidence about which code was produced with AI
assistance. Source code alone does not reveal its origin, and classifiers can
produce false positives and false negatives.

Inaccurate provenance would weaken both the Cognitive Debt score and the
validity of the research experiment.

The VS Code extension can directly observe code generated and inserted through
its own assistant workflow.

## Decision

The MVP will provide a Cognitive Guard AI panel through a single provider
adapter.

Code is marked `AI_GENERATED` only when it is inserted through the extension's
controlled insert command. The extension records the event identifier,
provider, optional model, inserted range, content hash, optional prompt hash
and timestamp.

Code pasted or created outside the controlled workflow is `UNKNOWN` unless the
user labels it manually. The system will not use a classifier to claim that
external code was AI-generated.

Raw prompts are not stored by default.

When code changes after insertion, provenance is reconciled using contribution
segments and content hashes. If the mapping can no longer be established
reliably, the provenance is marked stale or unknown rather than presented as
current fact.

## Consequences

### Positive

- Captured provenance has a precise and testable observation point.
- False attribution is reduced.
- Research claims can state exactly what the system measured.
- Provider details remain behind a replaceable adapter.
- Users retain visibility into when provenance is recorded.

### Negative

- AI assistance outside the Cognitive Guard panel is not captured automatically.
- Users must adopt the controlled insertion workflow for complete coverage.
- Range and contribution tracking become more complex after edits.
- The MVP cannot claim to detect all AI-generated code.

## Guardrails

- Only the controlled insert command may assign `AI_GENERATED` automatically.
- External paste and unobserved edits default to `UNKNOWN`.
- No AI-origin classifier is permitted in the MVP.
- Product and research reports must not claim universal AI-code detection.
- Raw prompts must remain disabled unless a later consented requirement is
  approved.
- Logs must not contain source code, prompts, API keys or full provider output.
- Provenance events must include an idempotent event identifier and content
  hash.
- Stale ranges must not be displayed as current provenance.
- Fixture tests must prove that each controlled insertion creates exactly one
  correctly ranged provenance event.
