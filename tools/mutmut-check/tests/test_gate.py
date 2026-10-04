import io
from pathlib import Path

import pytest
from changes_fixtures import FILES
from mutmut_check.gate import Completed, check, python_sources
from runner_fake import DIFF, MUTMUT, UNTRACKED, RunnerFake, workspace_of

TOTAL_CHANGED = Completed(
  status=0,
  output='+++ b/src/shop/orders.py\n@@ -5 +5 @@ def total\n',
)
TOTAL = 'shop.orders.x_total__mutmut_*'
RESULTS = Completed(
  status=0,
  output=(
    '    shop.orders.x_total__mutmut_1: survived\n'
    '    shop.orders.x_total__mutmut_2: no tests\n'
    '    shop.orders.x_total__mutmut_3: caught by type check\n'
    '    shop.orders.x_total__mutmut_4: killed\n'
    '    shop.orders.x_total__mutmut_5: skipped\n'
    '    shop.orders.x_discount__mutmut_1: not checked\n'
    '    shop.orders.x_discount__mutmut_2: survived\n'
  ),
)
KILLED = Completed(
  status=0,
  output=(
    '    shop.orders.x_total__mutmut_1: killed\n    shop.orders.x_discount__mutmut_1: not checked\n'
  ),
)


def _check(
  *, arguments: list[str], answers: dict[tuple[str, ...], Completed]
) -> tuple[int, str, RunnerFake]:
  runner = RunnerFake(answers=answers)
  output = io.StringIO()
  status = check(arguments, workspace=workspace_of(runner=runner, files=FILES, output=output))

  return status, output.getvalue(), runner


def test_should_pass_without_mutmut_when_no_function_changed() -> None:
  # Arrange
  answers: dict[tuple[str, ...], Completed] = {}

  # Act
  status, output, runner = _check(arguments=[], answers=answers)

  # Assert
  assert (status, output, runner.commands, runner.cleared) == (
    0,
    'mutation: no function to mutate changed\n',
    [DIFF, UNTRACKED],
    0,
  )


def test_should_pass_when_every_mutant_of_the_changed_functions_is_killed() -> None:
  # Arrange
  answers = {DIFF: TOTAL_CHANGED, (*MUTMUT, 'results'): KILLED}

  # Act
  status, output, runner = _check(arguments=[], answers=answers)

  # Assert
  assert (status, output, runner.commands, runner.cleared) == (
    0,
    'mutation: every mutant killed\n',
    [DIFF, UNTRACKED, (*MUTMUT, 'run', TOTAL), (*MUTMUT, 'results')],
    1,
  )


def test_should_fail_with_each_mutant_of_the_changed_functions_not_killed() -> None:
  # Arrange
  answers = {DIFF: TOTAL_CHANGED, (*MUTMUT, 'results'): RESULTS}

  # Act
  status, output, _ = _check(arguments=[], answers=answers)

  # Assert
  assert (status, output) == (
    1,
    (
      'mutation: shop.orders.x_total__mutmut_1: survived\n'
      'mutation: shop.orders.x_total__mutmut_2: no tests\n'
    ),
  )


def test_should_fail_with_every_mutant_not_killed_when_all_are_mutated() -> None:
  # Arrange
  answers: dict[tuple[str, ...], Completed] = {(*MUTMUT, 'results'): RESULTS}

  # Act
  status, output, runner = _check(arguments=['all'], answers=answers)

  # Assert
  assert (status, output, runner.commands) == (
    1,
    (
      'mutation: shop.orders.x_total__mutmut_1: survived\n'
      'mutation: shop.orders.x_total__mutmut_2: no tests\n'
      'mutation: shop.orders.x_discount__mutmut_2: survived\n'
    ),
    [(*MUTMUT, 'run'), (*MUTMUT, 'results')],
  )


@pytest.mark.parametrize(
  'stop',
  [
    pytest.param(
      'AssertionError: Filtered for specific mutants, but nothing matches\n', id='no match'
    ),
    pytest.param(
      'Stopping early, because we could not find any test case for any mutant.\n', id='no test'
    ),
  ],
)
def test_should_pass_when_the_changed_functions_hold_nothing_to_mutate(stop: str) -> None:
  # Arrange
  answers = {
    DIFF: TOTAL_CHANGED,
    (*MUTMUT, 'run', TOTAL): Completed(status=1, output=stop),
    (*MUTMUT, 'results'): Completed(
      status=0, output='    shop.orders.x_discount__mutmut_1: not checked\n'
    ),
  }

  # Act
  status, output, _ = _check(arguments=[], answers=answers)

  # Assert
  assert (status, output) == (0, 'mutation: the functions hold nothing to mutate\n')


def test_should_fail_with_the_changed_mutants_when_mutmut_stops_before_running_them() -> None:
  # Arrange
  answers = {
    DIFF: TOTAL_CHANGED,
    (*MUTMUT, 'run', TOTAL): Completed(
      status=1,
      output='Stopping early, because we could not find any test case for any mutant.\n',
    ),
    (*MUTMUT, 'results'): Completed(
      status=0,
      output=(
        '    shop.orders.x_total__mutmut_1: not checked\n'
        '    shop.orders.x_discount__mutmut_1: not checked\n'
      ),
    ),
  }

  # Act
  status, output, _ = _check(arguments=[], answers=answers)

  # Assert
  assert (status, output) == (1, 'mutation: shop.orders.x_total__mutmut_1: not checked\n')


def test_should_fail_with_its_output_when_mutmut_fails() -> None:
  # Arrange
  answers = {
    DIFF: TOTAL_CHANGED,
    (*MUTMUT, 'run', TOTAL): Completed(status=1, output='failed to run the clean tests\n'),
  }

  # Act
  status, output, runner = _check(arguments=[], answers=answers)

  # Assert
  assert (status, output, runner.commands[-1]) == (
    1,
    'failed to run the clean tests\n',
    (*MUTMUT, 'run', TOTAL),
  )


def test_should_raise_when_git_fails() -> None:
  # Arrange
  answers = {DIFF: Completed(status=128, output='fatal: bad revision origin/main\n')}

  # Act
  with pytest.raises(
    RuntimeError, match=r'git diff .* failed: fatal: bad revision origin/main'
  ) as raised:
    _check(arguments=[], answers=answers)

  # Assert
  assert raised.type is RuntimeError


def test_should_list_the_python_files_under_src_relative_to_the_package(tmp_path: Path) -> None:
  # Arrange
  for name in (
    'src/shop/orders.py',
    'src/shop/kernel/money.py',
    'src/shop/data.json',
    'tests/test_orders.py',
  ):
    (tmp_path / name).parent.mkdir(parents=True, exist_ok=True)
    (tmp_path / name).write_text('', encoding='utf-8')

  # Act
  sources = python_sources(tmp_path)

  # Assert
  assert sources == (Path('src/shop/kernel/money.py'), Path('src/shop/orders.py'))
