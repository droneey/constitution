import re
from dataclasses import dataclass
from pathlib import Path
from typing import TYPE_CHECKING, Final

from ......entities import Changes
from ......errors import CheckError, Failure

if TYPE_CHECKING:
  from collections.abc import Sequence

  from ......contracts import Workspace

BASE: Final = 'origin/main'
# a diff split before each file's header, which each section keeps
SECTION: Final = re.compile(r'(?=^diff --git )', re.MULTILINE)
# a moved file that keeps its text has no `+++` line, only the name it was moved to; git ends a name
# that holds a space with a tab
FILE: Final = re.compile(r'^(?:\+\+\+ b/|rename to )(.+?)\t?$', re.MULTILINE)
MOVED: Final = re.compile(r'^rename from ', re.MULTILINE)
NEW: Final = re.compile(r'^new file mode ', re.MULTILINE)
DIFF: Final = (
  'diff',
  '-U0',
  '--no-color',
  '--find-renames',
  '--diff-filter=ACMR',
  '--merge-base',
  BASE,
)
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


@dataclass(frozen=True, slots=True, kw_only=True)
class _Section:
  # from the unit
  path: str
  is_moved: bool
  is_new: bool
  ranges: tuple[range, ...]


def _unit_sections(*, diff: str, prefix: str) -> tuple[_Section, ...]:
  """The sections of a diff of the whole repository whose file lies in the unit."""
  return tuple(
    _Section(
      path=match.group(1).removeprefix(prefix),
      is_moved=MOVED.search(section) is not None,
      is_new=NEW.search(section) is not None,
      ranges=_ranges(section),
    )
    for section in SECTION.split(diff)
    if (match := FILE.search(section)) is not None and match.group(1).startswith(prefix)
  )


def read_changes(workspace: Workspace) -> Changes:
  """The lines each file changed against the base, the files git does not track, and the sources.

  A file moved into the unit is diffed against the file it left, wherever that lay.

  Raises:
    CheckError: git fails.
  """
  prefix = _git(workspace, ['rev-parse', '--show-prefix']).strip()
  untracked = _git(workspace, ['ls-files', '--others', '--exclude-standard']).splitlines()
  command = ['git', *DIFF]
  completed = workspace.run_with_files_to_add(command, untracked)

  if completed.status != 0:
    raise CheckError(code=Failure.GIT_FAILED, command=command, output=completed.output)

  sections = _unit_sections(diff=completed.output, prefix=prefix)
  moved = {section.path for section in sections if section.is_moved}

  return Changes(
    # a file git does not track and nothing was moved into is left to the new files
    lines={
      Path(section.path): section.ranges
      for section in sections
      if not (section.is_new and section.path in untracked)
    },
    untracked=tuple(Path(path) for path in untracked if path not in moved),
    sources=workspace.sources(),
    read=workspace.read,
  )
