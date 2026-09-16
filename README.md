# FlowPilot — Helpdesk Intelligence Platform

A multi-tenant helpdesk where every ticket is enriched by machine learning
at intake, agents correct what the models get wrong, and those corrections
become the next training set.

The product is the feedback loop: predict → suggest → correct → retrain →
promote, with every prediction traceable to the exact model version, run,
dataset snapshot and seed that produced it.

## Learning tasks

| #   | Task                | Type                             | Model families                                                 |
| --- | ------------------- | -------------------------------- | -------------------------------------------------------------- |
| T1  | Ticket category     | Multi-class classification       | Multinomial NB, Logistic Regression, Linear SVM, Random Forest |
| T2  | Priority            | Ordinal classification           | Same families, class-weighted                                  |
| T3  | Resolution time     | Regression                       | Ridge, Decision Tree, Random Forest, Gradient Boosting         |
| T4  | Duplicate detection | Similarity / kNN                 | TF-IDF → SVD → cosine kNN                                      |
| T5  | Topic discovery     | Clustering                       | K-means over SVD components, silhouette selection              |
| T6  | Escalation risk     | Imbalanced binary classification | Logistic Regression + class weights, PR-AUC, threshold tuning  |

## Stack

**Business services** — TypeScript · Express 5 · PostgreSQL + Prisma ·
Redis + BullMQ · Zod · Vitest

**ML service** — Python · FastAPI · scikit-learn · pandas · numpy · pytest

**Web** — Next.js

The polyglot split and its boundary rules are ADR-014.

## Services

| Service            | Runtime    | Owns                                                                                   |
| ------------------ | ---------- | -------------------------------------------------------------------------------------- |
| `apps/api-gateway` | TypeScript | Nothing — stateless edge: token verification, tenant context, request IDs, rate limits |
| `apps/identity`    | TypeScript | Users, credentials, tenants, memberships, roles                                        |
| `apps/tickets`     | TypeScript | Tickets, comments, assignment, SLA, prediction log, label corrections, model registry  |
| `apps/worker`      | TypeScript | No data — runs training triggers, batch scoring, SLA timers, drift checks              |
| `services/ml`      | Python     | Model artifacts and training snapshots. No business database                           |

## Getting started

TypeScript services:

```bash
docker compose up -d      # PostgreSQL + Redis
pnpm install
pnpm build
pnpm test
```

ML service (Python 3.14):

```bash
cd services/ml
python -m venv .venv
.venv\Scripts\Activate.ps1        # Linux/macOS: . .venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt
pip install -e . --no-deps
pytest
```

See `services/ml/README.md` for the full ML workflow.

## Architecture

Decisions live in `docs/adr/`. The ones that define the current system:

- **ADR-014** — polyglot runtime: TypeScript for business, Python for ML
- **ADR-015** — service catalog
- **ADR-016** — asynchronous work on Redis + BullMQ with a transactional outbox
- **ADR-017** — model registry, offline training / online inference
- **ADR-018** — human-in-the-loop labeling and drift monitoring
- **ADR-013** — authentication and authorization

`docs/implementation-status.md` tracks the current milestone.

Earlier ADRs marked Superseded or Withdrawn are kept deliberately: they
record what was decided for the two retired topics and why it no longer
holds.
