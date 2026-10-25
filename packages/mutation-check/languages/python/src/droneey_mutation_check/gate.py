import fnmatch
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import TYPE_CHECKING, Final, Protocol

from droneey_mutation_check.changes import changed_lines
from droneey_mutation_check.check_error import CheckError, Failure
from droneey_mutation_check.outcome import Broken, Mutant, Outcome, Pass, Passed, Survived
from droneey_mutation_check.targets import Changes, mutant_globs

if TYPE_CHECKING:
  from collections.abc import Sequence

BASE: Final = 'origin/main'
ALL: Final = 'all'
# what mutmut stops with when the functions it is given hold no mutant
NO_MUTANT: Final = (
  'Filtered for specific mutants, but nothing matches',
  'could not find any test case for any mutant',
)
PASSING: Final = frozenset({'killed', 'caught by type check', 'skipped', 'not checked'})
# a line of `mutmut results`: a mutant's name and its status
RESULT: Final = re.compile(r'^\s+(?P<name>\S+): (?P<status>.+)$', re.MULTILINE)


@dataclass(frozen=True, slots=True, kw_only=True)
class Completed:
  status: int
  output: str


class Workspace(Protocol):
  def run(self, command: Sequence[str]) -> Completed: ...

  def read(self, path: Path) -> str: ...

  # every Python file under src/
  def sources(self) -> tuple[Path, ...]: ...

  # removes the mutants/ folder mutmut keeps between runs
  def clear(self) -> None: ...


def _git(workspace: Workspace, arguments: Sequence[str]) -> str:
  command = ['git', *arguments]
  completed = workspace.run(command)

  if completed.status != 0:
    raise CheckError(code=Failure.GIT_FAILED, command=command, output=completed.output)

  return completed.output


def _changes(workspace: Workspace) -> Changes:
  diff = _git(
    workspace,
    ['diff', '-U0', '--no-color', '--diff-filter=ACMR', '--merge-base', BASE, '--relative'],
  )
  untracked = _git(workspace, ['ls-files', '--others', '--exclude-standard'])

  return Changes(
    lines=changed_lines(diff),
    untracked=tuple(Path(line) for line in untracked.splitlines()),
    sources=workspace.sources(),
    read=workspace.read,
  )


# Once mutmut stopped before running, a mutant it lists for the functions is
# one no spec reaches.
def _failures(*, results: str, globs: Sequence[str], stopped: bool) -> tuple[Mutant, ...]:
  return tuple(
    Mutant(name=outcome['name'], status=outcome['status'])
    for outcome in RESULT.finditer(results)
    if (stopped or outcome['status'] not in PASSING)
    and (not globs or any(fnmatch.fnmatchcase(outcome['name'], glob) for glob in globs))
  )


def check(arguments: Sequence[str], *, workspace: Workspace) -> Outcome:
  """Mutates the functions a change touches, or every function given `all`.

  Raises:
    CheckError: git fails, or a command does not start or runs past its time.
  """
  everything = ALL in arguments
  globs = () if everything else mutant_globs(_changes(workspace))

  if not everything and not globs:
    return Passed(why=Pass.UNCHANGED)

  workspace.clear()
  mutmut = [sys.executable, '-m', 'mutmut']
  running = workspace.run([*mutmut, 'run', *globs])

  stopped = running.status != 0

  if stopped and not any(message in running.output for message in NO_MUTANT):
    return Broken(output=running.output)

  failures = _failures(
    results=workspace.run([*mutmut, 'results']).output,
    globs=globs,
    stopped=stopped,
  )

  if failures:
    return Survived(mutants=failures)

  workspace.clear()

  return Passed(why=Pass.EMPTY if stopped else Pass.KILLED)
