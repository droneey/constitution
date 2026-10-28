from pathlib import Path
from typing import TYPE_CHECKING, Final

import pytest
from source_fixtures import folder

from droneey_python_check.features.code import ExitStatus, run_check_code
from droneey_python_check.features.code.app.errors import Misuse, UsageError
from droneey_python_check.features.code.domain.entities import (
  EffectOutsideEdge,
  EnvironmentOutsideRoot,
  Finding,
  ImportClimbingOut,
  ImportLeavingModule,
  ImportOfItself,
  Layer,
  LongFile,
  LongFunction,
  PackageInPure,
  PackageOutsideHome,
  PackageWithoutHome,
  TopLevelFolder,
  Unparsable,
  WholeEdge,
)

if TYPE_CHECKING:
  from collections.abc import Sequence

FINDINGS_GOLDEN_PATH: Final = Path(__file__).with_name('findings.golden.txt')
ORDERS = Path('src/shop/orders.py')
CLIMB = Finding(path=ORDERS, line_number=1, breach=ImportClimbingOut())
EVERY_BREACH: Final = (
  Finding(path=ORDERS, line_number=2, breach=Unparsable(parser_message='invalid syntax')),
  Finding(path=ORDERS, line_number=1, breach=LongFile(line_count=501, limit=500)),
  Finding(
    path=ORDERS,
    line_number=3,
    breach=LongFunction(function_name='tally', line_count=101, limit=100),
  ),
  CLIMB,
  Finding(path=ORDERS, line_number=4, breach=ImportLeavingModule(importer_module=folder('kernel'))),
  Finding(path=ORDERS, line_number=5, breach=ImportLeavingModule(importer_module=folder(''))),
  Finding(path=ORDERS, line_number=6, breach=ImportOfItself(imported_name='shop.kernel')),
  Finding(
    path=ORDERS,
    line_number=7,
    breach=PackageInPure(folder=folder('kernel/contracts'), package_name='attrs'),
  ),
  Finding(
    path=ORDERS,
    line_number=8,
    breach=PackageWithoutHome(folder=folder('utils'), package_name='httpx'),
  ),
  Finding(
    path=ORDERS,
    line_number=9,
    breach=PackageOutsideHome(
      folder=folder('api'),
      package_name='fastapi',
      home=(WholeEdge(), Layer.APP, TopLevelFolder(name='reports')),
    ),
  ),
  Finding(
    path=ORDERS,
    line_number=10,
    breach=EffectOutsideEdge(folder=folder('kernel'), effect_dotted_name='time'),
  ),
  Finding(
    path=ORDERS,
    line_number=11,
    breach=EnvironmentOutsideRoot(folder=folder('adapters/mail'), environment_name='os.environ'),
  ),
)


class _RecordingCheck:
  def __init__(self, findings: tuple[Finding, ...] = ()) -> None:
    self.findings = findings
    self.checked_paths: list[Sequence[Path]] = []

  def __call__(self, paths: Sequence[Path]) -> tuple[Finding, ...]:
    self.checked_paths.append(paths)

    return self.findings


def test_should_check_each_path_the_command_line_names() -> None:
  # Arrange
  check_code = _RecordingCheck()

  # Act
  run_check_code(
    arguments=['src', 'tests/test_money.py'], check_code=check_code, write=lambda _text: None
  )

  # Assert
  assert check_code.checked_paths == [(Path('src'), Path('tests/test_money.py'))]


def test_should_write_the_findings_as_the_golden_file_shows_them() -> None:
  # Arrange
  check_code = _RecordingCheck(EVERY_BREACH)
  written: list[str] = []

  # Act
  run_check_code(arguments=['src'], check_code=check_code, write=written.append)

  # Assert
  assert ''.join(written) == FINDINGS_GOLDEN_PATH.read_text(encoding='utf-8')


@pytest.mark.parametrize(
  ('findings', 'status'),
  [
    pytest.param((), ExitStatus.PASSED, id='no finding'),
    pytest.param((CLIMB,), ExitStatus.FAILED, id='a finding'),
  ],
)
def test_should_end_by_whether_the_paths_hold_a_finding(
  findings: tuple[Finding, ...], status: ExitStatus
) -> None:
  # Arrange
  check_code = _RecordingCheck(findings)

  # Act
  ended = run_check_code(arguments=['src'], check_code=check_code, write=lambda _text: None)

  # Assert
  assert ended == status


def test_should_refuse_the_command_line_before_any_check_when_it_names_no_path() -> None:
  # Arrange
  check_code = _RecordingCheck()

  # Act
  with pytest.raises(UsageError) as refused:
    run_check_code(arguments=[], check_code=check_code, write=lambda _text: None)

  # Assert
  assert (refused.value.code, check_code.checked_paths) == (Misuse.NO_PATH, [])
