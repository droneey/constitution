from typing import TYPE_CHECKING, assert_never

from .....domain.entities import (
  EveryFunction,
  Functions,
  Passed,
  PassReason,
  Scope,
  is_empty,
  outcome_of,
)
from .steps import find_targets

if TYPE_CHECKING:
  from .....domain.entities import MutationTargets, Outcome
  from ....contracts import Workspace


def _targets(scope: Scope, *, workspace: Workspace) -> MutationTargets:
  match scope:
    case Scope.ALL:
      return EveryFunction()
    case Scope.CHANGED:
      return Functions(globs=find_targets(workspace.read_changes(), read_text=workspace.read_text))
    case _:  # pragma: no mutate -- no scope reaches it
      assert_never(scope)  # pragma: no mutate -- no scope reaches it


def check_mutants(scope: Scope, *, workspace: Workspace) -> Outcome:
  """Mutates the functions of the scope and answers whether every mutant was killed.

  Raises:
    CommandFailedError: git or mutmut fails.
    CommandUnfinishedError: a command does not start or runs past its time.
    InvalidValueError: git names a path outside the unit where a path from it belongs.
    MutantsKeptError: the system refuses to remove the mutants of an earlier run.
  """
  targets = _targets(scope, workspace=workspace)

  if is_empty(targets):
    return Passed(reason=PassReason.UNCHANGED)

  workspace.remove_mutants()

  outcome = outcome_of(workspace.mutate(targets), targets)

  if isinstance(outcome, Passed):
    workspace.remove_mutants()

  return outcome
