from enum import StrEnum, unique
from typing import TYPE_CHECKING, Final

if TYPE_CHECKING:
  from collections.abc import Sequence


@unique
class Failure(StrEnum):
  GIT_FAILED = 'git-failed'
  NOT_RUN = 'not-run'
  TIMED_OUT = 'timed-out'


MESSAGES: Final = {
  Failure.GIT_FAILED: '{command} failed: {output}',
  Failure.NOT_RUN: '{command} did not start; put it on PATH',
  Failure.TIMED_OUT: '{command} ran past its time',
}


# A run the check could not finish: the command it ran and what that command printed, which the
# entry shows by MESSAGES.
class CheckError(Exception):
  def __init__(self, *, code: Failure, command: Sequence[str], output: str = '') -> None:
    self.code = code
    self.command = tuple(command)
    self.output = output
