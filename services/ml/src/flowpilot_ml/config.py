"""Process configuration, read once at startup.

Every value is read from the environment with an explicit default, so a
missing variable is a documented fallback rather than a ``KeyError`` at the
first request.
"""

import os
from dataclasses import dataclass
from pathlib import Path

__all__ = ["Config", "load_config"]


@dataclass(frozen=True, slots=True)
class Config:
    """Resolved configuration for one ML service process."""

    port: int
    """TCP port for the HTTP server."""

    artifact_dir: Path
    """Where versioned model artifacts live. Never inside the repository
    (ADR-017): artifacts are referenced by checksum, not committed."""

    snapshot_dir: Path
    """Where immutable training snapshots live (ADR-017)."""

    random_seed: int
    """Recorded with every training run so a run can be reproduced."""


def load_config(env: dict[str, str] | None = None) -> Config:
    """Build a :class:`Config` from ``env`` (defaults to ``os.environ``)."""
    source = os.environ if env is None else env

    return Config(
        port=int(source.get("ML_PORT", "4104")),
        artifact_dir=Path(source.get("ML_ARTIFACT_DIR", "var/models")),
        snapshot_dir=Path(source.get("ML_SNAPSHOT_DIR", "var/snapshots")),
        random_seed=int(source.get("ML_RANDOM_SEED", "42")),
    )
