import tomllib
from typing import TYPE_CHECKING, Final

from droneey_python_check.check import Source, Sources
from droneey_python_check.imports import import_root_of
from droneey_python_check.usage_error import Misuse, UsageError

if TYPE_CHECKING:
  from collections.abc import Iterator, Mapping, Sequence
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


def toml_document(path: Path) -> Mapping[str, object] | None:
  if not path.is_file():
    return None

  with path.open('rb') as file:
    return tomllib.load(file)
