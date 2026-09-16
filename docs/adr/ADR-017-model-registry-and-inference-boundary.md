# ADR-017: Model Registry, Offline Training and Online Inference

- Status: Accepted
- Date: 2026-09-17
- Supersedes: ADR-012

## Context

ADR-012 governed an LLM agent that acted on users' behalf, with risk
tiers and human approval. That feature retired with the FlowPilot topic,
but its central concern did not: software that writes into the product
on its own must be governed, bounded and auditable.

A scikit-learn model raises the same question in a different shape. A
model that silently changes behavior between deploys cannot be audited.
A training run that cannot be reproduced cannot be defended in a report.
A prediction whose producing model is unknown cannot be evaluated after
the fact.

## Decision

1. **Training is offline; inference is online.** No HTTP request ever
   trains a model. Training runs as a BullMQ job (ADR-016).
2. **Every trained model is an immutable, versioned artifact.** The
   registry row records task, algorithm, hyperparameters, training-run
   id, dataset snapshot id, random seed, library versions, evaluation
   metrics, artifact checksum and status: `DRAFT`, `ACTIVE` or
   `ARCHIVED`.
3. **Exactly one ACTIVE version per task.** Promotion is an explicit,
   audited action taken by a human, never a side effect of a successful
   training run.
4. **A challenger must beat the champion** on a frozen holdout, by a
   declared margin on a declared primary metric, before promotion is
   offered. The comparison is stored with the promotion.
5. **Every prediction is logged**: ticket id, task, model version id,
   output, confidence and latency. A prediction that cannot name its
   model version is invalid and is not written.
6. **Inference degrades open.** If the ml service is unavailable, slow
   or returns an invalid response, ticket creation succeeds with no
   prediction. A missing suggestion is a small product loss; a failed
   ticket intake is an outage.
7. **Training snapshots are immutable and addressable.** A run
   references a snapshot id, never "the current table".
8. **Runs are reproducible.** Seeds are fixed and recorded; re-executing
   a recorded run must reproduce its metrics.

## Consequences

### Positive

- Any prediction in the system can be traced to the exact model, run,
  snapshot and seed that produced it.
- Model changes become reviewable events with evidence attached.
- The report can state measured numbers with the conditions that
  produced them, instead of a metric with no provenance.

### Negative

- Registry, snapshot and prediction-log tables are meaningful extra
  schema and code for a project whose models are small.
- Promotion friction means a better model sits unused until a human
  acts.
- Storing artifacts and snapshots consumes disk that must be managed.

## Guardrails

- Model artifacts and snapshots never enter Git; they live in a mounted
  volume and are referenced by checksum.
- No model is promoted without a stored evaluation on a holdout it never
  saw during training or tuning.
- The holdout split is drawn once per snapshot and reused by every
  algorithm; it is never re-drawn per experiment.
- Metrics are reported per class as well as macro-averaged, so a
  majority-class model is visibly bad rather than acceptably average.
- Hyperparameter search selects on validation folds only; the holdout is
  touched once, at the end.
- The training code path and the inference feature-extraction path are
  the same serialized pipeline object.
- No predicted value is written to a ticket without its prediction-log
  row in the same transaction.
- Confidence is calibrated or explicitly labelled uncalibrated; a raw
  `decision_function` score is never displayed as a probability.
