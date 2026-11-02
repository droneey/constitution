from dataclasses import dataclass
from typing import TYPE_CHECKING

if TYPE_CHECKING:
  from pathlib import Path


@dataclass(frozen=True, slots=True, kw_only=True)
class Source:
  path: Path
  content: bytes


@dataclass(frozen=True, slots=True, kw_only=True)
class Sources:
  files: tuple[Source, ...]
  package_folder_paths: frozenset[Path]
