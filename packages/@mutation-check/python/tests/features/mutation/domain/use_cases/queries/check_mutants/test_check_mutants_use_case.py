import pytest
from changes_fixtures import TEXTS, changed, new
from workspace_fake import WorkspaceFake

from droneey_mutation_check_python.features.mutation import check_mutants
from droneey_mutation_check_python.features.mutation.domain.entities import (
  Broken,
  EveryFunction,
  FileChange,
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
  Scope,
  Stopped,
  Survived,
)
from droneey_mutation_check_python.features.mutation.domain.errors import (
  CommandFailedError,
  CommandUnfinishedError,
  Failure,
  MutantsKeptError,
)

TOTAL_CHANGED = (changed('src/shop/orders.py', range(5, 6)),)
DISCOUNT_SURVIVED = Mutant(
  name=MutantName('shop.orders.x_discount__mutmut_1'), status=MutantStatus.SURVIVED
)


def _total_mutant(status: MutantStatus) -> Mutant:
  return Mutant(name=MutantName('shop.orders.x_total__mutmut_1'), status=status)


def test_should_pass_without_mutmut_when_no_function_changed() -> None:
  # Arrange
  workspace = WorkspaceFake(
    texts_by_path=TEXTS, files=(changed('src/shop/orders.py', range(1, 2)),)
  )

  # Act
  checked = check_mutants(Scope.CHANGED, workspace=workspace)

  # Assert
  assert (checked, workspace.mutated_targets, workspace.mutants_removal_count) == (
    Passed(reason=PassReason.UNCHANGED),
    [],
    0,
  )


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
def test_should_count_a_changed_mutant_as_killed_by_its_status(
  status: MutantStatus, outcome: Outcome
) -> None:
  # Arrange
  run = Ran(mutants=(_total_mutant(status),))
  workspace = WorkspaceFake(texts_by_path=TEXTS, files=TOTAL_CHANGED, run=run)

  # Act
  checked = check_mutants(Scope.CHANGED, workspace=workspace)

  # Assert
  assert checked == outcome


@pytest.mark.parametrize(
  ('scope', 'run', 'outcome'),
  [
    pytest.param(
      Scope.CHANGED,
      Ran(mutants=(DISCOUNT_SURVIVED,)),
      Passed(reason=PassReason.KILLED),
      id='a pass',
    ),
    pytest.param(
      Scope.ALL,
      Ran(mutants=(_total_mutant(MutantStatus.SURVIVED), DISCOUNT_SURVIVED)),
      Survived(mutants=(_total_mutant(MutantStatus.SURVIVED), DISCOUNT_SURVIVED)),
      id='all mutated',
    ),
    pytest.param(
      Scope.CHANGED,
      Stopped(
        mutants=(
          Mutant(
            name=MutantName('shop.orders.x_discount__mutmut_1'), status=MutantStatus.NOT_CHECKED
          ),
        )
      ),
      Passed(reason=PassReason.NOTHING_TO_MUTATE),
      id='mutmut stopped with nothing to mutate',
    ),
    pytest.param(
      Scope.CHANGED,
      Stopped(mutants=(_total_mutant(MutantStatus.NOT_CHECKED),)),
      Survived(mutants=(_total_mutant(MutantStatus.NOT_CHECKED),)),
      id='mutmut stopped before running the changed mutants',
    ),
    pytest.param(
      Scope.CHANGED,
      Broken(output='failed to run the clean tests\n'),
      Broken(output='failed to run the clean tests\n'),
      id='mutmut failed',
    ),
  ],
)
def test_should_answer_how_the_mutants_of_the_scope_fared(
  scope: Scope, run: MutationRun, outcome: Outcome
) -> None:
  # Arrange
  workspace = WorkspaceFake(texts_by_path=TEXTS, files=TOTAL_CHANGED, run=run)

  # Act
  answered = check_mutants(scope, workspace=workspace)

  # Assert
  assert answered == outcome


def _globs(*texts: str) -> list[MutationTargets]:
  return [Functions(globs=tuple(MutantGlob(text) for text in texts))]


@pytest.mark.parametrize(
  ('files', 'targets'),
  [
    pytest.param(
      (changed('src/shop/orders.py', range(4, 5)),),
      _globs('shop.orders.x_total__mutmut_*'),
      id="a function's first line",
    ),
    pytest.param(
      (changed('src/shop/orders.py', range(6, 8)),), [], id='the lines between two functions'
    ),
    pytest.param(
      (changed('src/shop/orders.py', range(8, 9)),),
      _globs('shop.orders.x_discount__mutmut_*'),
      id="a function's decorator",
    ),
    pytest.param(
      (changed('src/shop/orders.py', range(17, 18)),),
      _globs('shop.orders.xǁBasketǁadd__mutmut_*'),
      id='a line in a method',
    ),
    pytest.param((changed('src/shop/orders.py', range(14, 15)),), [], id='a field of a class'),
    pytest.param(
      (changed('src/shop/__init__.py', range(2, 3)),),
      _globs('shop.x_version__mutmut_*'),
      id="a line of a package's surface",
    ),
    pytest.param(
      (changed('src/shop/kernel/__init__.py', range(2, 3)),),
      _globs('shop.kernel.x_zero__mutmut_*'),
      id="a line of a folder's surface",
    ),
    pytest.param(
      (
        changed('README.md', range(1, 2)),
        changed('tests/test_orders.py', range(1, 2)),
        new('tests/test_basket.py'),
      ),
      [],
      id='specs and a file outside src/',
    ),
    pytest.param(
      (new('src/shop/orders.py'),),
      _globs(
        'shop.orders.x_discount__mutmut_*',
        'shop.orders.x_total__mutmut_*',
        'shop.orders.xǁBasketǁadd__mutmut_*',
      ),
      id='a new file',
    ),
  ],
)
def test_should_mutate_the_functions_a_change_touches(
  files: tuple[FileChange, ...], targets: list[MutationTargets]
) -> None:
  # Arrange
  workspace = WorkspaceFake(texts_by_path=TEXTS, files=files)

  # Act
  check_mutants(Scope.CHANGED, workspace=workspace)

  # Assert
  assert workspace.mutated_targets == targets


def test_should_mutate_every_function_when_the_scope_is_all() -> None:
  # Arrange
  workspace = WorkspaceFake(texts_by_path=TEXTS, files=TOTAL_CHANGED)

  # Act
  check_mutants(Scope.ALL, workspace=workspace)

  # Assert
  assert workspace.mutated_targets == [EveryFunction()]


@pytest.mark.parametrize(
  ('run', 'removal_count'),
  [
    pytest.param(Ran(mutants=(DISCOUNT_SURVIVED,)), 2, id='a pass removes them after the run'),
    pytest.param(
      Ran(mutants=(_total_mutant(MutantStatus.SURVIVED),)),
      1,
      id='a mutant not killed keeps them for reading',
    ),
  ],
)
def test_should_remove_the_mutants_before_the_run_and_after_a_pass(
  run: MutationRun, removal_count: int
) -> None:
  # Arrange
  workspace = WorkspaceFake(texts_by_path=TEXTS, files=TOTAL_CHANGED, run=run)

  # Act
  check_mutants(Scope.CHANGED, workspace=workspace)

  # Assert
  assert workspace.mutants_removal_count == removal_count


GIT_FAILED = CommandFailedError(command=('git', 'diff'), output='fatal: bad revision origin/main\n')
MUTANTS_KEPT = MutantsKeptError(reason='Permission denied')
MUTMUT_TIMED_OUT = CommandUnfinishedError(
  code=Failure.COMMAND_TIMED_OUT, command=('python', '-m', 'mutmut', 'run')
)


@pytest.mark.parametrize(
  ('workspace', 'error'),
  [
    pytest.param(
      WorkspaceFake(texts_by_path=TEXTS, read_changes_error=GIT_FAILED),
      GIT_FAILED,
      id='reading the changes',
    ),
    pytest.param(
      WorkspaceFake(texts_by_path=TEXTS, files=TOTAL_CHANGED, remove_mutants_error=MUTANTS_KEPT),
      MUTANTS_KEPT,
      id='removing the mutants of an earlier run',
    ),
    pytest.param(
      WorkspaceFake(texts_by_path=TEXTS, files=TOTAL_CHANGED, mutate_error=MUTMUT_TIMED_OUT),
      MUTMUT_TIMED_OUT,
      id='mutating',
    ),
  ],
)
def test_should_stop_with_the_error_of_the_workspace_when_it_fails(
  workspace: WorkspaceFake, error: Exception
) -> None:
  # Act
  with pytest.raises(type(error)) as raised:
    check_mutants(Scope.CHANGED, workspace=workspace)

  # Assert
  assert raised.value is error
