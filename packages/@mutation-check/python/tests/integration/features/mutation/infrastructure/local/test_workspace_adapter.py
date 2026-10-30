import os
import sys
import time
from typing import TYPE_CHECKING, Final

import pytest
from changes_fixtures import changed, new, python
from repository_fixtures import GIT_ENVIRONMENT, git, moved_unit, repository, write_files
from workspace_suite import WorkspaceSuite

from droneey_mutation_check_python.features.mutation.domain.entities import (
  Broken,
  EveryFunction,
  Functions,
  Mutant,
  MutantGlob,
  MutantName,
  MutantStatus,
  MutationRun,
  Ran,
  Stopped,
)
from droneey_mutation_check_python.features.mutation.domain.errors import (
  CommandFailedError,
  CommandUnfinishedError,
  Failure,
  MutantsKeptError,
)
from droneey_mutation_check_python.features.mutation.infrastructure.local import (
  ProcessSettings,
  WorkspaceAdapter,
)

if TYPE_CHECKING:
  from collections.abc import Callable, Mapping
  from pathlib import Path

  from workspace_suite import WorkspaceBuilder

PYTHON: Final = sys.executable
GIT: Final = ('git', '-c', 'core.quotePath=false')
PREFIX_COMMAND: Final = (*GIT, 'rev-parse', '--show-prefix')
DIFF_COMMAND: Final = (
  *GIT,
  'diff',
  '-U0',
  '--no-color',
  '--find-renames',
  '--diff-filter=ACMR',
  '--merge-base',
  'origin/main',
)


def _workspace(
  folder_path: Path,
  *,
  whole_environment: Mapping[str, str] = GIT_ENVIRONMENT,
  python_path: str = PYTHON,
  timeout_seconds: float = 30,
) -> WorkspaceAdapter:
  return WorkspaceAdapter(
    process=ProcessSettings(
      folder_path=folder_path,
      whole_environment=whole_environment,
      timeout_seconds=timeout_seconds,
    ),
    python_path=python_path,
  )


def _without_base(repository_path: Path) -> None:
  write_files(repository_path, {'money.py': 'LIMIT = 1\n'})
  git(repository_path, 'init', '--quiet')
  git(repository_path, 'add', '.')
  git(repository_path, 'commit', '--quiet', '--no-verify', '-m', 'base')


class TestWorkspaceAdapter(WorkspaceSuite):
  @pytest.fixture
  def build_workspace(self, tmp_path: Path) -> WorkspaceBuilder:
    def build(texts_by_path: Mapping[str, str]) -> WorkspaceAdapter:
      repository(tmp_path, texts_by_path)

      return _workspace(tmp_path)

    return build


@pytest.mark.parametrize(
  'kept',
  [
    pytest.param({'mutants/src/shop/orders.py': ''}, id='mutants kept by a run'),
    pytest.param({}, id='no mutants'),
  ],
)
def test_should_leave_no_mutants_when_they_are_removed(
  tmp_path: Path, kept: Mapping[str, str]
) -> None:
  # Arrange
  write_files(tmp_path, kept)
  workspace = _workspace(tmp_path)

  # Act
  workspace.remove_mutants()

  # Assert
  assert not (tmp_path / 'mutants').exists()


def test_should_stop_with_the_mutants_kept_when_the_system_refuses_to_remove_them(
  tmp_path: Path,
) -> None:
  # Arrange
  write_files(tmp_path, {'mutants/src/shop/orders.py': ''})
  (tmp_path / 'mutants/src/shop').chmod(0o500)
  workspace = _workspace(tmp_path)

  # Act
  with pytest.raises(MutantsKeptError) as raised:
    workspace.remove_mutants()

  # Assert
  assert (raised.value.code, (tmp_path / 'mutants/src/shop/orders.py').exists()) == (
    Failure.MUTANTS_KEPT,
    True,
  )


def test_should_read_the_changes_of_the_unit_against_the_base(tmp_path: Path) -> None:
  # Arrange
  unit_path = moved_unit(tmp_path)
  write_files(
    tmp_path,
    {
      'packages/shop/money.py': python('LIMIT = 1', 'RATE = 5', 'TAX = 3'),
      'packages/shop/src/fresh.py': python('FRESH = 1'),
    },
  )
  workspace = _workspace(unit_path)

  # Act
  changes = workspace.read_changes()

  # Assert
  assert changes.files == (changed('money.py', range(2, 3)), new('src/fresh.py'))


def test_should_read_the_changes_of_files_whose_names_hold_letters_past_ascii(
  tmp_path: Path,
) -> None:
  # Arrange
  repository(tmp_path, {'src/café.py': python('LIMIT = 1')})
  write_files(tmp_path, {'src/café.py': python('LIMIT = 2'), 'src/naïve.py': python('FRESH = 1')})
  workspace = _workspace(tmp_path)

  # Act
  changes = workspace.read_changes()

  # Assert
  assert changes.files == (changed('src/café.py', range(1, 2)), new('src/naïve.py'))


def test_should_leave_the_index_of_the_project_as_it_was_when_it_reads_the_changes(
  tmp_path: Path,
) -> None:
  # Arrange
  workspace = _workspace(moved_unit(tmp_path))
  index_bytes = (tmp_path / '.git/index').read_bytes()

  # Act
  workspace.read_changes()

  # Assert
  assert (tmp_path / '.git/index').read_bytes() == index_bytes


def test_should_see_a_change_only_the_text_tells_as_the_project_index_does(tmp_path: Path) -> None:
  # Arrange
  hour_ago = time.time() - 3600
  money_path = tmp_path / 'money.py'
  money_path.write_text('LIMIT = 1\n', encoding='utf-8')
  os.utime(money_path, (hour_ago, hour_ago))
  git(tmp_path, 'init', '--quiet')
  # Why: git then compares only sizes and times; an hour back, it records the file apart from the
  # index.
  git(tmp_path, 'config', 'core.checkStat', 'minimal')
  git(tmp_path, 'add', '.')
  git(tmp_path, 'commit', '--quiet', '--no-verify', '-m', 'base')
  git(tmp_path, 'update-ref', 'refs/remotes/origin/main', 'HEAD')
  money_path.write_text('LIMIT = 9\n', encoding='utf-8')
  os.utime(money_path, (hour_ago, hour_ago))
  os.utime(tmp_path / '.git/index', (hour_ago, hour_ago))
  workspace = _workspace(tmp_path)

  # Act
  changes = workspace.read_changes()

  # Assert
  assert changes.files == (changed('money.py', range(1, 2)),)


@pytest.mark.parametrize(
  ('setup', 'command'),
  [
    pytest.param(lambda _: None, PREFIX_COMMAND, id='finding the unit'),
    pytest.param(_without_base, DIFF_COMMAND, id='diffing the branch'),
  ],
)
def test_should_stop_with_the_command_when_git_fails(
  tmp_path: Path, setup: Callable[[Path], None], command: tuple[str, ...]
) -> None:
  # Arrange
  setup(tmp_path)
  workspace = _workspace(tmp_path)

  # Act
  with pytest.raises(CommandFailedError) as raised:
    workspace.read_changes()

  # Assert
  assert raised.value.command == command


def _unit(unit_path: Path, *, spec_text: str) -> None:
  write_files(
    unit_path,
    {
      'pyproject.toml': python('[tool.mutmut]', 'source_paths = ["src"]'),
      'src/shop/__init__.py': '',
      'src/shop/orders.py': python(
        'def total(price: int, fee: int) -> int:',
        '  return price + fee',
        '',
        '',
        'def tax(price: int) -> int:',
        '  return price * 2',
      ),
      'tests/test_orders.py': spec_text,
    },
  )


WEAK_SPEC: Final = python(
  'from shop.orders import total',
  '',
  '',
  'def test_total() -> None:',
  '  assert total(0, 0) == 0',
)
TOTAL: Final = MutantGlob('shop.orders.x_total__mutmut_*')


def _mutant(name: str, status: MutantStatus) -> Mutant:
  return Mutant(name=MutantName(f'shop.orders.{name}'), status=status)


@pytest.mark.parametrize(
  ('spec_text', 'glob', 'run'),
  [
    pytest.param(
      WEAK_SPEC,
      TOTAL,
      Ran(
        mutants=(
          _mutant('x_total__mutmut_1', MutantStatus.SURVIVED),
          _mutant('x_tax__mutmut_1', MutantStatus.NOT_CHECKED),
          _mutant('x_tax__mutmut_2', MutantStatus.NOT_CHECKED),
        )
      ),
      id='the mutants run',
    ),
    pytest.param(
      WEAK_SPEC,
      MutantGlob('shop.orders.x_none__mutmut_*'),
      Stopped(
        mutants=(
          _mutant('x_total__mutmut_1', MutantStatus.NOT_CHECKED),
          _mutant('x_tax__mutmut_1', MutantStatus.NOT_CHECKED),
          _mutant('x_tax__mutmut_2', MutantStatus.NOT_CHECKED),
        )
      ),
      id='no mutant matching',
    ),
    pytest.param(
      python('def test_nothing() -> None:', '  assert True'),
      MutantGlob('shop.orders.x_tax__mutmut_*'),
      Stopped(
        mutants=(
          _mutant('x_total__mutmut_1', MutantStatus.NOT_CHECKED),
          _mutant('x_tax__mutmut_1', MutantStatus.NOT_CHECKED),
          _mutant('x_tax__mutmut_2', MutantStatus.NOT_CHECKED),
        )
      ),
      id='no spec reaching a mutant',
    ),
  ],
)
def test_should_mutate_the_functions_the_glob_names(
  *, tmp_path: Path, spec_text: str, glob: MutantGlob, run: MutationRun
) -> None:
  # Arrange
  _unit(tmp_path, spec_text=spec_text)
  workspace = _workspace(tmp_path)

  # Act
  mutated = workspace.mutate(Functions(globs=(glob,)))

  # Assert
  assert mutated == run


def test_should_answer_what_mutmut_printed_when_its_clean_run_fails(tmp_path: Path) -> None:
  # Arrange
  _unit(
    tmp_path,
    spec_text=python('def test_broken_on_purpose() -> None:', '  assert False'),
  )
  workspace = _workspace(tmp_path)

  # Act
  mutated = workspace.mutate(Functions(globs=(TOTAL,)))

  # Assert
  assert isinstance(mutated, Broken)
  assert 'test_broken_on_purpose' in mutated.output


# Why: `python -m mutmut` finds the stand-in in the unit's folder before the real one.
def _stand_in_unit(unit_path: Path, *lines: str) -> None:
  write_files(
    unit_path, {'mutmut.py': python('import os', 'import sys', 'from pathlib import Path', *lines)}
  )


@pytest.mark.parametrize(
  ('lines', 'run'),
  [
    pytest.param(
      ("print('out')", "print('err', file=sys.stderr)", 'sys.exit(3)'),
      Broken(output='out\nerr\n'),
      id='its status and both streams',
    ),
    pytest.param(
      ("print(os.environ.get('MUTATION_CHECK_SPEC'), 'HOME' in os.environ)", 'sys.exit(1)'),
      Broken(output='given False\n'),
      id='the environment built for it alone',
    ),
    pytest.param(
      ('print(Path.cwd().name)', 'sys.exit(1)'),
      Broken(output='unit\n'),
      id='the folder of the unit',
    ),
    pytest.param(
      ("print('ǁ')", 'sys.exit(1)'),
      Broken(output='ǁ\n'),
      id='its text read as UTF-8',
    ),
    pytest.param(
      ("print('    shop.x_total__mutmut_1: killed')",),
      Ran(mutants=(Mutant(name=MutantName('shop.x_total__mutmut_1'), status=MutantStatus.KILLED),)),
      id='the results it lists after a run',
    ),
  ],
)
def test_should_run_mutmut_in_the_unit_with_what_it_is_given(
  tmp_path: Path, lines: tuple[str, ...], run: MutationRun
) -> None:
  # Arrange
  unit_path = tmp_path / 'unit'
  _stand_in_unit(unit_path, *lines)
  workspace = _workspace(unit_path, whole_environment={'MUTATION_CHECK_SPEC': 'given'})

  # Act
  mutated = workspace.mutate(EveryFunction())

  # Assert
  assert mutated == run


def test_should_stop_with_the_command_when_mutmut_fails_to_list_the_mutants(
  tmp_path: Path,
) -> None:
  # Arrange
  _stand_in_unit(tmp_path, "sys.exit('no results' if sys.argv[-1] == 'results' else 0)")
  workspace = _workspace(tmp_path)

  # Act
  with pytest.raises(CommandFailedError) as raised:
    workspace.mutate(EveryFunction())

  # Assert
  assert (raised.value.command, raised.value.output) == (
    (PYTHON, '-m', 'mutmut', 'results'),
    'no results\n',
  )


@pytest.mark.parametrize(
  ('python_path', 'timeout_seconds', 'code'),
  [
    pytest.param(PYTHON, 0.2, Failure.COMMAND_TIMED_OUT, id='past its time'),
    pytest.param('/nonexistent/python', 30, Failure.COMMAND_NOT_RUN, id='no interpreter there'),
  ],
)
def test_should_stop_with_the_command_when_mutmut_does_not_finish(
  *, tmp_path: Path, python_path: str, timeout_seconds: float, code: Failure
) -> None:
  # Arrange
  _stand_in_unit(tmp_path, 'import time', 'time.sleep(5)')
  workspace = _workspace(tmp_path, python_path=python_path, timeout_seconds=timeout_seconds)

  # Act
  with pytest.raises(CommandUnfinishedError) as raised:
    workspace.mutate(EveryFunction())

  # Assert
  assert (raised.value.code, raised.value.command) == (
    code,
    (python_path, '-m', 'mutmut', 'run'),
  )
