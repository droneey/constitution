import pytest
from changes_fixtures import changed, new

from droneey_mutation_check_python.features.mutation.domain.changes.entities import (
  FileChange,
  touches,
)


@pytest.mark.parametrize(
  'file',
  [
    pytest.param(new('src/shop/orders.py'), id='a new file'),
    pytest.param(changed('src/shop/orders.py', range(4, 5)), id='the first line'),
    pytest.param(changed('src/shop/orders.py', range(6, 7)), id='the last line'),
    pytest.param(changed('src/shop/orders.py', range(5, 6)), id='a line between'),
    pytest.param(changed('src/shop/orders.py', range(1, 10)), id='a range around them'),
    pytest.param(
      changed('src/shop/orders.py', range(1, 2), range(6, 8)), id='one of several ranges'
    ),
  ],
)
def test_should_touch_the_lines_when_a_change_overlaps_them(file: FileChange) -> None:
  # Act
  touched = touches(file, first_line=4, last_line=6)

  # Assert
  assert touched


@pytest.mark.parametrize(
  'file',
  [
    pytest.param(changed('src/shop/orders.py', range(3, 4)), id='the line before'),
    pytest.param(changed('src/shop/orders.py', range(7, 8)), id='the line after'),
    pytest.param(changed('src/shop/orders.py'), id='no range'),
  ],
)
def test_should_not_touch_the_lines_when_a_change_misses_them(file: FileChange) -> None:
  # Act
  touched = touches(file, first_line=4, last_line=6)

  # Assert
  assert not touched
