from typing import TYPE_CHECKING, Final, assert_never

from ...domain.entities import Broken, Pass, Passed, Survived
from ...domain.errors import Failure
from ..constants import ExitStatus

if TYPE_CHECKING:
  from ...domain.entities import Outcome

# What the entry says of a run the check could not finish.
MESSAGES: Final = {
  Failure.GIT_FAILED: '{command} failed: {output}',
  Failure.NOT_RUN: '{command} did not start; put it on PATH',
  Failure.TIMED_OUT: '{command} ran past its time',
}

# Each line of the report opens with its code, `mutation: <code>: `, which a reader scripts against.
NOT_KILLED: Final = 'not-killed'
PASSES: Final = {
  Pass.UNCHANGED: 'no function to mutate changed',
  Pass.KILLED: 'every mutant killed',
  Pass.EMPTY: 'the functions hold nothing to mutate',
}


def render(outcome: Outcome) -> str:
  match outcome:
    case Passed(why=why):
      return f'mutation: {why}: {PASSES[why]}\n'
    case Survived(mutants=mutants):
      return ''.join(
        f'mutation: {NOT_KILLED}: {mutant.name}: {mutant.status}\n' for mutant in mutants
      )
    case Broken(output=output):
      return output
    case _:  # pragma: no mutate -- no outcome reaches it
      assert_never(outcome)  # pragma: no mutate -- no outcome reaches it


def exit_status(outcome: Outcome) -> ExitStatus:
  return ExitStatus.PASSED if isinstance(outcome, Passed) else ExitStatus.FAILED
