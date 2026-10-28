from dataclasses import dataclass
from typing import TYPE_CHECKING

if TYPE_CHECKING:
  from collections.abc import Mapping
  from pathlib import Path


@dataclass(frozen=True, slots=True, kw_only=True)
class ProcessSettings:
  folder_path: Path
  whole_environment: Mapping[str, str]
  timeout_seconds: float
