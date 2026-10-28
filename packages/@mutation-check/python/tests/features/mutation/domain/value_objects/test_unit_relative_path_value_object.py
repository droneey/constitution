from pathlib import PurePosixPath
from typing import Final

import pytest
from hypothesis import example, given
from hypothesis import strategies as st

from droneey_mutation_check_python.features.mutation.domain.errors import (
  InvalidValueError,
  ValueFailure,
)
from droneey_mutation_check_python.features.mutation.domain.value_objects import UnitRelativePath

# A name of a folder or a file: no separator, no NUL, never `.` or `..`.
SEGMENTS: Final = st.text(
  alphabet=st.characters(exclude_characters='/\0'), min_size=1, max_size=12
).filter(lambda segment: segment not in {'.', '..'})
SEGMENT_LISTS: Final = st.lists(SEGMENTS, max_size=4)
PATHS_IN_THE_UNIT: Final = st.lists(SEGMENTS, min_size=1, max_size=4).map(
  lambda segments: PurePosixPath(*segments)
)
PATHS_OUT_OF_THE_UNIT: Final = st.tuples(SEGMENT_LISTS, SEGMENT_LISTS).map(
  lambda halves: PurePosixPath(*halves[0], '..', *halves[1])
)
ABSOLUTE_PATHS: Final = PATHS_IN_THE_UNIT.map(lambda path: PurePosixPath('/') / path)


@given(path=PATHS_IN_THE_UNIT)
@example(path=PurePosixPath('src/shop/orders.py'))
def test_should_hold_any_path_that_stays_in_the_unit(path: PurePosixPath) -> None:
  # Act
  held = UnitRelativePath(path=path)

  # Assert
  assert held.path == path


@given(path=PATHS_OUT_OF_THE_UNIT)
@example(path=PurePosixPath('../other/orders.py'))
def test_should_refuse_any_path_that_climbs_out_of_the_unit(path: PurePosixPath) -> None:
  # Act
  with pytest.raises(InvalidValueError) as refused:
    UnitRelativePath(path=path)

  # Assert
  assert (refused.value.code, refused.value.text) == (
    ValueFailure.PATH_OUT_OF_UNIT,
    path.as_posix(),
  )


@given(path=ABSOLUTE_PATHS)
@example(path=PurePosixPath('/repository/src/shop/orders.py'))
def test_should_refuse_any_absolute_path(path: PurePosixPath) -> None:
  # Act
  with pytest.raises(InvalidValueError) as refused:
    UnitRelativePath(path=path)

  # Assert
  assert (refused.value.code, refused.value.text) == (ValueFailure.ABSOLUTE_PATH, path.as_posix())
