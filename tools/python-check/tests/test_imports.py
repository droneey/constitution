import ast
from pathlib import Path

import pytest
from python_check.findings import Finding
from python_check.imports import import_findings
from source_fixtures import write_files

# The folders of a package laid out as core's anatomy lays it out.
TREE = {
  'src/shop/__init__.py': '',
  'src/shop/main.py': '',
  'src/shop/kernel/__init__.py': '',
  'src/shop/kernel/money.py': '',
  'src/shop/features/orders/__init__.py': '',
  'src/shop/features/orders/domain/entities/order_entity.py': '',
  'src/shop/features/orders/adapters/sql/orders_repository.py': '',
  'src/shop/features/billing/__init__.py': '',
  'src/shop/kernel/dates/__init__.py': '',
  'src/shop/kernel/dates/calendar.py': '',
  'src/shop/libs/tabula/__init__.py': '',
  'src/shop/libs/tabula/sheet.py': '',
}


def _findings(*, folder: Path, importer: str, statement: str) -> tuple[Finding, ...]:
  write_files(folder, TREE)

  return import_findings(path=folder / importer, tree=ast.parse(statement))


@pytest.mark.parametrize(
  ('importer', 'statement'),
  [
    pytest.param(
      'src/shop/features/orders/adapters/sql/orders_repository.py',
      'from ...domain.entities import Order',
      id="a relative import of a domain role folder's surface",
    ),
    pytest.param(
      'src/shop/features/orders/adapters/sql/orders_repository.py',
      'from ... import domain',
      id='a relative import of a folder of its feature',
    ),
    pytest.param(
      'src/shop/features/orders/__init__.py',
      'from .domain.entities import Order',
      id="a feature's surface re-exporting a role folder's surface",
    ),
    pytest.param(
      'src/shop/kernel/money.py',
      'from . import currency',
      id='a relative import inside one top-level folder',
    ),
    pytest.param(
      'src/shop/kernel/money/currency.py',
      'from ..dates import Calendar',
      id="a relative import of another module's surface in one top-level folder",
    ),
    pytest.param(
      'src/shop/main.py',
      'from .version import VERSION',
      id='a file of the package root importing another',
    ),
    pytest.param(
      'src/shop/features/orders/domain/entities/order_entity.py',
      'from shop.kernel.money import Money',
      id='an absolute import that leaves the feature',
    ),
    pytest.param(
      'src/shop/kernel/money.py',
      'from shop.kernel import currency',
      id='a top-level folder importing itself by its absolute path',
    ),
    pytest.param(
      'src/shop/features/orders/domain/entities/order_entity.py',
      'from .order_value import Value',
      id='a relative import inside one role folder',
    ),
    pytest.param(
      'src/shop/features/orders/domain/entities/order_entity.py',
      'from ...app.use_cases.place_order import place',
      id='a relative import into a folder outside the domain',
    ),
    pytest.param(
      'src/shop/features/orders/domain/use_cases/queries/list_orders.py',
      'from ..commands.place_order import place',
      id='a relative import between the folders of one domain role folder',
    ),
    pytest.param(
      'src/shop/libs/tabula/cells/cell.py',
      'from ..rows.row import Row',
      id='a relative import between the folders of one module',
    ),
    pytest.param(
      'src/shop/libs/money/amount.py',
      'from shop.libs.tabula import Sheet',
      id="an absolute import of a sibling module's surface",
    ),
    pytest.param(
      'src/shop/libs/tabula/sheet.py',
      'from shop.libs.tabula.cells import Cell',
      id='a module importing its own file by its absolute path',
    ),
    pytest.param(
      'src/shop/root/wiring.py',
      'from shop.libs.tabula.sheet import Sheet',
      id='an absolute import past a surface from another layer, which the contracts hold',
    ),
    pytest.param(
      'tests/test_orders.py',
      'from .orders_fixtures import order',
      id='a relative import outside the source root',
    ),
    pytest.param(
      'src/orders.py',
      'from .money import Money',
      id='a module that sits in src/ itself',
    ),
  ],
)
def test_should_find_nothing_when_an_import_stays_in_its_module(
  *,
  tmp_path: Path,
  importer: str,
  statement: str,
) -> None:
  # Arrange
  code = statement

  # Act
  findings = _findings(folder=tmp_path, importer=importer, statement=code)

  # Assert
  assert findings == ()


@pytest.mark.parametrize(
  ('importer', 'statement', 'message'),
  [
    pytest.param(
      'src/shop/features/orders/domain/entities/order_entity.py',
      'from ....billing import Invoice',
      'a relative import leaves its module, features/orders; import it by its absolute path',
      id='a relative import into another feature',
    ),
    pytest.param(
      'src/shop/features/orders/domain/entities/order_entity.py',
      'from ..... import kernel',
      'a relative import leaves its module, features/orders; import it by its absolute path',
      id='a relative import of a name past the feature',
    ),
    pytest.param(
      'src/shop/kernel/money.py',
      'from ..features.orders import Order',
      'a relative import leaves its module, kernel; import it by its absolute path',
      id='a relative import out of a top-level folder',
    ),
    pytest.param(
      'src/shop/main.py',
      'from .kernel.money import Money',
      'a relative import leaves its module, the package root; import it by its absolute path',
      id='a relative import from the package root into a folder',
    ),
    pytest.param(
      'src/shop/features/orders/adapters/sql/orders_repository.py',
      'from ...domain.entities.order_entity import Order',
      (
        'a relative import reaches past the surface of features/orders/domain/entities; '
        'import that folder'
      ),
      id="a relative import past a domain role folder's surface",
    ),
    pytest.param(
      'src/shop/kernel/money/currency.py',
      'from ..dates.calendar import Calendar',
      'a relative import reaches past the surface of kernel/dates; import that folder',
      id="a relative import past another kernel module's surface",
    ),
    pytest.param(
      'src/shop/libs/money/amount.py',
      'from shop.libs.tabula.sheet import Sheet',
      'an import reaches past the surface of shop.libs.tabula; import shop.libs.tabula',
      id="an absolute import past a sibling module's surface",
    ),
    pytest.param(
      'src/shop/kernel/money.py',
      'from ... import other',
      'a relative import climbs out of the import package',
      id='a relative import past the import package',
    ),
    pytest.param(
      'src/shop/features/orders/domain/entities/order_entity.py',
      'from shop.features.orders.adapters.sql.orders_repository import OrdersRepository',
      (
        'a feature imports itself by its absolute path, '
        'shop.features.orders.adapters.sql.orders_repository; import it relatively'
      ),
      id='a feature importing itself by its absolute path',
    ),
    pytest.param(
      'src/shop/features/orders/domain/entities/order_entity.py',
      'import shop.features.orders',
      'a feature imports itself by its absolute path, shop.features.orders; import it relatively',
      id='a feature importing its own surface by its absolute path',
    ),
  ],
)
def test_should_report_an_import_when_it_crosses_the_border_of_its_module(
  *,
  tmp_path: Path,
  importer: str,
  statement: str,
  message: str,
) -> None:
  # Arrange
  code = statement

  # Act
  findings = _findings(folder=tmp_path, importer=importer, statement=code)

  # Assert
  assert findings == (Finding(path=tmp_path / importer, line=1, message=message),)


def test_should_report_the_name_past_a_surface_when_an_import_names_several(
  tmp_path: Path,
) -> None:
  # Arrange
  statement = 'import json, shop.libs.tabula.sheet'

  # Act
  findings = _findings(
    folder=tmp_path, importer='src/shop/libs/money/amount.py', statement=statement
  )

  # Assert
  assert findings == (
    Finding(
      path=tmp_path / 'src/shop/libs/money/amount.py',
      line=1,
      message='an import reaches past the surface of shop.libs.tabula; import shop.libs.tabula',
    ),
  )


def test_should_report_each_name_when_a_relative_import_names_several(tmp_path: Path) -> None:
  # Arrange
  statement = 'from .. import features, main'

  # Act
  findings = _findings(folder=tmp_path, importer='src/shop/kernel/money.py', statement=statement)

  # Assert
  assert findings == (
    Finding(
      path=tmp_path / 'src/shop/kernel/money.py',
      line=1,
      message='a relative import leaves its module, kernel; import it by its absolute path',
    ),
    Finding(
      path=tmp_path / 'src/shop/kernel/money.py',
      line=1,
      message='a relative import leaves its module, kernel; import it by its absolute path',
    ),
  )
