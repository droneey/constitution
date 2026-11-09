from pathlib import Path
from typing import Final

from droneey_mutation_check_python.features.mutation.domain.changes.errors import (
  InvalidValueError,
  ValueFailure,
)
from droneey_mutation_check_python.features.mutation.domain.mutant.entities import (
  Mutant,
  MutantName,
  MutantStatus,
)
from droneey_mutation_check_python.features.mutation.domain.mutation_run.entities import (
  Broken,
  Passed,
  PassReason,
  Survived,
)
from droneey_mutation_check_python.features.mutation.domain.shared.errors import (
  CommandFailedError,
  CommandUnfinishedError,
  Failure,
  MutantsKeptError,
)
from droneey_mutation_check_python.features.mutation.presentation.errors import Misuse, UsageError
from droneey_mutation_check_python.features.mutation.presentation.utils import render, render_error

REPORT_GOLDEN_PATH: Final = Path(__file__).with_name('report.golden.txt')
ERRORS_GOLDEN_PATH: Final = Path(__file__).with_name('errors.golden.txt')
SURVIVED = Survived(
  mutants=(
    Mutant(name=MutantName('shop.orders.x_total__mutmut_1'), status=MutantStatus.SURVIVED),
    Mutant(name=MutantName('shop.orders.x_total__mutmut_2'), status=MutantStatus.NO_TESTS),
  ),
)
EVERY_OUTCOME: Final = (
  Passed(reason=PassReason.UNCHANGED),
  Passed(reason=PassReason.KILLED),
  Passed(reason=PassReason.NOTHING_TO_MUTATE),
  SURVIVED,
  Broken(output='failed to run the clean tests\nAssertionError: assert False\n'),
)
EVERY_ERROR: Final = (
  CommandFailedError(command=('git', 'diff'), output='fatal: bad revision origin/main\n'),
  CommandUnfinishedError(code=Failure.COMMAND_NOT_RUN, command=('python', '-m', 'mutmut', 'run')),
  CommandUnfinishedError(code=Failure.COMMAND_TIMED_OUT, command=('python', '-m', 'mutmut', 'run')),
  MutantsKeptError(reason="[Errno 13] Permission denied: 'mutants/src'"),
  InvalidValueError(code=ValueFailure.ABSOLUTE_PATH, text='/repository/src/shop/orders.py'),
  InvalidValueError(code=ValueFailure.PATH_OUT_OF_UNIT, text='../outside/orders.py'),
  UsageError(code=Misuse.UNKNOWN_ARGUMENTS, arguments=('al',)),
  RuntimeError('boom'),
)


def test_should_report_the_outcomes_as_the_golden_file_shows_them() -> None:
  # Act
  report = ''.join(map(render, EVERY_OUTCOME))

  # Assert
  assert report == REPORT_GOLDEN_PATH.read_text(encoding='utf-8')


def test_should_report_the_errors_as_the_golden_file_shows_them() -> None:
  # Act
  report = ''.join(map(render_error, EVERY_ERROR))

  # Assert
  assert report == ERRORS_GOLDEN_PATH.read_text(encoding='utf-8')
