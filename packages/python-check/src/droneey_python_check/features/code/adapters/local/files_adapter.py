from typing import TYPE_CHECKING, Final

from ...domain.entities import Source, Sources, import_root_of
from ...domain.errors import MissingPathsError

if TYPE_CHECKING:
  from collections.abc import Iterator, Sequence
  from pathlib import Path

PYTHON_SUFFIX: Final = '.py'
SKIPPED_FOLDER_NAME: Final = '__pycache__'


def _python_file_paths(path: Path) -> Iterator[Path]:
  if path.is_file():
    if path.suffix == PYTHON_SUFFIX:
      yield path

    return

  for file_path in sorted(path.rglob(f'*{PYTHON_SUFFIX}')):
    if SKIPPED_FOLDER_NAME not in file_path.parts:
      yield file_path


def python_sources(paths: Sequence[Path]) -> Sources:
  """The Python files under the paths, and the folders of their import packages.

  Raises:
    MissingPathsError: a path is neither a file nor a folder.
  """
  missing_paths = tuple(path for path in paths if not (path.is_file() or path.is_dir()))

  if missing_paths:
    raise MissingPathsError(missing_paths)

  file_paths = tuple(file_path for path in paths for file_path in _python_file_paths(path))
  package_paths = {
    root.package_path for file_path in file_paths if (root := import_root_of(file_path)) is not None
  }

  return Sources(
    files=tuple(Source(path=file_path, content=file_path.read_bytes()) for file_path in file_paths),
    package_folder_paths=frozenset(
      folder_path
      for package_path in package_paths
      for folder_path in (package_path, *package_path.rglob('*'))
      if folder_path.is_dir()
    ),
  )
