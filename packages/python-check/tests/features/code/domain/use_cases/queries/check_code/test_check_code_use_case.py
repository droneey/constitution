from pathlib import Path

from source_fixtures import function_of, python

from droneey_python_check.features.code.domain.entities import (
  Finding,
  Rule,
  Settings,
  Source,
  Sources,
)
from droneey_python_check.features.code.domain.use_cases import check_code

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
  findings = check_code(sources=sources, settings=SETTINGS)

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
  findings = check_code(sources=sources, settings=SETTINGS)

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
  findings = check_code(sources=sources, settings=SETTINGS)

  # Assert
  assert findings == (
    Finding(
      path=Path('src/shop/orders.py'),
      line=2,
      rule=Rule.SYNTAX,
      values=("'(' was never closed",),
    ),
  )
