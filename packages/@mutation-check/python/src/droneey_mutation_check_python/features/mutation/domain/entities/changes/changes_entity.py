from dataclasses import dataclass
from typing import TYPE_CHECKING

if TYPE_CHECKING:
  from ...value_objects import UnitRelativePath
  from ..file_change.file_change_entity import FileChange


@dataclass(frozen=True, slots=True, kw_only=True)
class Changes:
  files: tuple[FileChange, ...]
  python_source_paths: tuple[UnitRelativePath, ...]


def python_source_files(changes: Changes) -> tuple[FileChange, ...]:
  source_paths = set(changes.python_source_paths)

  return tuple(file for file in changes.files if file.path in source_paths)
