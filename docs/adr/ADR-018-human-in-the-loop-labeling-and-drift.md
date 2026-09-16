# ADR-018: Human-in-the-Loop Labeling and Drift Monitoring

- Status: Accepted
- Date: 2026-09-17

## Context

The helpdesk ships with models trained on a public dataset. No tenant's
real traffic matches that dataset's label distribution, vocabulary or
category balance. Launch accuracy is therefore the best the models will
ever be, unless the product captures ground truth from the people who
already produce it.

Agents are that source. When the model predicts the wrong category and
an agent changes it, the agent has just labelled a training example at
no extra cost. Without capturing that, the system has no way to improve
and no way to notice when it degrades.

Capturing it naively creates a worse problem. If an agent accepts a
suggestion because it was pre-filled rather than because it was right,
and that acceptance is recorded as a label, the model trains on its own
output and its errors become permanent.

## Decision

1. **Corrections are recorded.** When an agent changes a field the model
   predicted, the system writes a label correction: ticket id, task,
   predicted value, corrected value, model version, actor, timestamp.
2. **Acceptance and override are distinguished.** A field left at the
   predicted value is recorded as `ACCEPTED`; a changed field is
   `OVERRIDDEN`. They are never merged into one label set.
3. **Retraining is explicit.** Corrections are training data, but a
   snapshot is assembled deliberately, reviewed for volume and class
   balance, and only then used. Nothing retrains on a timer.
4. **Correction rate is the primary online metric**, per task and per
   model version, and is reported next to the offline metrics so the two
   can disagree visibly.
5. **Drift is monitored on two signals.** Input drift compares the
   recent vocabulary and feature distribution against the training
   snapshot. Output drift compares the predicted class distribution and
   confidence distribution against the baseline recorded at promotion.
   Crossing a declared threshold raises an alert for a human.
6. **Predictions are suggestions.** The agent always sees the predicted
   value labelled as a suggestion, with its confidence and its model
   version, and can always override it.
7. **Low confidence shows nothing.** Below a declared per-task
   threshold, no suggestion is displayed. A wrong confident suggestion
   costs more than an absent one.

## Consequences

### Positive

- The model improves from ordinary work, with no labelling effort.
- Degradation is detected from live signals rather than discovered in a
  post-mortem.
- Separating acceptance from override lets the report quantify
  automation bias instead of being silently subject to it.

### Negative

- `ACCEPTED` labels are weaker evidence than `OVERRIDDEN` ones and
  complicate every retraining decision.
- Drift thresholds are judgement calls that will produce false alerts
  before they are tuned.
- Showing confidence and model version to agents is product surface that
  exists for the model's sake, not the user's.

## Guardrails

- No automatic retraining and no automatic promotion. A human promotes
  (ADR-017).
- A correction never mutates the original prediction row; both are kept.
- `ACCEPTED` labels are weighted separately from `OVERRIDDEN` labels in
  any training snapshot, and a snapshot built only from `ACCEPTED`
  labels is rejected.
- Every suggestion shown in the UI names the model version that produced
  it.
- Drift thresholds live in version-controlled configuration, not in code
  or in someone's head.
- A drift alert never triggers a training job by itself.
- Correction records carry `tenantId` and are never pooled across
  tenants without an explicit, documented decision.
