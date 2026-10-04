import ast
from pathlib import Path

import pytest
from python_check.findings import Finding
from python_check.lines import line_findings
from source_fixtures import function_of, python


def _findings(*, path: str, source: str) -> tuple[Finding, ...]:
  return line_findings(path=Path(path), tree=ast.parse(source), lines=len(source.splitlines()))


@pytest.mark.parametrize(
  ('path', 'source'),
  [
    pytest.param('src/shop/orders.py', function_of(100), id='a function of 100 lines'),
    pytest.param('src/shop/orders.py', python('LIMIT = 1') * 500, id='a file of 500 lines'),
    pytest.param('tests/test_orders.py', function_of(101), id='a long function in a spec'),
    pytest.param(
      'tests/orders_fixtures.py', python('LIMIT = 1') * 501, id='a long helper of specs'
    ),
  ],
)
def test_should_find_nothing_when_the_code_keeps_the_limits(path: str, source: str) -> None:
  # Arrange
  code = source

  # Act
  findings = _findings(path=path, source=code)

  # Assert
  assert findings == ()


def test_should_report_a_function_when_it_holds_more_than_100_lines() -> None:
  # Arrange
  source = python('LIMIT = 1', '', '', 'async ' + function_of(101))

  # Act
  findings = _findings(path='src/shop/orders.py', source=source)

  # Assert
  assert findings == (
    Finding(
      path=Path('src/shop/orders.py'),
      line=4,
      message='tally holds 101 lines, more than 100',
    ),
  )


def test_should_report_the_file_when_it_holds_more_than_500_lines() -> None:
  # Arrange
  source = python('LIMIT = 1') * 501

  # Act
  findings = _findings(path='src/shop/orders.py', source=source)

  # Assert
  assert findings == (
    Finding(
      path=Path('src/shop/orders.py'),
      line=1,
      message='the file holds 501 lines, more than 500',
    ),
  )
