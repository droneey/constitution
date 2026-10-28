from enum import StrEnum, unique
from typing import TYPE_CHECKING, Final, Literal

if TYPE_CHECKING:
  from collections.abc import Sequence


@unique
class Failure(StrEnum):
  """Why the check could not finish."""

  COMMAND_FAILED = 'command-failed'
  COMMAND_NOT_RUN = 'command-not-run'
  COMMAND_TIMED_OUT = 'command-timed-out'
  MUTANTS_KEPT = 'mutants-kept'


type Unfinished = Literal[Failure.COMMAND_NOT_RUN, Failure.COMMAND_TIMED_OUT]


class CommandFailedError(Exception):
  """A command the check runs that ended in failure, with what it printed."""

  code: Final = Failure.COMMAND_FAILED
  command: tuple[str, ...]
  output: str

  def __init__(self, *, command: Sequence[str], output: str) -> None:
    self.command = tuple(command)
    self.output = output


class CommandUnfinishedError(Exception):
  """A command the check runs that did not start or ran past its time."""

  code: Unfinished
  command: tuple[str, ...]

  def __init__(self, *, code: Unfinished, command: Sequence[str]) -> None:
    self.code = code
    self.command = tuple(command)


class MutantsKeptError(Exception):
  """The mutants/ folder of an earlier run that the system refused to remove, with its reason."""

  code: Final = Failure.MUTANTS_KEPT
  reason: str

  def __init__(self, *, reason: str) -> None:
    self.reason = reason
