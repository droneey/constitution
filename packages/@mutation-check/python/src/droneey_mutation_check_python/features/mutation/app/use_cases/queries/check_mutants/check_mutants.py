from typing import TYPE_CHECKING

from .....domain.entities import Scope
from ....errors import Misuse, UsageError
from ....utils import exit_status, render

if TYPE_CHECKING:
  from collections.abc import Callable, Sequence

  from .....domain.entities import Outcome
  from ....constants import ExitStatus


def _scope_of(arguments: Sequence[str]) -> Scope:
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
  """The command line's `mutmut-check [all]`: mutates the changed functions, or with `all` all.

  check_mutants is the use case, bound by the root to the unit's workspace.

  Raises:
    UsageError: the command line names an argument other than `all`.
  """
  outcome = check_mutants(_scope_of(arguments))
  write(render(outcome))

  return exit_status(outcome)
