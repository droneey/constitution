import re
from pathlib import Path

SECTION = re.compile(r'^diff --git ', re.MULTILINE)
FILE = re.compile(r'^\+\+\+ b/(.+)$', re.MULTILINE)
HUNK = re.compile(r'^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@', re.MULTILINE)


def _ranges(section: str) -> tuple[range, ...]:
  return tuple(
    range(int(start), int(start) + int(count or '1'))
    for start, count in HUNK.findall(section)
    if count != '0'
  )


def changed_lines(diff: str) -> dict[Path, tuple[range, ...]]:
  return {
    Path(match.group(1)): _ranges(section)
    for section in SECTION.split(diff)
    if (match := FILE.search(section)) is not None
  }
