from dataclasses import dataclass, field
from pathlib import PurePosixPath
from typing import TYPE_CHECKING, override

from droneey_mutation_check_python.features.mutation.application.contracts import Workspace
from droneey_mutation_check_python.features.mutation.domain.changes.entities import Changes
from droneey_mutation_check_python.features.mutation.domain.changes.value_objects import (
  UnitRelativePath,
)
from droneey_mutation_check_python.features.mutation.domain.mutation_run.entities import Stopped
from droneey_mutation_check_python.features.mutation.domain.mutation_targets.entities import (
  MutationTargets,
)

if TYPE_CHECKING:
  from collections.abc import Mapping

  from droneey_mutation_check_python.features.mutation.domain.changes.entities import FileChange
  from droneey_mutation_check_python.features.mutation.domain.mutation_run.entities import (
    MutationRun,
  )
  from droneey_mutation_check_python.features.mutation.domain.shared.errors import (
    CommandFailedError,
    CommandUnfinishedError,
    MutantsKeptError,
  )


# Why: declared a Workspace, so the type checker holds it to the port where it is defined.
@dataclass(kw_only=True)
class WorkspaceFake(Workspace):
  texts_by_path: Mapping[str, str]
  files: tuple[FileChange, ...] = ()
  run: MutationRun = field(default_factory=lambda: Stopped(mutants=()))
  mutated_targets: list[MutationTargets] = field(default_factory=list[MutationTargets])
  mutants_removal_count: int = 0
  read_changes_error: CommandFailedError | None = None
  remove_mutants_error: MutantsKeptError | None = None
  mutate_error: CommandUnfinishedError | None = None

  @override
  def read_changes(self) -> Changes:
    if self.read_changes_error is not None:
      raise self.read_changes_error

    return Changes(
      files=self.files,
      python_source_paths=tuple(
        UnitRelativePath(path=path)
        for path in sorted(
          PurePosixPath(text)
          for text in self.texts_by_path
          if text.startswith('src/') and text.endswith('.py')
        )
      ),
    )

  @override
  def read_text(self, path: UnitRelativePath) -> str:
    return self.texts_by_path[path.path.as_posix()]

  @override
  def remove_mutants(self) -> None:
    if self.remove_mutants_error is not None:
      raise self.remove_mutants_error

    self.mutants_removal_count += 1

  @override
  def mutate(self, targets: MutationTargets) -> MutationRun:
    self.mutated_targets.append(targets)

    if self.mutate_error is not None:
      raise self.mutate_error

    return self.run
