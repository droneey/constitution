from typing import TYPE_CHECKING

from .....domain.mutation_targets.entities import Scope
from ....errors import Misuse, UsageError
from ....utils import exit_status, render

if TYPE_CHECKING:
  from collections.abc import Callable, Sequence

  from .....domain.mutation_run.entities import Outcome
  from ....constants import ExitStatus


def _scope_of(arguments: Sequence[str]) -> Scope:
  """The scope the command line names.

  Raises:
    UsageError: the command line names an argument other than `all`.
  """
  match arguments:
    case []:
      return Scope.CHANGED
    case [Scope.ALL]:
      return Scope.ALL
    case _:
      raise UsageError(code=Misuse.UNKNOWN_ARGUMENTS, arguments=tuple(arguments))


def run_check_mutants(
  *,
  arguments: Sequence[str],
  check_mutants: Callable[[Scope], Outcome],
  write: Callable[[str], object],
) -> ExitStatus:
  """Runs `mutmut-check [all]`: mutates the changed functions, or with `all` all.

  Raises:
    UsageError: the command line names an argument other than `all`.
  """
  outcome = check_mutants(_scope_of(arguments))
  write(render(outcome))

  return exit_status(outcome)
