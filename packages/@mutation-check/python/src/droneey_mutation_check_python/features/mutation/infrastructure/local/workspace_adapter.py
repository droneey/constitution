import contextlib
import shutil
import subprocess
import tempfile
from dataclasses import dataclass, replace
from pathlib import Path, PurePosixPath
from typing import TYPE_CHECKING, Final, assert_never

from ...domain.changes.constants import SOURCE_ROOT_PATH
from ...domain.changes.entities import Changes
from ...domain.changes.value_objects import UnitRelativePath
from ...domain.mutation_run.entities import Broken, Ran, Stopped
from ...domain.mutation_targets.entities import EveryFunction, Functions
from ...domain.shared.errors import (
  CommandFailedError,
  CommandUnfinishedError,
  Failure,
  MutantsKeptError,
)
from .models import CommandResult
from .utils import file_changes, read_mutants

if TYPE_CHECKING:
  from collections.abc import Sequence

  from ...domain.mutation_run.entities import MutationRun
  from ...domain.mutation_targets.entities import MutantGlob, MutationTargets
  from .process_settings_config import ProcessSettings

MUTANTS_FOLDER_NAME: Final = 'mutants'
BASE_REF: Final = 'origin/main'
# Why: git then writes a name with a letter past ASCII as it is, never escaped in quotes.
GIT: Final = ('git', '-c', 'core.quotePath=false')
PREFIX_COMMAND: Final = (*GIT, 'rev-parse', '--show-prefix')
UNTRACKED_COMMAND: Final = (*GIT, 'ls-files', '-z', '--others', '--exclude-standard')
NAME_END: Final = '\0'
DIFF_COMMAND: Final = (
  *GIT,
  'diff',
  '-U0',
  '--no-color',
  '--find-renames',
  '--diff-filter=ACMR',
  '--merge-base',
  BASE_REF,
)
MUTMUT_ARGUMENTS: Final = ('-m', 'mutmut')
MUTMUT_RUN: Final = 'run'
MUTMUT_RESULTS: Final = 'results'
NO_MUTANT_MESSAGES: Final = (
  'Filtered for specific mutants, but nothing matches',
  'could not find any test case for any mutant',
)
INDEX_PATH_COMMAND: Final = (*GIT, 'rev-parse', '--path-format=absolute', '--git-path', 'index')
INDEX_COPY_NAME: Final = 'index'
INDEX_FILE_VARIABLE: Final = 'GIT_INDEX_FILE'
ADD_INTENT_COMMAND: Final = (*GIT, 'add', '--intent-to-add', '--')
# Why: a constant, since mutmut would spell the codec's name in capitals, which names the same
# codec.
UTF_8: Final = 'utf-8'


def _run(command: Sequence[str], *, settings: ProcessSettings) -> CommandResult:
  """Runs a command to its end, whatever its exit code.

  Raises:
    CommandUnfinishedError: the command does not start or runs past its time.
  """
  try:
    completed = subprocess.run(  # noqa: S603 -- the commands are git's and mutmut's, built by the gate
      command,
      capture_output=True,
      check=True,
      cwd=settings.folder_path,
      encoding=UTF_8,
      env=settings.whole_environment,
      timeout=settings.timeout_seconds,
    )
  except subprocess.CalledProcessError as error:
    return CommandResult(exit_code=error.returncode, joined_output=error.stdout + error.stderr)
  except subprocess.TimeoutExpired as error:
    raise CommandUnfinishedError(code=Failure.COMMAND_TIMED_OUT, command=command) from error
  except OSError as error:
    raise CommandUnfinishedError(code=Failure.COMMAND_NOT_RUN, command=command) from error

  return CommandResult(exit_code=0, joined_output=completed.stdout + completed.stderr)


def _output_of(command: Sequence[str], *, settings: ProcessSettings) -> str:
  """What a command that must succeed prints.

  Raises:
    CommandFailedError: it ends in failure.
    CommandUnfinishedError: it does not start or runs past its time.
  """
  result = _run(command, settings=settings)

  if result.exit_code != 0:
    raise CommandFailedError(command=command, output=result.joined_output)

  return result.joined_output


# Why: a copy of the index that holds the paths as files to add lets git's detection of moves see
# them, and the project's own index is never written.
def _diff_with_files_to_add(paths: Sequence[UnitRelativePath], *, settings: ProcessSettings) -> str:
  """The diff of the branch, run against a copy of the index that holds the paths as files to add.

  Raises:
    CommandFailedError: a git command fails.
    CommandUnfinishedError: a git command does not start or runs past its time.
  """
  index_path = _output_of(INDEX_PATH_COMMAND, settings=settings).strip()

  with tempfile.TemporaryDirectory() as scratch_path:
    index_copy_path = Path(scratch_path) / INDEX_COPY_NAME
    # Why: the copy keeps the index's time: git checks again the text of a file written in the
    # second the index was, which a newer copy would let it take for unchanged.
    shutil.copy2(index_path, index_copy_path)
    on_index_copy = replace(
      settings,
      whole_environment={**settings.whole_environment, INDEX_FILE_VARIABLE: str(index_copy_path)},
    )
    _output_of(
      [*ADD_INTENT_COMMAND, *(path.path.as_posix() for path in paths)], settings=on_index_copy
    )

    return _output_of(DIFF_COMMAND, settings=on_index_copy)


def _mutmut_globs(targets: MutationTargets) -> tuple[MutantGlob, ...]:
  match targets:
    case EveryFunction():
      return ()
    case Functions(globs=globs):
      return globs
    case _:  # pragma: no mutate -- no targets reach it
      assert_never(targets)  # pragma: no mutate -- no targets reach it


@dataclass(frozen=True, slots=True, kw_only=True)
class WorkspaceAdapter:
  process: ProcessSettings
  python_path: str

  def read_text(self, path: UnitRelativePath) -> str:
    file_path = self.process.folder_path / path.path

    return file_path.read_text(encoding=UTF_8)  # pragma: no mutate -- the specs' locale is UTF-8

  def _python_source_paths(self) -> tuple[UnitRelativePath, ...]:
    unit_path = self.process.folder_path

    return tuple(
      UnitRelativePath(path=PurePosixPath(path))
      for path in sorted(
        path.relative_to(unit_path) for path in (unit_path / SOURCE_ROOT_PATH.path).rglob('*.py')
      )
    )

  def read_changes(self) -> Changes:
    unit_prefix = _output_of(PREFIX_COMMAND, settings=self.process).strip()
    untracked_paths = tuple(
      UnitRelativePath(path=PurePosixPath(name))
      for name in _output_of(UNTRACKED_COMMAND, settings=self.process).split(NAME_END)
      if name
    )
    diff_output = _diff_with_files_to_add(untracked_paths, settings=self.process)

    return Changes(
      files=file_changes(
        diff_with_untracked_added=diff_output,
        unit_prefix=unit_prefix,
        untracked_paths=untracked_paths,
      ),
      python_source_paths=self._python_source_paths(),
    )

  def remove_mutants(self) -> None:
    """Removes the mutants/ folder mutmut keeps between runs.

    Raises:
      MutantsKeptError: the system refuses to remove it.
    """
    try:
      with contextlib.suppress(FileNotFoundError):
        shutil.rmtree(self.process.folder_path / MUTANTS_FOLDER_NAME)
    except OSError as error:
      raise MutantsKeptError(reason=str(error)) from error  # pragma: no mutate -- a person's text

  def mutate(self, targets: MutationTargets) -> MutationRun:
    mutmut_command = (self.python_path, *MUTMUT_ARGUMENTS)
    mutation = _run([*mutmut_command, MUTMUT_RUN, *_mutmut_globs(targets)], settings=self.process)
    has_stopped = mutation.exit_code != 0

    if has_stopped and not any(message in mutation.joined_output for message in NO_MUTANT_MESSAGES):
      return Broken(output=mutation.joined_output)

    mutants = read_mutants(_output_of([*mutmut_command, MUTMUT_RESULTS], settings=self.process))

    return Stopped(mutants=mutants) if has_stopped else Ran(mutants=mutants)
