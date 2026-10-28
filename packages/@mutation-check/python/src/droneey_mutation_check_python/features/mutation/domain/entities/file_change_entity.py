from dataclasses import dataclass
from typing import TYPE_CHECKING

if TYPE_CHECKING:
  from ..value_objects import UnitRelativePath


@dataclass(frozen=True, slots=True, kw_only=True)
class NewFile:
  path: UnitRelativePath


@dataclass(frozen=True, slots=True, kw_only=True)
class ChangedFile:
  path: UnitRelativePath
  line_ranges: tuple[range, ...]


type FileChange = NewFile | ChangedFile
