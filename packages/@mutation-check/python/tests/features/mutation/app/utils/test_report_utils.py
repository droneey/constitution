import pytest

from droneey_mutation_check_python.features.mutation.app.constants import ExitStatus
from droneey_mutation_check_python.features.mutation.app.utils import exit_status, render
from droneey_mutation_check_python.features.mutation.domain.entities import (
  Broken,
  Mutant,
  Outcome,
  Pass,
  Passed,
  Survived,
)

SURVIVED = Survived(
  mutants=(
    Mutant(name='shop.orders.x_total__mutmut_1', status='survived'),
    Mutant(name='shop.orders.x_total__mutmut_2', status='no tests'),
  ),
)


# The one table of the gate's report: its wording is pinned here alone.
@pytest.mark.parametrize(
  ('outcome', 'report'),
  [
    pytest.param(
      Passed(why=Pass.UNCHANGED),
      'mutation: unchanged: no function to mutate changed\n',
      id='no function changed',
    ),
    pytest.param(
      Passed(why=Pass.KILLED), 'mutation: killed: every mutant killed\n', id='every mutant killed'
    ),
    pytest.param(
      Passed(why=Pass.EMPTY),
      'mutation: empty: the functions hold nothing to mutate\n',
      id='nothing to mutate',
    ),
    pytest.param(
      SURVIVED,
      (
        'mutation: not-killed: shop.orders.x_total__mutmut_1: survived\n'
        'mutation: not-killed: shop.orders.x_total__mutmut_2: no tests\n'
      ),
      id='mutants not killed',
    ),
    pytest.param(
      Broken(output='failed to run the clean tests\n'),
      'failed to run the clean tests\n',
      id='mutmut failed',
    ),
  ],
)
def test_should_report_the_outcome(outcome: Outcome, report: str) -> None:
  # Act
  shown = render(outcome)

  # Assert
  assert shown == report


@pytest.mark.parametrize(
  ('outcome', 'status'),
  [
    pytest.param(Passed(why=Pass.KILLED), ExitStatus.PASSED, id='a pass'),
    pytest.param(SURVIVED, ExitStatus.FAILED, id='mutants not killed'),
    pytest.param(Broken(output=''), ExitStatus.FAILED, id='mutmut failed'),
  ],
)
def test_should_end_with_the_status_of_the_outcome(outcome: Outcome, status: ExitStatus) -> None:
  # Act
  ended = exit_status(outcome)

  # Assert
  assert ended == status
