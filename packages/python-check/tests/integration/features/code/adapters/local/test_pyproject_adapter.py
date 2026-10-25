from typing import TYPE_CHECKING

import pytest
from source_fixtures import write_files

from droneey_python_check.features.code.adapters.local import toml_document

if TYPE_CHECKING:
  from pathlib import Path


@pytest.mark.parametrize(
  ('files', 'document'),
  [
    pytest.param(
      {'pyproject.toml': '[tool]\nname = "shop"\n'}, {'tool': {'name': 'shop'}}, id='a file'
    ),
    pytest.param({}, None, id='no file'),
  ],
)
def test_should_read_a_toml_document(
  *, tmp_path: Path, files: dict[str, str], document: object
) -> None:
  # Arrange
  write_files(tmp_path, files)

  # Act
  read = toml_document(tmp_path / 'pyproject.toml')

  # Assert
  assert read == document
