from typing import TYPE_CHECKING

import pytest
from source_fixtures import write_files

from droneey_python_check.features.code.domain.entities import Source, Sources
from droneey_python_check.features.code.domain.errors import MissingPathsError
from droneey_python_check.features.code.infrastructure.local import python_sources

if TYPE_CHECKING:
  from pathlib import Path

FILES = {
  'src/shop/__init__.py': '',
  'src/shop/kernel/money.py': 'LIMIT = 1\n',
  'src/shop/kernel/__pycache__/stale.py': '',
  'src/shop/kernel/data.json': '{}\n',
  'tests/test_money.py': '',
}


def test_should_read_the_python_files_under_a_folder_and_the_folders_of_their_package(
  tmp_path: Path,
) -> None:
  # Arrange
  write_files(tmp_path, FILES)

  # Act
  sources = python_sources([tmp_path / 'src'])

  # Assert
  assert sources == Sources(
    files=(
      Source(path=tmp_path / 'src/shop/__init__.py', content=b''),
      Source(path=tmp_path / 'src/shop/kernel/money.py', content=b'LIMIT = 1\n'),
    ),
    package_folder_paths=frozenset(
      {
        tmp_path / 'src/shop',
        tmp_path / 'src/shop/kernel',
        tmp_path / 'src/shop/kernel/__pycache__',
      },
    ),
  )


def test_should_read_a_file_when_a_path_names_one(tmp_path: Path) -> None:
  # Arrange
  write_files(tmp_path, FILES)

  # Act
  sources = python_sources([tmp_path / 'tests/test_money.py'])

  # Assert
  assert sources == Sources(
    files=(Source(path=tmp_path / 'tests/test_money.py', content=b''),),
    package_folder_paths=frozenset(),
  )


def test_should_read_nothing_when_a_path_names_a_file_of_another_language(tmp_path: Path) -> None:
  # Arrange
  write_files(tmp_path, FILES)

  # Act
  sources = python_sources([tmp_path / 'src/shop/kernel/data.json'])

  # Assert
  assert sources == Sources(files=(), package_folder_paths=frozenset())


def test_should_refuse_the_paths_when_they_name_no_file_or_folder(tmp_path: Path) -> None:
  # Arrange
  write_files(tmp_path, FILES)

  # Act
  with pytest.raises(MissingPathsError) as raised:
    python_sources([tmp_path / 'src', tmp_path / 'scr', tmp_path / 'test'])

  # Assert
  assert raised.value.paths == (tmp_path / 'scr', tmp_path / 'test')
