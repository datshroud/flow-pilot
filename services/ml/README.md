# FlowPilot ML service

Everything statistical in FlowPilot: feature extraction, training,
evaluation, inference and clustering (ADR-014).

This service holds **no business database credential**. It receives the text
and features it needs in the request body and returns predictions. Its own
storage is versioned model artifacts and immutable training snapshots
(ADR-017).

## Setup

```bash
cd services/ml
python -m venv .venv
. .venv/Scripts/activate        # PowerShell: .venv\Scripts\Activate.ps1
                                # Linux/macOS: . .venv/bin/activate

pip install -r requirements.txt -r requirements-dev.txt
pip install -e . --no-deps
```

Requires Python 3.14 — the version the lockfiles were compiled on. CI pins
the same interpreter, because `pip-compile` resolves per Python version.

To change a dependency, edit the matching `.in` file and regenerate:

```bash
pip install pip-tools
pip-compile --no-header --strip-extras requirements.in
pip-compile --no-header --strip-extras requirements-dev.in
```

`requirements.txt` and `requirements-dev.txt` are generated, never edited by
hand. Add a dependency to the matching `.in` file and re-run `pip-compile`.
ADR-014 requires exact pins; the generated lockfiles are those pins.

## Commands

```bash
pytest                  # tests
ruff check .            # lint
ruff format .           # format
mypy                    # type check
python -m flowpilot_ml.main   # run the service
```

## Layout

```
src/flowpilot_ml/
  app.py         FastAPI factory — adapts, never computes
  main.py        process entrypoint, binds the port
  config.py      environment configuration, read once at startup
  contracts.py   Pydantic mirrors of packages/contracts (Zod)
tests/
  test_health.py     health routes, same four cases as the TS services
  test_contracts.py  Zod ↔ Pydantic drift guards
```

`app.py` is separate from `main.py` for the same reason the TypeScript
services separate `app.ts` from `server.ts` (ADR-003): tests exercise the
application without binding a socket.

## Boundary rules

- No business rule is written here. Who may see a ticket and what a valid
  status transition is are the tickets service's decisions.
- Feature extraction is written once, here, and is the same code path in the
  notebook, the training job and online inference.
- Training never happens in an HTTP request. Training is a BullMQ job
  (ADR-016) that calls this service; inference is online (ADR-017).
