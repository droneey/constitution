import re
from typing import Final

import pytest

from droneey_mutation_check_python.features.mutation import ExitStatus, run_check_mutants
from droneey_mutation_check_python.features.mutation.app.errors import Misuse, UsageError
from droneey_mutation_check_python.features.mutation.domain.entities import (
  Broken,
  Mutant,
  MutantName,
  MutantStatus,
  Outcome,
  Passed,
  PassReason,
  Scope,
  Survived,
)

PASSED = Passed(reason=PassReason.KILLED)
SURVIVED = Survived(
  mutants=(Mutant(name=MutantName('shop.orders.x_total__mutmut_1'), status=MutantStatus.SURVIVED),)
)


REPORT_CODE: Final = re.compile(r'^mutation: (?P<code>[a-z-]+): ', re.MULTILINE)


def _report_codes(written: list[str]) -> list[str]:
  return [match['code'] for match in REPORT_CODE.finditer(''.join(written))]


class _RecordingCheck:
  def __init__(self, outcome: Outcome) -> None:
    self.outcome = outcome
    self.checked_scopes: list[Scope] = []

  def __call__(self, scope: Scope) -> Outcome:
    self.checked_scopes.append(scope)

    return self.outcome


@pytest.mark.parametrize(
  ('arguments', 'scope'),
  [
    pytest.param([], Scope.CHANGED, id='no argument'),
    pytest.param(['all'], Scope.ALL, id='all'),
  ],
)
def test_should_check_the_scope_the_command_line_names(arguments: list[str], scope: Scope) -> None:
  # Arrange
  check_mutants = _RecordingCheck(PASSED)

  # Act
  run_check_mutants(arguments=arguments, check_mutants=check_mutants, write=lambda _text: None)

  # Assert
  assert check_mutants.checked_scopes == [scope]


@pytest.mark.parametrize(
  ('outcome', 'codes', 'status'),
  [
    pytest.param(PASSED, ['killed'], ExitStatus.PASSED, id='a pass'),
    pytest.param(SURVIVED, ['not-killed'], ExitStatus.FAILED, id='a mutant not killed'),
    pytest.param(
      Broken(output='failed to run the clean tests\n'),
      ['mutmut-failed'],
      ExitStatus.FAILED,
      id='mutmut failed',
    ),
  ],
)
def test_should_write_the_report_of_the_outcome_and_end_with_its_status(
  outcome: Outcome, codes: list[str], status: ExitStatus
) -> None:
  # Arrange
  written: list[str] = []

  # Act
  ended = run_check_mutants(
    arguments=[], check_mutants=_RecordingCheck(outcome), write=written.append
  )

  # Assert
  assert (_report_codes(written), ended) == (codes, status)


@pytest.mark.parametrize(
  'arguments',
  [
    pytest.param(['al'], id='a word the check does not take'),
    pytest.param(['changed'], id='a scope the check takes by no argument'),
    pytest.param(['all', 'all'], id='all named twice'),
  ],
)
def test_should_refuse_the_command_line_before_any_check_when_it_names_an_unknown_argument(
  arguments: list[str],
) -> None:
  # Arrange
  check_mutants = _RecordingCheck(PASSED)

  # Act
  with pytest.raises(UsageError) as refused:
    run_check_mutants(arguments=arguments, check_mutants=check_mutants, write=lambda _text: None)

  # Assert
  assert (refused.value.code, refused.value.arguments, check_mutants.checked_scopes) == (
    Misuse.UNKNOWN_ARGUMENTS,
    tuple(arguments),
    [],
  )
