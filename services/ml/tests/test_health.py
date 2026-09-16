"""Health route behaviour, mirroring the TypeScript services' health tests.

The four cases are deliberately the same four asserted in
``apps/tickets/test/health.test.ts``: liveness, ready by default, degraded
when the check is false, degraded when the check raises.
"""

import pytest
from fastapi.testclient import TestClient

from flowpilot_ml.app import create_app


def test_liveness_is_ok() -> None:
    with TestClient(create_app()) as client:
        response = client.get("/health/live")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_readiness_is_ok_by_default() -> None:
    with TestClient(create_app()) as client:
        response = client.get("/health/ready")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_readiness_is_degraded_when_check_is_false() -> None:
    with TestClient(create_app(is_ready=lambda: False)) as client:
        response = client.get("/health/ready")

    assert response.status_code == 503
    assert response.json() == {"status": "degraded"}


def test_readiness_is_degraded_when_check_raises() -> None:
    def failing_check() -> bool:
        raise RuntimeError("dependency unavailable")

    with TestClient(create_app(is_ready=failing_check)) as client:
        response = client.get("/health/ready")

    assert response.status_code == 503
    assert response.json() == {"status": "degraded"}


@pytest.mark.parametrize("path", ["/health/live", "/health/ready"])
def test_health_body_carries_no_extra_fields(path: str) -> None:
    """The shared contract is strict; a health body is exactly one key."""
    with TestClient(create_app()) as client:
        response = client.get(path)

    assert set(response.json()) == {"status"}
