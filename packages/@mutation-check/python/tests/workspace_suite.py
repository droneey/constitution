from pathlib import PurePosixPath
from typing import TYPE_CHECKING, Final

from changes_fixtures import python

from droneey_mutation_check_python.features.mutation.domain.entities import EveryFunction, Stopped
from droneey_mutation_check_python.features.mutation.domain.value_objects import UnitRelativePath

if TYPE_CHECKING:
  from collections.abc import Callable, Mapping

  from droneey_mutation_check_python.features.mutation.domain.contracts import Workspace

ORDERS_PATH: Final = UnitRelativePath(path=PurePosixPath('src/shop/orders.py'))
# A unit whose branch changed nothing against its base.
UNCHANGED_UNIT_TEXTS: Final[Mapping[str, str]] = {
  'src/shop/orders.py': python('def total() -> int:', '  return 1'),
  'src/shop/kernel/money.py': python('RATE = 2'),
  'src/shop/data.json': '{}\n',
  'tests/test_orders.py': python('LIMIT = 1'),
}
# A unit mutmut runs over whose sources hold no function, with a spec that passes.
NO_FUNCTION_TEXTS: Final[Mapping[str, str]] = {
  'pyproject.toml': python('[tool.mutmut]', 'source_paths = ["src"]'),
  'src/shop/__init__.py': '',
  'src/shop/money.py': python('RATE = 2'),
  'tests/test_money.py': python('def test_rate() -> None:', '  assert True'),
}

type WorkspaceBuilder = Callable[[Mapping[str, str]], Workspace]


class WorkspaceSuite:
  """The contract of Workspace.

  A spec subclasses it with a `build_workspace` fixture that answers a workspace over a unit holding
  the files given.
  """

  def test_should_list_the_python_files_under_src_as_the_sources(
    self, build_workspace: WorkspaceBuilder
  ) -> None:
    # Arrange
    workspace = build_workspace(UNCHANGED_UNIT_TEXTS)

    # Act
    changes = workspace.read_changes()

    # Assert
    assert changes.python_source_paths == (
      UnitRelativePath(path=PurePosixPath('src/shop/kernel/money.py')),
      ORDERS_PATH,
    )

  def test_should_read_a_file_of_the_unit(self, build_workspace: WorkspaceBuilder) -> None:
    # Arrange
    workspace = build_workspace(UNCHANGED_UNIT_TEXTS)

    # Act
    text = workspace.read_text(ORDERS_PATH)

    # Assert
    assert text == 'def total() -> int:\n  return 1\n'

  def test_should_report_no_file_when_the_branch_changed_nothing(
    self, build_workspace: WorkspaceBuilder
  ) -> None:
    # Arrange
    workspace = build_workspace(UNCHANGED_UNIT_TEXTS)

    # Act
    changes = workspace.read_changes()

    # Assert
    assert changes.files == ()

  def test_should_keep_the_files_of_the_unit_when_it_removes_the_mutants(
    self, build_workspace: WorkspaceBuilder
  ) -> None:
    # Arrange
    workspace = build_workspace(UNCHANGED_UNIT_TEXTS)

    # Act
    workspace.remove_mutants()

    # Assert
    assert workspace.read_text(ORDERS_PATH) == 'def total() -> int:\n  return 1\n'

  def test_should_stop_with_no_mutant_when_the_sources_hold_no_function(
    self, build_workspace: WorkspaceBuilder
  ) -> None:
    # Arrange
    workspace = build_workspace(NO_FUNCTION_TEXTS)

    # Act
    run = workspace.mutate(EveryFunction())

    # Assert
    assert run == Stopped(mutants=())
