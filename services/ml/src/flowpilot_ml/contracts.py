"""Pydantic mirrors of the shared Zod contracts.

The authoritative declaration lives in ``packages/contracts`` (TypeScript,
Zod). Every model here mirrors one of those schemas and must stay byte-
compatible with it: same field names, same value sets, same strictness.
ADR-014 requires a contract test on both sides rather than trust.

``extra="forbid"`` mirrors Zod's ``.strict()``. Without it, a field the
TypeScript side rejects would be silently accepted here, and the two
descriptions would drift without any test failing.
"""

from enum import StrEnum

from pydantic import BaseModel, ConfigDict

__all__ = ["ErrorEnvelope", "HealthResp", "HealthStatus", "PublicError"]


class StrictModel(BaseModel):
    """Base for every contract model: mirrors Zod ``.strict()``."""

    model_config = ConfigDict(extra="forbid", frozen=True)


class HealthStatus(StrEnum):
    """Mirrors ``healthStatusSchema``."""

    OK = "ok"
    DEGRADED = "degraded"


class HealthResp(StrictModel):
    """Mirrors ``healthRespSchema``."""

    status: HealthStatus


class PublicError(StrictModel):
    """Mirrors ``publicErrorSchema``."""

    code: str
    message: str
    request_id: str
    details: list[object]

    model_config = ConfigDict(
        extra="forbid",
        frozen=True,
        alias_generator=lambda field: {
            "code": "code",
            "message": "message",
            "request_id": "requestId",
            "details": "details",
        }[field],
        populate_by_name=True,
        serialize_by_alias=True,
    )


class ErrorEnvelope(StrictModel):
    """Mirrors ``errorEnvelopeSchema``."""

    error: PublicError
