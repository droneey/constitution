from typing import TYPE_CHECKING, Final

from ...domain.entities import Source, Sources, import_root_of
from ...domain.errors import Misuse, UsageError

if TYPE_CHECKING:
  from collections.abc import Iterator, Sequence
  from pathlib import Path

SKIPPED: Final = '__pycache__'


def _python_files(path: Path) -> Iterator[Path]:
  if path.is_file():
    yield path
    return

  for file in sorted(path.rglob('*.py')):
    if SKIPPED not in file.parts:
      yield file


def python_sources(paths: Sequence[Path]) -> Sources:
  """The Python files under the paths, and the folders of their import packages.

  Raises:
    UsageError: a path is neither a file nor a folder.
  """
  missing = tuple(str(path) for path in paths if not (path.is_file() or path.is_dir()))

  if missing:
    raise UsageError(code=Misuse.MISSING_PATH, paths=missing)

  files = tuple(file for path in paths for file in _python_files(path))
  packages = {root.folder for file in files if (root := import_root_of(file)) is not None}

  return Sources(
    files=tuple(Source(path=file, text=file.read_bytes()) for file in files),
    folders=frozenset(
      folder for package in packages for folder in (package, *package.rglob('*')) if folder.is_dir()
    ),
  )
