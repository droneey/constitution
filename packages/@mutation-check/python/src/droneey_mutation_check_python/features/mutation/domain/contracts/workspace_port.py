from typing import TYPE_CHECKING, Protocol

if TYPE_CHECKING:
  from ..entities import Changes, MutationRun, MutationTargets
  from ..value_objects import UnitRelativePath


class Workspace(Protocol):
  def read_changes(self) -> Changes:
    """The files the branch changed against its base, and the unit's Python sources under src/.

    Raises:
      CommandFailedError: git fails.
      CommandUnfinishedError: git does not start or runs past its time.
      InvalidValueError: git names a path outside the unit where a path from it belongs.
    """

  def read_text(self, path: UnitRelativePath) -> str: ...

  def remove_mutants(self) -> None:
    """Removes the mutants/ folder mutmut keeps between runs.

    Raises:
      MutantsKeptError: the system refuses to remove it.
    """

  def mutate(self, targets: MutationTargets) -> MutationRun:
    """Mutates the functions the targets name.

    Raises:
      CommandFailedError: mutmut fails to list the mutants it made.
      CommandUnfinishedError: mutmut does not start or runs past its time.
    """
