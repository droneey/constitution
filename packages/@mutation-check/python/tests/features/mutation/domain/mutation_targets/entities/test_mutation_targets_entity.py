import pytest

from droneey_mutation_check_python.features.mutation.domain.mutant.entities import (
  Mutant,
  MutantName,
  MutantStatus,
)
from droneey_mutation_check_python.features.mutation.domain.mutation_targets.entities import (
  EveryFunction,
  Functions,
  MutantGlob,
  MutationTargets,
  covers,
  is_empty,
)

TOTAL_MUTANT = Mutant(name=MutantName('shop.orders.x_total__mutmut_1'), status=MutantStatus.KILLED)


@pytest.mark.parametrize(
  'targets',
  [
    pytest.param(EveryFunction(), id='every function'),
    pytest.param(Functions(globs=(MutantGlob('shop.orders.x_total__mutmut_*'),)), id='its glob'),
    pytest.param(
      Functions(
        globs=(
          MutantGlob('shop.orders.x_discount__mutmut_*'),
          MutantGlob('shop.orders.x_total__mutmut_*'),
        )
      ),
      id='its glob among several',
    ),
  ],
)
def test_should_cover_a_mutant_when_the_targets_name_its_function(
  targets: MutationTargets,
) -> None:
  # Act
  covered = covers(targets, TOTAL_MUTANT)

  # Assert
  assert covered


@pytest.mark.parametrize(
  'targets',
  [
    pytest.param(
      Functions(globs=(MutantGlob('shop.orders.x_discount__mutmut_*'),)), id='another function'
    ),
    pytest.param(
      Functions(globs=(MutantGlob('SHOP.ORDERS.X_TOTAL__MUTMUT_*'),)), id='a glob of another case'
    ),
    pytest.param(Functions(globs=()), id='no function'),
  ],
)
def test_should_not_cover_a_mutant_when_the_targets_miss_its_function(
  targets: MutationTargets,
) -> None:
  # Act
  covered = covers(targets, TOTAL_MUTANT)

  # Assert
  assert not covered


def test_should_be_empty_when_the_targets_name_no_function() -> None:
  # Act
  empty = is_empty(Functions(globs=()))

  # Assert
  assert empty


@pytest.mark.parametrize(
  'targets',
  [
    pytest.param(Functions(globs=(MutantGlob('shop.orders.x_total__mutmut_*'),)), id='a function'),
    pytest.param(EveryFunction(), id='every function'),
  ],
)
def test_should_not_be_empty_when_the_targets_name_a_function(targets: MutationTargets) -> None:
  # Act
  empty = is_empty(targets)

  # Assert
  assert not empty
