from pathlib import Path
from typing import Final

import pytest

from droneey_python_check.features.code import ExitStatus, error_status, render_error
from droneey_python_check.features.code.app.errors import Misuse, UsageError
from droneey_python_check.features.code.domain.errors import (
  Expected,
  MalformedFile,
  MissingPart,
  MissingPathsError,
  SettingsError,
  UnknownKey,
  WrongShape,
)

ERRORS_GOLDEN_PATH: Final = Path(__file__).with_name('errors.golden.txt')
USAGE_ERROR: Final = UsageError(code=Misuse.NO_PATH)
MISSING_PATHS_ERROR: Final = MissingPathsError((Path('scr'), Path('test')))
SETTINGS_ERROR: Final = SettingsError(
  (
    WrongShape(path_from_unit='pyproject.toml', dotted_key='tool.uv', expected=Expected.TABLE),
    WrongShape(
      path_from_unit='parts/a.toml', dotted_key='homes.httpx', expected=Expected.LIST_OF_TEXT
    ),
    UnknownKey(path_from_unit='pyproject.toml', dotted_key='tool.python-check.home'),
    MissingPart(path_from_unit='parts/b.toml'),
    MalformedFile(
      path_from_unit='parts/c.toml', parser_message="Expected ']' (at line 1, column 7)"
    ),
  )
)
OWN_ERROR: Final = RuntimeError('boom')


def test_should_report_the_errors_as_the_golden_file_shows_them() -> None:
  # Act
  report = ''.join(map(render_error, (USAGE_ERROR, MISSING_PATHS_ERROR, SETTINGS_ERROR, OWN_ERROR)))

  # Assert
  assert report == ERRORS_GOLDEN_PATH.read_text(encoding='utf-8')


@pytest.mark.parametrize(
  ('error', 'status'),
  [
    pytest.param(USAGE_ERROR, ExitStatus.USAGE, id='a command line that names no path'),
    pytest.param(MISSING_PATHS_ERROR, ExitStatus.USAGE, id='a path that names nothing'),
    pytest.param(SETTINGS_ERROR, ExitStatus.SETTINGS, id='settings of the wrong shape'),
    pytest.param(OWN_ERROR, ExitStatus.DEFECT, id='an error of its own'),
  ],
)
def test_should_end_with_the_status_of_the_error(error: Exception, status: ExitStatus) -> None:
  # Act
  ended = error_status(error)

  # Assert
  assert ended == status
