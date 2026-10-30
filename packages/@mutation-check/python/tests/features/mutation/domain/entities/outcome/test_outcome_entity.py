from typing import Final

import pytest

from droneey_mutation_check_python.features.mutation.domain.entities import (
  Broken,
  EveryFunction,
  Functions,
  Mutant,
  MutantGlob,
  MutantName,
  MutantStatus,
  MutationRun,
  MutationTargets,
  Outcome,
  Passed,
  PassReason,
  Ran,
  Stopped,
  Survived,
  outcome_of,
)

TOTAL_TARGETS: Final = Functions(globs=(MutantGlob('shop.orders.x_total__mutmut_*'),))
DISCOUNT_SURVIVED: Final = Mutant(
  name=MutantName('shop.orders.x_discount__mutmut_1'), status=MutantStatus.SURVIVED
)


def _total_mutant(status: MutantStatus) -> Mutant:
  return Mutant(name=MutantName('shop.orders.x_total__mutmut_1'), status=status)


@pytest.mark.parametrize(
  ('status', 'outcome'),
  [
    pytest.param(MutantStatus.KILLED, Passed(reason=PassReason.KILLED), id='killed'),
    pytest.param(
      MutantStatus.CAUGHT_BY_TYPE_CHECK,
      Passed(reason=PassReason.KILLED),
      id='caught by the type check',
    ),
    pytest.param(MutantStatus.SKIPPED, Passed(reason=PassReason.KILLED), id='skipped'),
    pytest.param(MutantStatus.NOT_CHECKED, Passed(reason=PassReason.KILLED), id='not checked'),
    pytest.param(
      MutantStatus.SURVIVED,
      Survived(mutants=(_total_mutant(MutantStatus.SURVIVED),)),
      id='survived',
    ),
    pytest.param(
      MutantStatus.NO_TESTS,
      Survived(mutants=(_total_mutant(MutantStatus.NO_TESTS),)),
      id='no tests',
    ),
    pytest.param(
      MutantStatus.TIMEOUT, Survived(mutants=(_total_mutant(MutantStatus.TIMEOUT),)), id='timed out'
    ),
    pytest.param(
      MutantStatus.SUSPICIOUS,
      Survived(mutants=(_total_mutant(MutantStatus.SUSPICIOUS),)),
      id='suspicious',
    ),
    pytest.param(
      MutantStatus.SEGFAULT,
      Survived(mutants=(_total_mutant(MutantStatus.SEGFAULT),)),
      id='a segfault',
    ),
    pytest.param(
      MutantStatus.INTERRUPTED,
      Survived(mutants=(_total_mutant(MutantStatus.INTERRUPTED),)),
      id='interrupted',
    ),
    pytest.param(
      MutantStatus.UNKNOWN,
      Survived(mutants=(_total_mutant(MutantStatus.UNKNOWN),)),
      id='a status mutmut adds later',
    ),
  ],
)
def test_should_count_a_targeted_mutant_as_killed_by_its_status(
  status: MutantStatus, outcome: Outcome
) -> None:
  # Act
  answered = outcome_of(Ran(mutants=(_total_mutant(status),)), TOTAL_TARGETS)

  # Assert
  assert answered == outcome


@pytest.mark.parametrize(
  ('run', 'targets', 'outcome'),
  [
    pytest.param(
      Ran(mutants=(DISCOUNT_SURVIVED,)),
      TOTAL_TARGETS,
      Passed(reason=PassReason.KILLED),
      id='a mutant outside the targets',
    ),
    pytest.param(
      Ran(mutants=(_total_mutant(MutantStatus.SURVIVED), DISCOUNT_SURVIVED)),
      EveryFunction(),
      Survived(mutants=(_total_mutant(MutantStatus.SURVIVED), DISCOUNT_SURVIVED)),
      id='every function targeted',
    ),
    pytest.param(
      Stopped(
        mutants=(
          Mutant(
            name=MutantName('shop.orders.x_discount__mutmut_1'), status=MutantStatus.NOT_CHECKED
          ),
        )
      ),
      TOTAL_TARGETS,
      Passed(reason=PassReason.NOTHING_TO_MUTATE),
      id='mutmut stopped with nothing to mutate',
    ),
    pytest.param(
      Stopped(mutants=(_total_mutant(MutantStatus.NOT_CHECKED),)),
      TOTAL_TARGETS,
      Survived(mutants=(_total_mutant(MutantStatus.NOT_CHECKED),)),
      id='mutmut stopped before running the targeted mutants',
    ),
    pytest.param(
      Broken(output='failed to run the clean tests\n'),
      TOTAL_TARGETS,
      Broken(output='failed to run the clean tests\n'),
      id='mutmut failed',
    ),
  ],
)
def test_should_answer_how_the_targeted_mutants_fared(
  run: MutationRun, targets: MutationTargets, outcome: Outcome
) -> None:
  # Act
  answered = outcome_of(run, targets)

  # Assert
  assert answered == outcome
