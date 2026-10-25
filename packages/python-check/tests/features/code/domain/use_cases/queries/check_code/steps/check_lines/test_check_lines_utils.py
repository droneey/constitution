import ast
from pathlib import Path

import pytest
from source_fixtures import function_of, python

from droneey_python_check.features.code.domain.entities import Finding, Rule
from droneey_python_check.features.code.domain.use_cases.queries.check_code.steps import check_lines


def _findings(*, path: str, source: str) -> tuple[Finding, ...]:
  return check_lines(path=Path(path), tree=ast.parse(source), source=source.encode())


@pytest.mark.parametrize(
  ('path', 'source'),
  [
    pytest.param('src/shop/orders.py', function_of(100), id='a function of 100 lines'),
    pytest.param('src/shop/orders.py', python('LIMIT = 1') * 500, id='a file of 500 lines'),
    pytest.param('tests/test_orders.py', function_of(101), id='a long function in a spec'),
    pytest.param(
      'tests/orders_fixtures.py', python('LIMIT = 1') * 501, id='a long helper of specs'
    ),
    pytest.param('src/shop/orders_gen.py', python('LIMIT = 1') * 501, id='a generated file'),
    pytest.param(
      'src/shop/schema_gen/orders.py', python('LIMIT = 1') * 501, id='a generated folder'
    ),
    pytest.param(
      'src/shop/orders.py',
      function_of(101).replace(':', ':  # python-check: ignore[function-lines] -- a table', 1),
      id='a function that lifts its limit with a reason',
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
      rule=Rule.FUNCTION_LINES,
      values=('tally', '101', '100'),
    ),
  )


def test_should_report_a_function_when_it_lifts_its_limit_without_a_reason() -> None:
  # Arrange
  source = function_of(101).replace(':', ':  # python-check: ignore[function-lines] --', 1)

  # Act
  findings = _findings(path='src/shop/orders.py', source=source)

  # Assert
  assert findings == (
    Finding(
      path=Path('src/shop/orders.py'),
      line=1,
      rule=Rule.FUNCTION_LINES,
      values=('tally', '101', '100'),
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
      rule=Rule.FILE_LINES,
      values=('501', '500'),
    ),
  )
