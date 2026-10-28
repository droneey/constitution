from dataclasses import dataclass
from typing import TYPE_CHECKING

if TYPE_CHECKING:
  from pathlib import Path

  from .breach_entity import Breach


@dataclass(frozen=True, slots=True, kw_only=True)
class Finding:
  path: Path
  line_number: int
  breach: Breach
