from dataclasses import dataclass
from typing import TYPE_CHECKING, Final

from ..errors import InvalidValueError, ValueFailure

if TYPE_CHECKING:
  from pathlib import PurePosixPath

PARENT_SEGMENT: Final = '..'


@dataclass(frozen=True, slots=True, kw_only=True)
class UnitRelativePath:
  path: PurePosixPath

  def __post_init__(self) -> None:
    """Refuses a path that does not stay inside the unit.

    Raises:
      InvalidValueError: the path is absolute, or climbs out by `..`.
    """
    if self.path.is_absolute():
      raise InvalidValueError(code=ValueFailure.ABSOLUTE_PATH, text=self.path.as_posix())

    if PARENT_SEGMENT in self.path.parts:
      raise InvalidValueError(code=ValueFailure.PATH_OUT_OF_UNIT, text=self.path.as_posix())
