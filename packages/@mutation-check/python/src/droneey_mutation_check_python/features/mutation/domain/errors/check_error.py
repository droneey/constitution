from enum import StrEnum, unique
from typing import TYPE_CHECKING

if TYPE_CHECKING:
  from collections.abc import Sequence


@unique
class Failure(StrEnum):
  GIT_FAILED = 'git-failed'
  NOT_RUN = 'not-run'
  TIMED_OUT = 'timed-out'


# A run the check could not finish: the command it ran and what that command printed, which the
# entry shows by MESSAGES.
class CheckError(Exception):
  def __init__(self, *, code: Failure, command: Sequence[str], output: str = '') -> None:
    self.code = code
    self.command = tuple(command)
    self.output = output
