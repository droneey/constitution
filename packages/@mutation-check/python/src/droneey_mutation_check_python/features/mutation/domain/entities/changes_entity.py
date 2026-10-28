from dataclasses import dataclass
from typing import TYPE_CHECKING

if TYPE_CHECKING:
  from ..value_objects import UnitRelativePath
  from .file_change_entity import FileChange


@dataclass(frozen=True, slots=True, kw_only=True)
class Changes:
  files: tuple[FileChange, ...]
  python_source_paths: tuple[UnitRelativePath, ...]
