"""Process entrypoint: binds a port and serves the app.

Kept separate from :mod:`flowpilot_ml.app` for the same reason the
TypeScript services separate ``server.ts`` from ``app.ts`` (ADR-003) — tests
must be able to exercise the application without a listening socket.
"""

import uvicorn

from flowpilot_ml.app import create_app
from flowpilot_ml.config import load_config


def main() -> None:
    config = load_config()
    uvicorn.run(create_app(), host="0.0.0.0", port=config.port)  # noqa: S104


if __name__ == "__main__":
    main()
