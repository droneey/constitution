from dataclasses import dataclass
from typing import TYPE_CHECKING, assert_never

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


def touches(file: FileChange, *, first_line: int, last_line: int) -> bool:
  match file:
    case NewFile():
      return True
    case ChangedFile(line_ranges=line_ranges):
      lines = range(first_line, last_line + 1)

      return any(
        changed.start < lines.stop and lines.start < changed.stop for changed in line_ranges
      )
    case _:  # pragma: no mutate -- no file reaches it
      assert_never(file)  # pragma: no mutate -- no file reaches it
