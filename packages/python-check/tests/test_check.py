from pathlib import Path

import pytest
from source_fixtures import function_of, python

from droneey_python_check.check import (
  ExitStatus,
  Source,
  Sources,
  exit_status,
  findings_of,
  paths_of,
)
from droneey_python_check.findings import Finding, Rule
from droneey_python_check.settings import Settings
from droneey_python_check.usage_error import Misuse, UsageError

SETTINGS = Settings(homes={'pydantic': ('adapters',)})


def _sources(files: dict[str, str]) -> Sources:
  return Sources(
    files=tuple(Source(path=Path(name), text=text.encode()) for name, text in files.items()),
    folders=frozenset({Path('src/shop'), Path('src/shop/kernel'), Path('src/shop/adapters')}),
  )


def test_should_find_nothing_when_every_file_keeps_the_rules() -> None:
  # Arrange
  sources = _sources(
    {
      'src/shop/__init__.py': '',
      'src/shop/kernel/money.py': python('from . import currency'),
      'src/shop/adapters/http/client.py': python('import pydantic'),
      'tests/test_money.py': function_of(200),
    },
  )

  # Act
  findings = findings_of(sources=sources, settings=SETTINGS)

  # Assert
  assert findings == ()


def test_should_find_each_rule_a_file_breaks_when_files_break_several() -> None:
  # Arrange
  sources = _sources(
    {
      'src/shop/kernel/money.py': python('from ..features import orders', 'import pydantic'),
      'src/shop/orders.py': function_of(101),
    },
  )

  # Act
  findings = findings_of(sources=sources, settings=SETTINGS)

  # Assert
  assert findings == (
    Finding(
      path=Path('src/shop/kernel/money.py'),
      line=1,
      rule=Rule.IMPORT_LEAVES_MODULE,
      values=('kernel',),
    ),
    Finding(
      path=Path('src/shop/kernel/money.py'),
      line=2,
      rule=Rule.PACKAGE_IN_PURE,
      values=('kernel', 'pydantic'),
    ),
    Finding(
      path=Path('src/shop/orders.py'),
      line=1,
      rule=Rule.FUNCTION_LINES,
      values=('tally', '101', '100'),
    ),
  )


def test_should_report_a_file_when_it_does_not_parse() -> None:
  # Arrange
  sources = _sources({'src/shop/orders.py': python('LIMIT = 1', 'def total(')})

  # Act
  findings = findings_of(sources=sources, settings=SETTINGS)

  # Assert
  assert findings == (
    Finding(
      path=Path('src/shop/orders.py'),
      line=2,
      rule=Rule.SYNTAX,
      values=("'(' was never closed",),
    ),
  )


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


@pytest.mark.parametrize(
  ('findings', 'status'),
  [
    pytest.param((), ExitStatus.PASSED, id='no finding'),
    pytest.param(
      (Finding(path=Path('src/shop/orders.py'), line=1, rule=Rule.IMPORT_CLIMBS_OUT),),
      ExitStatus.FAILED,
      id='a finding',
    ),
  ],
)
def test_should_end_with_the_status_of_the_findings(
  findings: tuple[Finding, ...], status: ExitStatus
) -> None:
  # Act
  ended = exit_status(findings)

  # Assert
  assert ended == status
