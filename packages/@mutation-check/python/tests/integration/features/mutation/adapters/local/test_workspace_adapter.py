import os
import subprocess
import sys
import time
from pathlib import Path

import pytest

from droneey_mutation_check_python.features.mutation.adapters.local import WorkspaceAdapter
from droneey_mutation_check_python.features.mutation.domain.contracts import Completed
from droneey_mutation_check_python.features.mutation.domain.errors import CheckError, Failure

PYTHON = sys.executable


def _workspace(folder: Path, *, timeout_seconds: float = 30) -> WorkspaceAdapter:
  return WorkspaceAdapter(
    folder=folder,
    environment={'MUTATION_CHECK_SPEC': 'given'},
    timeout_seconds=timeout_seconds,
  )


def _write(folder: Path, names: tuple[str, ...]) -> None:
  for name in names:
    (folder / name).parent.mkdir(parents=True, exist_ok=True)
    (folder / name).write_text('', encoding='utf-8')


@pytest.mark.parametrize(
  ('script', 'completed'),
  [
    pytest.param(
      "import sys; print('out'); print('err', file=sys.stderr); sys.exit(3)",
      Completed(status=3, output='out\nerr\n'),
      id='its status and both streams',
    ),
    pytest.param(
      "import os; print(os.environ.get('MUTATION_CHECK_SPEC'), 'HOME' in os.environ)",
      Completed(status=0, output='given False\n'),
      id='the environment built for it alone',
    ),
    pytest.param(
      "from pathlib import Path; print(Path.cwd().name == 'unit')",
      Completed(status=0, output='True\n'),
      id='the folder of the package',
    ),
    pytest.param(
      "print('ǁ')",
      Completed(status=0, output='ǁ\n'),
      id='its text read as UTF-8',
    ),
  ],
)
def test_should_run_a_command_with_what_it_is_given(
  tmp_path: Path, script: str, completed: Completed
) -> None:
  # Arrange
  folder = tmp_path / 'unit'
  folder.mkdir()
  workspace = _workspace(folder)

  # Act
  run = workspace.run([PYTHON, '-c', script])

  # Assert
  assert run == completed


@pytest.mark.parametrize(
  ('command', 'timeout_seconds', 'failure'),
  [
    pytest.param(
      (PYTHON, '-c', 'import time; time.sleep(5)'), 0.2, Failure.TIMED_OUT, id='past its time'
    ),
    pytest.param(
      ('/nonexistent/git', 'diff'), 30, Failure.NOT_RUN, id='a program that is not there'
    ),
  ],
)
def test_should_stop_with_the_command_when_it_does_not_finish(
  *, tmp_path: Path, command: tuple[str, ...], timeout_seconds: float, failure: Failure
) -> None:
  # Arrange
  workspace = _workspace(tmp_path, timeout_seconds=timeout_seconds)

  # Act
  with pytest.raises(CheckError) as raised:
    workspace.run(command)

  # Assert
  assert (raised.value.code, raised.value.command, raised.value.output) == (failure, command, '')


def test_should_list_the_python_files_under_src_relative_to_the_package(tmp_path: Path) -> None:
  # Arrange
  _write(
    tmp_path,
    (
      'src/shop/orders.py',
      'src/shop/kernel/money.py',
      'src/shop/data.json',
      'tests/test_orders.py',
    ),
  )
  workspace = _workspace(tmp_path)

  # Act
  sources = workspace.sources()

  # Assert
  assert sources == (Path('src/shop/kernel/money.py'), Path('src/shop/orders.py'))


def test_should_read_a_file_of_the_package(tmp_path: Path) -> None:
  # Arrange
  (tmp_path / 'orders.py').write_text('LIMIT = 1\n', encoding='utf-8')
  workspace = _workspace(tmp_path)

  # Act
  text = workspace.read(Path('orders.py'))

  # Assert
  assert text == 'LIMIT = 1\n'


@pytest.mark.parametrize(
  'kept',
  [
    pytest.param(('mutants/src/shop/orders.py',), id='mutants kept by a run'),
    pytest.param((), id='no mutants'),
  ],
)
def test_should_leave_no_mutants_when_cleared(tmp_path: Path, kept: tuple[str, ...]) -> None:
  # Arrange
  _write(tmp_path, kept)
  workspace = _workspace(tmp_path)

  # Act
  workspace.clear()

  # Assert
  assert not (tmp_path / 'mutants').exists()


def _git(folder: Path, *arguments: str) -> None:
  subprocess.run(  # noqa: S603 -- git with the spec's own arguments
    ['git', '-c', 'user.name=Spec', '-c', 'user.email=spec@example.com', *arguments],  # noqa: S607 -- git from PATH, as the gate runs it
    check=True,
    capture_output=True,
    cwd=folder,
  )


# A repository whose branch moved a file from one package into another without telling git yet.
def _moved(folder: Path) -> Path:
  _git(folder, 'init', '--quiet')
  (folder / 'packages/old').mkdir(parents=True)
  (folder / 'packages/old/money.py').write_text('LIMIT = 1\nRATE = 2\n', encoding='utf-8')
  _git(folder, 'add', '.')
  _git(folder, 'commit', '--quiet', '--no-verify', '-m', 'base')
  (folder / 'packages/shop').mkdir()
  (folder / 'packages/old/money.py').rename(folder / 'packages/shop/money.py')

  return folder / 'packages/shop'


@pytest.mark.parametrize(
  ('paths', 'answer'),
  [
    pytest.param(('money.py',), 'rename from packages/old/money.py', id='the paths given'),
    pytest.param(('../../../outside',), 'outside repository', id='a path git refuses'),
  ],
)
def test_should_run_git_with_the_paths_indexed_as_files_to_add_and_leave_the_index(
  tmp_path: Path, paths: tuple[str, ...], answer: str
) -> None:
  # Arrange
  unit = _moved(tmp_path)
  workspace = WorkspaceAdapter(
    folder=unit, environment={'PATH': os.environ['PATH']}, timeout_seconds=30
  )

  # Act
  run = workspace.run_with_files_to_add(['git', 'diff', '--find-renames', 'HEAD'], paths)

  # Assert
  assert (answer in run.output, workspace.run(['git', 'status', '--porcelain']).output) == (
    True,
    ' D packages/old/money.py\n?? packages/shop/\n',
  )


def test_should_answer_what_git_answers_when_the_folder_holds_no_repository(tmp_path: Path) -> None:
  # Arrange
  workspace = WorkspaceAdapter(
    folder=tmp_path, environment={'PATH': os.environ['PATH']}, timeout_seconds=30
  )

  # Act
  run = workspace.run_with_files_to_add(['git', 'diff'], ())

  # Assert
  assert (run.status, 'not a git repository' in run.output) == (128, True)


def test_should_see_a_change_only_the_text_tells_as_the_project_index_does(tmp_path: Path) -> None:
  # Arrange
  _git(tmp_path, 'init', '--quiet')
  # git then compares only sizes and times; an hour back, it records the file apart from the index
  _git(tmp_path, 'config', 'core.checkStat', 'minimal')
  money = tmp_path / 'money.py'
  money.write_text('LIMIT = 1\n', encoding='utf-8')
  hour_ago = time.time() - 3600
  os.utime(money, (hour_ago, hour_ago))
  _git(tmp_path, 'add', '.')
  _git(tmp_path, 'commit', '--quiet', '--no-verify', '-m', 'base')
  money.write_text('LIMIT = 9\n', encoding='utf-8')
  os.utime(money, (hour_ago, hour_ago))
  os.utime(tmp_path / '.git' / 'index', (hour_ago, hour_ago))
  workspace = WorkspaceAdapter(
    folder=tmp_path, environment={'PATH': os.environ['PATH']}, timeout_seconds=30
  )

  # Act
  run = workspace.run_with_files_to_add(['git', 'diff', '--name-only', 'HEAD'], ())

  # Assert
  assert run.output == 'money.py\n'
