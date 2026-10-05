import fnmatch
import re
import sys
from collections.abc import Callable, Sequence
from dataclasses import dataclass
from pathlib import Path
from typing import TextIO

from mutmut_check.changes import changed_lines
from mutmut_check.targets import SOURCE_ROOT, Changes, mutant_globs

BASE = 'origin/main'
ALL = 'all'
# what mutmut stops with when the functions it is given hold no mutant
NO_MUTANT = (
  'Filtered for specific mutants, but nothing matches',
  'could not find any test case for any mutant',
)
PASSING = frozenset({'killed', 'caught by type check', 'skipped', 'not checked'})
# a line of `mutmut results`: a mutant's name and its status
RESULT = re.compile(r'^\s+(?P<name>\S+): (?P<status>.+)$', re.MULTILINE)


@dataclass(frozen=True, slots=True, kw_only=True)
class Completed:
  status: int
  output: str


type Runner = Callable[[Sequence[str]], Completed]


@dataclass(frozen=True, slots=True, kw_only=True)
class Workspace:
  run: Runner
  read: Callable[[Path], str]
  sources: Callable[[], tuple[Path, ...]]
  # removes the mutants mutmut keeps: before a run, and after one that passes
  clear: Callable[[], None]
  output: TextIO


def _git(workspace: Workspace, arguments: Sequence[str]) -> str:
  completed = workspace.run(['git', *arguments])

  if completed.status != 0:
    message = f'git {" ".join(arguments)} failed: {completed.output}'
    raise RuntimeError(message)

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
def _failures(*, results: str, globs: Sequence[str], stopped: bool) -> list[str]:
  return [
    f'{outcome["name"]}: {outcome["status"]}'
    for outcome in RESULT.finditer(results)
    if (stopped or outcome['status'] not in PASSING)
    and (not globs or any(fnmatch.fnmatchcase(outcome['name'], glob) for glob in globs))
  ]


def check(arguments: Sequence[str], *, workspace: Workspace) -> int:
  everything = ALL in arguments
  globs = () if everything else mutant_globs(_changes(workspace))

  if not everything and not globs:
    workspace.output.write('mutation: no function to mutate changed\n')
    return 0

  workspace.clear()
  mutmut = [sys.executable, '-m', 'mutmut']
  running = workspace.run([*mutmut, 'run', *globs])

  stopped = running.status != 0

  if stopped and not any(message in running.output for message in NO_MUTANT):
    workspace.output.write(running.output)
    return 1

  failures = _failures(
    results=workspace.run([*mutmut, 'results']).output,
    globs=globs,
    stopped=stopped,
  )
  workspace.output.writelines(f'mutation: {failure}\n' for failure in failures)

  if failures:
    return 1

  workspace.clear()
  workspace.output.write(
    'mutation: the functions hold nothing to mutate\n'
    if stopped
    else 'mutation: every mutant killed\n',
  )
  return 0


def python_sources(folder: Path) -> tuple[Path, ...]:
  return tuple(sorted(path.relative_to(folder) for path in (folder / SOURCE_ROOT).rglob('*.py')))
