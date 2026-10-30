from typing import TYPE_CHECKING, Final, assert_never

from ...domain.changes.errors import InvalidValueError, ValueFailure
from ...domain.mutation_run.entities import Broken, Passed, PassReason, Survived
from ...domain.mutation_targets.entities import Scope
from ...domain.shared.errors import (
  CommandFailedError,
  CommandUnfinishedError,
  Failure,
  MutantsKeptError,
)
from ..constants import ExitStatus
from ..errors import Misuse, UsageError
from . import report_messages as messages

if TYPE_CHECKING:
  from ...domain.mutation_run.entities import Outcome
  from ...domain.shared.errors import Unfinished

# Why: a reader scripts against the code, and a not-killed line ends with the mutant's status. Both
# sets are open: a later version may add a code or a status, so a reader passes over one it does not
# know rather than failing on it.
REPORT_LINE: Final = 'mutation: {code}: {text}\n'
NOT_KILLED_CODE: Final = 'not-killed'
MUTMUT_FAILED_CODE: Final = 'mutmut-failed'
ERROR_LINE: Final = 'mutation: {message}\n'
ARGUMENT_SEPARATOR: Final = ' '


def _pass_message(reason: PassReason) -> str:
  match reason:
    case PassReason.UNCHANGED:
      return messages.NOTHING_CHANGED
    case PassReason.KILLED:
      return messages.EVERY_MUTANT_KILLED
    case PassReason.NOTHING_TO_MUTATE:
      return messages.NOTHING_TO_MUTATE
    case _:  # pragma: no mutate -- no reason reaches it
      assert_never(reason)  # pragma: no mutate -- no reason reaches it


def render(outcome: Outcome) -> str:
  match outcome:
    case Passed(reason=reason):
      return REPORT_LINE.format(code=reason, text=_pass_message(reason))
    case Survived(mutants=mutants):
      return ''.join(
        REPORT_LINE.format(code=NOT_KILLED_CODE, text=f'{mutant.name}: {mutant.status}')
        for mutant in mutants
      )
    case Broken(output=output):
      return ''.join(
        REPORT_LINE.format(code=MUTMUT_FAILED_CODE, text=line) for line in output.splitlines()
      )
    case _:  # pragma: no mutate -- no outcome reaches it
      assert_never(outcome)  # pragma: no mutate -- no outcome reaches it


def exit_status(outcome: Outcome) -> ExitStatus:
  match outcome:
    case Passed():
      return ExitStatus.PASSED
    case Survived() | Broken():
      return ExitStatus.FAILED
    case _:  # pragma: no mutate -- no outcome reaches it
      assert_never(outcome)  # pragma: no mutate -- no outcome reaches it


def _unfinished_message(code: Unfinished) -> str:
  match code:
    case Failure.COMMAND_NOT_RUN:
      return messages.COMMAND_NOT_RUN
    case Failure.COMMAND_TIMED_OUT:
      return messages.COMMAND_TIMED_OUT
    case _:  # pragma: no mutate -- no code reaches it
      assert_never(code)  # pragma: no mutate -- no code reaches it


def _value_message(code: ValueFailure) -> str:
  match code:
    case ValueFailure.ABSOLUTE_PATH:
      return messages.ABSOLUTE_PATH
    case ValueFailure.PATH_OUT_OF_UNIT:
      return messages.PATH_OUT_OF_UNIT
    case _:  # pragma: no mutate -- no code reaches it
      assert_never(code)  # pragma: no mutate -- no code reaches it


def _misuse_message(code: Misuse) -> str:
  match code:
    case Misuse.UNKNOWN_ARGUMENTS:
      return messages.UNKNOWN_ARGUMENTS
    case _:  # pragma: no mutate -- no code reaches it
      assert_never(code)  # pragma: no mutate -- no code reaches it


def _error_message(error: Exception) -> str:
  match error:
    case CommandFailedError(command=command, output=output):
      return messages.COMMAND_FAILED.format(
        command=ARGUMENT_SEPARATOR.join(command), output=output.strip()
      )
    case CommandUnfinishedError(code=code, command=command):
      return _unfinished_message(code).format(command=ARGUMENT_SEPARATOR.join(command))
    case MutantsKeptError(reason=reason):
      return messages.MUTANTS_KEPT.format(reason=reason)
    case InvalidValueError(code=code, text=text):
      return _value_message(code).format(text=text)
    case UsageError(code=code, arguments=arguments):
      return _misuse_message(code).format(
        arguments=ARGUMENT_SEPARATOR.join(arguments), all_argument=Scope.ALL
      )
    case _:
      return messages.OWN_ERROR.format(error=error)


def render_error(error: Exception) -> str:
  return ERROR_LINE.format(message=_error_message(error))
