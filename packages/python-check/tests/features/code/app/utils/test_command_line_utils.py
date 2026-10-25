from pathlib import Path

import pytest

from droneey_python_check.features.code.app.utils import paths_of
from droneey_python_check.features.code.domain.errors import Misuse, UsageError


def test_should_take_each_path_the_command_line_names() -> None:
  # Arrange
  arguments = ['src', 'tests/test_money.py']

  # Act
  paths = paths_of(arguments)

  # Assert
  assert paths == (Path('src'), Path('tests/test_money.py'))


def test_should_refuse_a_command_line_when_it_names_no_path() -> None:
  # Arrange
  arguments: list[str] = []

  # Act
  with pytest.raises(UsageError) as raised:
    paths_of(arguments)

  # Assert
  assert (raised.value.code, raised.value.paths) == (Misuse.NO_PATH, ())
