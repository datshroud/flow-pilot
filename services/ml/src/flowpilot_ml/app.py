"""FastAPI application factory.

The HTTP layer adapts, it does not compute (ADR-003's rule, applied to this
service by ADR-014). Handlers validate, delegate and serialise; every model
and metric is produced below this layer.

``create_app`` mirrors the Express ``createApp`` in the TypeScript services:
the app is constructed without binding a port, so tests exercise it directly.
"""

from collections.abc import Awaitable, Callable

from fastapi import FastAPI, Response

from flowpilot_ml.contracts import HealthResp, HealthStatus

__all__ = ["ReadinessCheck", "create_app"]

ReadinessCheck = Callable[[], bool | Awaitable[bool]]


async def _resolve(check: ReadinessCheck) -> bool:
    outcome = check()
    if isinstance(outcome, bool):
        return outcome
    return await outcome


def create_app(is_ready: ReadinessCheck | None = None) -> FastAPI:
    """Build the ML service app.

    ``is_ready`` is injected so readiness can be driven in tests without
    standing up the dependencies it reports on.
    """
    readiness_check: ReadinessCheck = is_ready if is_ready is not None else lambda: True

    app = FastAPI(title="FlowPilot ML", version="0.0.0")

    @app.get("/health/live", response_model=HealthResp)
    async def live() -> HealthResp:
        return HealthResp(status=HealthStatus.OK)

    @app.get("/health/ready", response_model=HealthResp)
    async def ready(response: Response) -> HealthResp:
        try:
            is_up = await _resolve(readiness_check)
        except Exception:
            # A readiness probe reports; it never propagates the failure it
            # was asked to detect.
            response.status_code = 503
            return HealthResp(status=HealthStatus.DEGRADED)

        response.status_code = 200 if is_up else 503
        return HealthResp(status=HealthStatus.OK if is_up else HealthStatus.DEGRADED)

    return app
