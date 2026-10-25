import sys
from pathlib import Path

import pytest

from droneey_mutation_check.adapters.local import WorkspaceAdapter
from droneey_mutation_check.check_error import CheckError, Failure
from droneey_mutation_check.gate import Completed

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
