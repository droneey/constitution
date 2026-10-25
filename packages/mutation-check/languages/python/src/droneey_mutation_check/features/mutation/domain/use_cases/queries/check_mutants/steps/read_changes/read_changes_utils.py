import re
from pathlib import Path
from typing import TYPE_CHECKING, Final

from ......entities import Changes
from ......errors import CheckError, Failure

if TYPE_CHECKING:
  from collections.abc import Sequence

  from ......contracts import Workspace

BASE: Final = 'origin/main'
SECTION: Final = re.compile(r'^diff --git ', re.MULTILINE)
FILE: Final = re.compile(r'^\+\+\+ b/(.+)$', re.MULTILINE)
HUNK: Final = re.compile(r'^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@', re.MULTILINE)


def _git(workspace: Workspace, arguments: Sequence[str]) -> str:
  command = ['git', *arguments]
  completed = workspace.run(command)

  if completed.status != 0:
    raise CheckError(code=Failure.GIT_FAILED, command=command, output=completed.output)

  return completed.output


def _ranges(section: str) -> tuple[range, ...]:
  return tuple(
    range(int(start), int(start) + int(count or '1'))
    for start, count in HUNK.findall(section)
    if count != '0'
  )


def _changed_lines(diff: str) -> dict[Path, tuple[range, ...]]:
  return {
    Path(match.group(1)): _ranges(section)
    for section in SECTION.split(diff)
    if (match := FILE.search(section)) is not None
  }


def read_changes(workspace: Workspace) -> Changes:
  """The lines each file changed against the base, the files git does not track, and the sources.

  Raises:
    CheckError: git fails.
  """
  diff = _git(
    workspace,
    ['diff', '-U0', '--no-color', '--diff-filter=ACMR', '--merge-base', BASE, '--relative'],
  )
  untracked = _git(workspace, ['ls-files', '--others', '--exclude-standard'])

  return Changes(
    lines=_changed_lines(diff),
    untracked=tuple(Path(line) for line in untracked.splitlines()),
    sources=workspace.sources(),
    read=workspace.read,
  )
