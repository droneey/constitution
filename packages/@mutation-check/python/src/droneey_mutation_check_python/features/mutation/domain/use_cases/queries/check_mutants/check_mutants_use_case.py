import fnmatch
from typing import TYPE_CHECKING, assert_never

from ....entities import (
  Broken,
  EveryFunction,
  Functions,
  Passed,
  PassReason,
  Ran,
  Scope,
  Stopped,
  Survived,
  is_killed,
)
from .steps import find_targets

if TYPE_CHECKING:
  from ....contracts import Workspace
  from ....entities import Mutant, MutationTargets, Outcome


def _targets(scope: Scope, *, workspace: Workspace) -> MutationTargets:
  match scope:
    case Scope.ALL:
      return EveryFunction()
    case Scope.CHANGED:
      return Functions(globs=find_targets(workspace.read_changes(), read_text=workspace.read_text))
    case _:  # pragma: no mutate -- no scope reaches it
      assert_never(scope)  # pragma: no mutate -- no scope reaches it


def _targeted(mutants: tuple[Mutant, ...], targets: MutationTargets) -> tuple[Mutant, ...]:
  match targets:
    case EveryFunction():
      return mutants
    case Functions(globs=globs):
      return tuple(
        mutant
        for mutant in mutants
        if any(fnmatch.fnmatchcase(mutant.name, glob) for glob in globs)
      )
    case _:  # pragma: no mutate -- no targets reach it
      assert_never(targets)  # pragma: no mutate -- no targets reach it


def check_mutants(scope: Scope, *, workspace: Workspace) -> Outcome:
  """Mutates the functions of the scope and answers whether every mutant was killed.

  Raises:
    CommandFailedError: git or mutmut fails.
    CommandUnfinishedError: a command does not start or runs past its time.
    InvalidValueError: git names a path outside the unit where a path from it belongs.
    MutantsKeptError: the system refuses to remove the mutants of an earlier run.
  """
  targets = _targets(scope, workspace=workspace)

  if targets == Functions(globs=()):
    return Passed(reason=PassReason.UNCHANGED)

  workspace.remove_mutants()

  run = workspace.mutate(targets)

  match run:
    case Broken():
      return run
    case Ran(mutants=mutants):
      not_killed = tuple(
        mutant for mutant in _targeted(mutants, targets) if not is_killed(mutant.status)
      )
      reason = PassReason.KILLED
    case Stopped(mutants=mutants):
      not_killed = _targeted(mutants, targets)
      reason = PassReason.NOTHING_TO_MUTATE
    case _:  # pragma: no mutate -- no run reaches it
      assert_never(run)  # pragma: no mutate -- no run reaches it

  if not_killed:
    return Survived(mutants=not_killed)

  workspace.remove_mutants()

  return Passed(reason=reason)
