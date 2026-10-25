from pathlib import Path
from typing import TYPE_CHECKING

from ...domain.errors import Misuse, UsageError

if TYPE_CHECKING:
  from collections.abc import Sequence


def paths_of(arguments: Sequence[str]) -> tuple[Path, ...]:
  """The paths the command line names.

  Raises:
    UsageError: it names none.
  """
  if not arguments:
    raise UsageError(code=Misuse.NO_PATH)

  return tuple(Path(argument) for argument in arguments)
