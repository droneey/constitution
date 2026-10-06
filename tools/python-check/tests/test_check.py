import io
from pathlib import Path

from python_check.check import run
from python_check.settings import Settings
from source_fixtures import function_of, python, write_files


def _run(*, folder: Path, arguments: list[str]) -> tuple[int, str]:
  output = io.StringIO()
  status = run(
    [str(folder / argument) for argument in arguments],
    output=output,
    settings=Settings(homes={'pydantic': ('adapters',)}),
  )

  return status, output.getvalue()


def test_should_pass_when_every_file_keeps_the_rules(tmp_path: Path) -> None:
  # Arrange
  write_files(
    tmp_path,
    {
      'src/shop/__init__.py': '',
      'src/shop/kernel/money.py': python('from . import currency'),
      'src/shop/adapters/http/client.py': python('import pydantic'),
      'tests/test_money.py': function_of(200),
    },
  )

  # Act
  outcome = _run(folder=tmp_path, arguments=['src', 'tests'])

  # Assert
  assert outcome == (0, '')


def test_should_fail_with_each_finding_when_files_break_the_rules(tmp_path: Path) -> None:
  # Arrange
  write_files(
    tmp_path,
    {
      'src/shop/kernel/money.py': python('from ..features import orders', 'import pydantic'),
      'src/shop/kernel/__pycache__/stale.py': function_of(101),
      'src/shop/orders.py': function_of(101),
    },
  )

  # Act
  outcome = _run(folder=tmp_path, arguments=['src'])

  # Assert
  assert outcome == (
    1,
    (
      f'{tmp_path}/src/shop/kernel/money.py:1: '
      'a relative import leaves its module, kernel; import it by its absolute path\n'
      f'{tmp_path}/src/shop/kernel/money.py:2: kernel imports no package, and pydantic is one\n'
      f'{tmp_path}/src/shop/orders.py:1: tally holds 101 lines, more than 100\n'
    ),
  )


def test_should_check_a_file_when_a_path_names_one(tmp_path: Path) -> None:
  # Arrange
  write_files(tmp_path, {'src/shop/orders.py': function_of(101)})

  # Act
  outcome = _run(folder=tmp_path, arguments=['src/shop/orders.py'])

  # Assert
  assert outcome == (1, f'{tmp_path}/src/shop/orders.py:1: tally holds 101 lines, more than 100\n')


def test_should_print_its_usage_when_no_path_is_given() -> None:
  # Arrange
  output = io.StringIO()

  # Act
  status = run([], output=output, settings=Settings())

  # Assert
  assert (status, output.getvalue()) == (2, 'usage: python-check <path>...\n')


def test_should_report_a_file_when_it_does_not_parse(tmp_path: Path) -> None:
  # Arrange
  write_files(tmp_path, {'src/shop/orders.py': python('LIMIT = 1', 'def total(')})

  # Act
  outcome = _run(folder=tmp_path, arguments=['src'])

  # Assert
  assert outcome == (
    1,
    f"{tmp_path}/src/shop/orders.py:2: the file does not parse: '(' was never closed\n",
  )
