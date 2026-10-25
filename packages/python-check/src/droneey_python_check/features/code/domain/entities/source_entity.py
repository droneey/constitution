from dataclasses import dataclass
from typing import TYPE_CHECKING

if TYPE_CHECKING:
  from pathlib import Path


@dataclass(frozen=True, slots=True, kw_only=True)
class Source:
  path: Path
  text: bytes


@dataclass(frozen=True, slots=True, kw_only=True)
class Sources:
  files: tuple[Source, ...]
  # every folder of the import packages the files sit in
  folders: frozenset[Path]
