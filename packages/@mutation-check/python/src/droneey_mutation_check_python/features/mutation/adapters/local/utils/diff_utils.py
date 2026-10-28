import re
from dataclasses import dataclass
from enum import StrEnum, unique
from pathlib import PurePosixPath
from typing import TYPE_CHECKING, Final, assert_never

from ....domain.entities import ChangedFile, NewFile
from ....domain.value_objects import UnitRelativePath

if TYPE_CHECKING:
  from ....domain.entities import FileChange

# a diff split before each file's header, which each section keeps
SECTION_PATTERN: Final = re.compile(r'(?=^diff --git )', re.MULTILINE)
# a moved file that keeps its text has no `+++` line, only the name it was moved to; git ends a name
# that holds a space with a tab
FILE_PATH_PATTERN: Final = re.compile(r'^(?:\+\+\+ b/|rename to )(.+?)\t?$', re.MULTILINE)
MOVED_PATTERN: Final = re.compile(r'^rename from ', re.MULTILINE)
NEW_FILE_PATTERN: Final = re.compile(r'^new file mode ', re.MULTILINE)
HUNK_PATTERN: Final = re.compile(r'^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@', re.MULTILINE)


@unique
class _SectionKind(StrEnum):
  CHANGED = 'changed'
  NEW = 'new'
  MOVED = 'moved'


@dataclass(frozen=True, slots=True, kw_only=True)
class _Section:
  kind: _SectionKind
  path: UnitRelativePath
  line_ranges: tuple[range, ...]


def _line_ranges(section_text: str) -> tuple[range, ...]:
  return tuple(
    range(int(start), int(start) + int(count or '1'))
    for start, count in HUNK_PATTERN.findall(section_text)
    if count != '0'
  )


def _kind(section_text: str) -> _SectionKind:
  if MOVED_PATTERN.search(section_text) is not None:
    return _SectionKind.MOVED

  if NEW_FILE_PATTERN.search(section_text) is not None:
    return _SectionKind.NEW

  return _SectionKind.CHANGED


def _unit_sections(*, diff_output: str, unit_prefix: str) -> tuple[_Section, ...]:
  return tuple(
    _Section(
      kind=_kind(section_text),
      path=UnitRelativePath(path=PurePosixPath(path_match.group(1).removeprefix(unit_prefix))),
      line_ranges=_line_ranges(section_text),
    )
    for section_text in SECTION_PATTERN.split(diff_output)
    if (path_match := FILE_PATH_PATTERN.search(section_text)) is not None
    and path_match.group(1).startswith(unit_prefix)
  )


def file_changes(
  *, diff_output: str, unit_prefix: str, untracked_paths: tuple[UnitRelativePath, ...]
) -> tuple[FileChange, ...]:
  """The files of the unit a diff of the whole repository changed, then those git does not track.

  The diff is git's `-U0` diff run with the files git does not track indexed as files to add.
  """
  changed_files: list[FileChange] = []
  moved_paths: set[UnitRelativePath] = set()

  for section in _unit_sections(diff_output=diff_output, unit_prefix=unit_prefix):
    changed_file = ChangedFile(path=section.path, line_ranges=section.line_ranges)

    match section.kind:
      case _SectionKind.CHANGED:
        changed_files.append(changed_file)
      case _SectionKind.MOVED:
        changed_files.append(changed_file)
        moved_paths.add(section.path)
      # a file git does not track is left to the new files
      case _SectionKind.NEW:
        if section.path not in untracked_paths:
          changed_files.append(changed_file)
      case _:  # pragma: no mutate -- no kind reaches it
        assert_never(section.kind)  # pragma: no mutate -- no kind reaches it

  return (
    *changed_files,
    *(NewFile(path=path) for path in untracked_paths if path not in moved_paths),
  )
