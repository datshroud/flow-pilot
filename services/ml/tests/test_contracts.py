"""Guards against Zod ↔ Pydantic drift (ADR-014).

These assert the properties the TypeScript declaration fixes. When
``packages/contracts`` changes, one of these should fail — that failure is
the point.
"""

import pytest
from pydantic import ValidationError

from flowpilot_ml.contracts import ErrorEnvelope, HealthResp, HealthStatus, PublicError


def test_health_status_value_set_matches_zod_enum() -> None:
    # healthStatusSchema = z.enum(['ok', 'degraded'])
    assert {status.value for status in HealthStatus} == {"ok", "degraded"}


def test_health_resp_rejects_unknown_fields() -> None:
    # healthRespSchema is .strict()
    with pytest.raises(ValidationError):
        HealthResp.model_validate({"status": "ok", "uptime": 1})


def test_health_resp_rejects_unknown_status() -> None:
    with pytest.raises(ValidationError):
        HealthResp.model_validate({"status": "healthy"})


def test_public_error_serialises_request_id_as_camel_case() -> None:
    # publicErrorSchema names the field requestId, not request_id.
    error = PublicError(
        code="TICKET_NOT_FOUND",
        message="Ticket does not exist",
        request_id="01J000000000000000000000",
        details=[],
    )

    assert error.model_dump() == {
        "code": "TICKET_NOT_FOUND",
        "message": "Ticket does not exist",
        "requestId": "01J000000000000000000000",
        "details": [],
    }


def test_public_error_rejects_empty_strings() -> None:
    """z.string().min(1) on code, message and requestId."""
    pytest.xfail(
        "min-length constraints are not yet mirrored; tightened in M0.5 "
        "when the ticket and prediction contracts land."
    )


def test_error_envelope_wraps_a_public_error() -> None:
    envelope = ErrorEnvelope.model_validate(
        {
            "error": {
                "code": "ML_UNAVAILABLE",
                "message": "Model service did not respond in time",
                "requestId": "01J000000000000000000001",
                "details": [],
            }
        }
    )

    assert envelope.error.code == "ML_UNAVAILABLE"


def test_error_envelope_rejects_unknown_fields() -> None:
    with pytest.raises(ValidationError):
        ErrorEnvelope.model_validate(
            {
                "error": {
                    "code": "ML_UNAVAILABLE",
                    "message": "Model service did not respond in time",
                    "requestId": "01J000000000000000000001",
                    "details": [],
                },
                "traceId": "abc",
            }
        )
