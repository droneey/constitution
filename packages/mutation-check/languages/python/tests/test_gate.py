import pytest
from changes_fixtures import FILES
from workspace_fake import DIFF, MUTMUT, UNTRACKED, WorkspaceFake

from droneey_mutation_check.check_error import CheckError, Failure
from droneey_mutation_check.gate import Completed, check
from droneey_mutation_check.outcome import Broken, Mutant, Outcome, Pass, Passed, Survived

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
) -> tuple[Outcome, WorkspaceFake]:
  workspace = WorkspaceFake(answers=answers, files=FILES)

  return check(arguments, workspace=workspace), workspace


def test_should_pass_without_mutmut_when_no_function_changed() -> None:
  # Arrange
  answers: dict[tuple[str, ...], Completed] = {}

  # Act
  outcome, workspace = _check(arguments=[], answers=answers)

  # Assert
  assert (outcome, workspace.commands, workspace.cleared) == (
    Passed(why=Pass.UNCHANGED),
    [DIFF, UNTRACKED],
    0,
  )


def test_should_pass_and_remove_the_mutants_when_every_changed_mutant_is_killed() -> None:
  # Arrange
  answers = {DIFF: TOTAL_CHANGED, (*MUTMUT, 'results'): KILLED}

  # Act
  outcome, workspace = _check(arguments=[], answers=answers)

  # Assert
  assert (outcome, workspace.commands, workspace.cleared) == (
    Passed(why=Pass.KILLED),
    [DIFF, UNTRACKED, (*MUTMUT, 'run', TOTAL), (*MUTMUT, 'results')],
    2,
  )


def test_should_fail_and_keep_the_mutants_when_a_changed_mutant_is_not_killed() -> None:
  # Arrange
  answers = {DIFF: TOTAL_CHANGED, (*MUTMUT, 'results'): RESULTS}

  # Act
  outcome, workspace = _check(arguments=[], answers=answers)

  # Assert
  assert (outcome, workspace.cleared) == (
    Survived(
      mutants=(
        Mutant(name='shop.orders.x_total__mutmut_1', status='survived'),
        Mutant(name='shop.orders.x_total__mutmut_2', status='no tests'),
      ),
    ),
    1,
  )


def test_should_fail_with_every_mutant_not_killed_when_all_are_mutated() -> None:
  # Arrange
  answers: dict[tuple[str, ...], Completed] = {(*MUTMUT, 'results'): RESULTS}

  # Act
  outcome, workspace = _check(arguments=['all'], answers=answers)

  # Assert
  assert (outcome, workspace.commands) == (
    Survived(
      mutants=(
        Mutant(name='shop.orders.x_total__mutmut_1', status='survived'),
        Mutant(name='shop.orders.x_total__mutmut_2', status='no tests'),
        Mutant(name='shop.orders.x_discount__mutmut_2', status='survived'),
      ),
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
  outcome, _ = _check(arguments=[], answers=answers)

  # Assert
  assert outcome == Passed(why=Pass.EMPTY)


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
  outcome, _ = _check(arguments=[], answers=answers)

  # Assert
  assert outcome == Survived(
    mutants=(Mutant(name='shop.orders.x_total__mutmut_1', status='not checked'),),
  )


def test_should_fail_with_its_output_when_mutmut_fails() -> None:
  # Arrange
  answers = {
    DIFF: TOTAL_CHANGED,
    (*MUTMUT, 'run', TOTAL): Completed(status=1, output='failed to run the clean tests\n'),
  }

  # Act
  outcome, workspace = _check(arguments=[], answers=answers)

  # Assert
  assert (outcome, workspace.commands[-1]) == (
    Broken(output='failed to run the clean tests\n'),
    (*MUTMUT, 'run', TOTAL),
  )


def test_should_stop_with_the_command_when_git_fails() -> None:
  # Arrange
  answers = {DIFF: Completed(status=128, output='fatal: bad revision origin/main\n')}

  # Act
  with pytest.raises(CheckError) as raised:
    _check(arguments=[], answers=answers)

  # Assert
  assert (raised.value.code, raised.value.command, raised.value.output) == (
    Failure.GIT_FAILED,
    DIFF,
    'fatal: bad revision origin/main\n',
  )
