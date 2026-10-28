from dataclasses import dataclass
from typing import TYPE_CHECKING

if TYPE_CHECKING:
  from ..value_objects import UnitRelativePath


@dataclass(frozen=True, slots=True, kw_only=True)
class NewFile:
  """A file of the branch that git does not track and nothing was moved into, mutated whole."""

  path: UnitRelativePath


@dataclass(frozen=True, slots=True, kw_only=True)
class ChangedFile:
  """A file whose lines changed against the branch's base.

  A file moved into the unit is diffed against the file it left, wherever that lay.
  """

  path: UnitRelativePath
  line_ranges: tuple[range, ...]


type FileChange = NewFile | ChangedFile
