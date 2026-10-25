import fnmatch
import re
import sys
from typing import TYPE_CHECKING, Final

from ....entities import Broken, Mutant, Pass, Passed, Survived
from .steps import find_targets, read_changes

if TYPE_CHECKING:
  from collections.abc import Sequence

  from ....contracts import Workspace
  from ....entities import Outcome

ALL: Final = 'all'
# what mutmut stops with when the functions it is given hold no mutant
NO_MUTANT: Final = (
  'Filtered for specific mutants, but nothing matches',
  'could not find any test case for any mutant',
)
PASSING: Final = frozenset({'killed', 'caught by type check', 'skipped', 'not checked'})
# a line of `mutmut results`: a mutant's name and its status
RESULT: Final = re.compile(r'^\s+(?P<name>\S+): (?P<status>.+)$', re.MULTILINE)


# Once mutmut stopped before running, a mutant it lists for the functions is
# one no spec reaches.
def _failures(*, results: str, globs: Sequence[str], stopped: bool) -> tuple[Mutant, ...]:
  return tuple(
    Mutant(name=outcome['name'], status=outcome['status'])
    for outcome in RESULT.finditer(results)
    if (stopped or outcome['status'] not in PASSING)
    and (not globs or any(fnmatch.fnmatchcase(outcome['name'], glob) for glob in globs))
  )


def check_mutants(arguments: Sequence[str], *, workspace: Workspace) -> Outcome:
  """Mutates the functions a change touches, or every function given `all`.

  Raises:
    CheckError: git fails, or a command does not start or runs past its time.
  """
  everything = ALL in arguments
  globs = () if everything else find_targets(read_changes(workspace))

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
