from enum import StrEnum, unique
from typing import TYPE_CHECKING, Final, Literal

if TYPE_CHECKING:
  from collections.abc import Sequence


@unique
class Failure(StrEnum):
  COMMAND_FAILED = 'command-failed'
  COMMAND_NOT_RUN = 'command-not-run'
  COMMAND_TIMED_OUT = 'command-timed-out'
  MUTANTS_KEPT = 'mutants-kept'


type Unfinished = Literal[Failure.COMMAND_NOT_RUN, Failure.COMMAND_TIMED_OUT]


class CommandFailedError(Exception):
  code: Final = Failure.COMMAND_FAILED
  command: tuple[str, ...]
  output: str

  def __init__(self, *, command: Sequence[str], output: str) -> None:
    self.command = tuple(command)
    self.output = output


class CommandUnfinishedError(Exception):
  code: Unfinished
  command: tuple[str, ...]

  def __init__(self, *, code: Unfinished, command: Sequence[str]) -> None:
    self.code = code
    self.command = tuple(command)


class MutantsKeptError(Exception):
  code: Final = Failure.MUTANTS_KEPT
  reason: str

  def __init__(self, *, reason: str) -> None:
    self.reason = reason
