import sys
from pathlib import Path
from typing import Final

from source_fixtures import folder, function_of, python

from droneey_python_check.features.code import check_code
from droneey_python_check.features.code.domain.finding.entities import (
  EffectOutsideEdge,
  Finding,
  ImportLeavingModule,
  LongFunction,
  PackageInPure,
)
from droneey_python_check.features.code.domain.settings.entities import Settings
from droneey_python_check.features.code.domain.source.entities import Source, Sources

SETTINGS: Final = Settings(homes_by_import_name={}, workspace_unit_import_names=frozenset())


def test_should_find_each_rule_a_file_breaks_when_files_break_several() -> None:
  # Arrange
  sources = Sources(
    files=(
      Source(
        path=Path('src/shop/kernel/money.py'),
        content=python('from ..features import orders', 'import pydantic', 'import os').encode(),
      ),
      Source(path=Path('src/shop/orders.py'), content=function_of(101).encode()),
    ),
    package_folder_paths=frozenset(),
  )

  # Act
  findings = check_code(
    sources=sources, settings=SETTINGS, standard_module_names=sys.stdlib_module_names
  )

  # Assert
  assert findings == (
    Finding(
      path=Path('src/shop/kernel/money.py'),
      line_number=1,
      breach=ImportLeavingModule(importer_module=folder('kernel')),
    ),
    Finding(
      path=Path('src/shop/kernel/money.py'),
      line_number=2,
      breach=PackageInPure(folder=folder('kernel'), package_name='pydantic'),
    ),
    Finding(
      path=Path('src/shop/kernel/money.py'),
      line_number=3,
      breach=EffectOutsideEdge(folder=folder('kernel'), effect_dotted_name='os'),
    ),
    Finding(
      path=Path('src/shop/orders.py'),
      line_number=1,
      breach=LongFunction(function_name='tally', line_count=101, limit=100),
    ),
  )
