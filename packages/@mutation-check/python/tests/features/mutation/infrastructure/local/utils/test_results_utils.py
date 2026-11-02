import pytest

from droneey_mutation_check_python.features.mutation.domain.mutant.entities import (
  Mutant,
  MutantName,
  MutantStatus,
)
from droneey_mutation_check_python.features.mutation.infrastructure.local.utils import read_mutants


@pytest.mark.parametrize(
  ('text', 'status'),
  [
    pytest.param('killed', MutantStatus.KILLED, id='killed'),
    pytest.param('caught by type check', MutantStatus.CAUGHT_BY_TYPE_CHECK, id='caught by type'),
    pytest.param('skipped', MutantStatus.SKIPPED, id='skipped'),
    pytest.param('not checked', MutantStatus.NOT_CHECKED, id='not checked'),
    pytest.param('survived', MutantStatus.SURVIVED, id='survived'),
    pytest.param('no tests', MutantStatus.NO_TESTS, id='no tests'),
    pytest.param('timeout', MutantStatus.TIMEOUT, id='timeout'),
    pytest.param('suspicious', MutantStatus.SUSPICIOUS, id='suspicious'),
    pytest.param('segfault', MutantStatus.SEGFAULT, id='segfault'),
    pytest.param(
      'check was interrupted by user', MutantStatus.INTERRUPTED, id='interrupted by the user'
    ),
    pytest.param('sabotaged', MutantStatus.UNKNOWN, id='a status mutmut adds later'),
  ],
)
def test_should_read_each_mutant_with_its_status(text: str, status: MutantStatus) -> None:
  # Arrange
  results_output = f'    shop.orders.x_total__mutmut_1: {text}\n'

  # Act
  mutants = read_mutants(results_output)

  # Assert
  assert mutants == (Mutant(name=MutantName('shop.orders.x_total__mutmut_1'), status=status),)
