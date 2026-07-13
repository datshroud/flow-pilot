# ADR-008: Adopt Local-First and Privacy-First Data Handling

- Status: Accepted
- Date: 2026-07-13

## Context

Cognitive Guard processes source code, AI-assistance metadata and research
outcomes. These inputs may contain proprietary logic, personal file paths,
prompts, participant information or secrets.

Collecting more data than the MVP needs would increase privacy risk without
improving the central research question. External model calls also move data
outside the local environment and require explicit user awareness.

## Decision

The MVP will be local-first and privacy-first.

Services, PostgreSQL and Redis run locally by default. The system processes
only the selected artifact required for analysis, not the entire repository.

External model integration is disabled by default. Any external provider call
requires explicit configuration and visible consent. Raw prompts are not
stored by default, and source retention is bounded by configuration.

Research participants use pseudonymous identifiers. Research exports exclude
source code, raw prompts, secrets, personal paths and directly identifying
information.

Users can withdraw consent and request deletion of project data and derived
records through an explicit cross-domain workflow.

## Consequences

### Positive

- Sensitive code remains local in the default configuration.
- Data collection is easier to explain and audit.
- Research exports carry less re-identification risk.
- External provider use is an explicit user decision.
- Retention and deletion behavior can be tested.

### Negative

- Local services require Docker resources and user setup.
- Some LLM-assisted features are unavailable when providers are disabled.
- Deletion must be coordinated across both domain services.
- Strict data minimization limits later retrospective analysis.
- Privacy controls add implementation and testing work.

## Guardrails

- Do not keylog or collect content outside an explicitly selected workspace.
- Send only the artifact required for the current analysis.
- External providers must be disabled by default.
- Provider secrets belong in environment configuration or VS Code SecretStorage,
  never source control or logs.
- Logs must redact source code, prompts, tokens, secrets and PII.
- Raw prompt storage remains false by default.
- Source retention must be configurable and enforced by a cleanup workflow.
- Consent, withdrawal, export and deletion actions must be auditable.
- Research exports must be pseudonymized and contain no source code or personal
  paths.
- A change to collected data or retention requires a privacy and threat-model
  review.
