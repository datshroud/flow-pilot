# ADR-014: Polyglot Runtime — TypeScript Services, Python ML Service

- Status: Accepted
- Date: 2026-09-17
- Supersedes: ADR-001

## Context

On 2026-09-17 the project became FlowPilot Helpdesk Intelligence: a
multi-tenant helpdesk in which every ticket is enriched at intake by
machine-learning models, agents correct those predictions, and the
corrections feed retraining.

ADR-001 required TypeScript for all runtime code. Its reasoning — one
language for a solo developer, no duplicated contracts, one test
story — was sound for a topic where the hard part was domain logic.

Machine learning is now the hard part. Six learning tasks need TF-IDF
and SVD feature extraction, cross-validation, class-imbalance handling,
clustering and metric reporting. scikit-learn, pandas and numpy
implement all of this; the Node ecosystem does not have an equivalent
that is credible for coursework. Re-implementing cross-validation and
sparse matrix maths in TypeScript would consume the project budget and
produce worse models than a library call.

The learning goal for this project explicitly includes both a
TypeScript HTTP backend and a Python backend.

## Decision

Two runtimes with one boundary between them.

1. TypeScript owns all business behavior: HTTP, validation, persistence,
   authorization, orchestration, jobs. This is the gateway, identity,
   tickets and worker.
2. Python owns everything statistical: feature extraction, training,
   evaluation, inference, clustering. This is the ml service —
   FastAPI over scikit-learn, pandas and numpy.
3. The boundary is HTTP + JSON. Request and response shapes are declared
   once in `packages/contracts` as Zod schemas and mirrored as Pydantic
   models in the ml service. Contract tests on both sides assert the two
   descriptions agree.
4. The ml service holds no business database credential. It receives the
   text and features it needs in the request body, and returns
   predictions. Its own storage is model artifacts plus immutable
   training snapshots handed to it by the tickets service.
5. No business rule is written in Python. No statistical computation is
   written in TypeScript.
6. Feature extraction is written once, in Python, and is the same code
   path in the exploratory notebook, the training job and online
   inference.

## Consequences

### Positive

- Each problem is solved with the tool built for it.
- Model work can be explored in notebooks and promoted to production
  without a rewrite, because the pipeline object is the same.
- The ml service scales, restarts and is replaced independently of the
  business services.
- The project demonstrates two backend stacks and the integration
  between them, which a single-language project cannot.

### Negative

- Two toolchains, two dependency managers and two test runners in CI.
- Contract drift between Zod and Pydantic is a real failure mode and
  needs tests that would not exist in a single-language project.
- One more container to run locally.
- Every prediction pays JSON serialization and a network hop.

## Guardrails

- The ml service must never hold a credential for a business database.
- Every request and response crossing the boundary is validated against
  the shared contract on both sides, not just the caller's side.
- Python dependencies are pinned to exact versions; no unpinned installs.
- TypeScript must not compute TF-IDF, similarity, or any evaluation
  metric — if a number is statistical, Python produces it.
- Python must not decide who may see a ticket, or what a valid status
  transition is.
- Calls to the ml service are time-boxed. Ticket creation degrades to
  "not classified" when the ml service is slow or down; it must never
  fail because a model was unavailable.
- The ml service is stateless per request. Anything it must remember
  between requests is a versioned artifact on disk, not process memory.
