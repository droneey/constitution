import sys
from pathlib import Path
from typing import TYPE_CHECKING, Final

import pytest
from source_fixtures import folder, function_of, python, table_function_of, with_limit_lifted

from droneey_python_check.features.code import check_code
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
  Settings,
  Source,
  Sources,
  TopLevelFolder,
  Unparsable,
  WholeEdge,
)

if TYPE_CHECKING:
  from droneey_python_check.features.code.domain.entities import Breach

TREE_FILE_PATHS: Final = (
  'src/shop/__init__.py',
  'src/shop/main.py',
  'src/shop/kernel/__init__.py',
  'src/shop/kernel/money.py',
  'src/shop/features/orders/__init__.py',
  'src/shop/features/orders/domain/entities/order_entity.py',
  'src/shop/features/orders/infrastructure/sql/orders_repository.py',
  'src/shop/features/billing/__init__.py',
  'src/shop/kernel/dates/__init__.py',
  'src/shop/kernel/dates/calendar.py',
  'src/shop/libs/tabula/__init__.py',
  'src/shop/libs/tabula/sheet.py',
)
PACKAGE_PATH: Final = Path('src/shop')
PACKAGE_FOLDER_PATHS: Final = frozenset(
  folder_path
  for file_path in TREE_FILE_PATHS
  for folder_path in Path(file_path).parents
  if folder_path.is_relative_to(PACKAGE_PATH)
)
SETTINGS: Final = Settings(
  homes_by_import_name={
    'fastapi': (WholeEdge(), Layer.PRESENTATION),
    'orm': (Layer.DOMAIN,),
    'pydantic': (WholeEdge(), TopLevelFolder(name='shared')),
    'structlog': (Layer.ROOT,),
    'tabulate': (TopLevelFolder(name='reports'),),
  },
  workspace_unit_import_names=frozenset({'shop_libs_money'}),
)
APP: Final = 'src/shop/features/orders/presentation/bindings/place_order.py'
DOMAIN: Final = 'src/shop/features/orders/domain/entities/order_entity.py'
LIST_LITERAL_LINE: Final = '    0,'


def _findings(*, path: str, text: str) -> tuple[Finding, ...]:
  sources = Sources(
    files=(Source(path=Path(path), content=text.encode()),),
    package_folder_paths=PACKAGE_FOLDER_PATHS,
  )

  return check_code(
    sources=sources, settings=SETTINGS, standard_module_names=sys.stdlib_module_names
  )


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
    package_folder_paths=PACKAGE_FOLDER_PATHS,
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


def test_should_report_a_file_when_it_does_not_parse() -> None:
  # Act
  findings = _findings(path='src/shop/orders.py', text=python('LIMIT = 1', 'def total('))

  # Assert
  assert findings == (
    Finding(
      path=Path('src/shop/orders.py'),
      line_number=2,
      breach=Unparsable(parser_message="'(' was never closed"),
    ),
  )


@pytest.mark.parametrize(
  ('path', 'text'),
  [
    pytest.param('src/shop/orders.py', function_of(100), id='a function of 100 lines'),
    pytest.param('src/shop/orders.py', python('LIMIT = 1') * 500, id='a file of 500 lines'),
    pytest.param('tests/test_orders.py', function_of(101), id='a long function in a spec'),
    pytest.param(
      'tests/orders_fixtures.py', python('LIMIT = 1') * 501, id='a long helper of specs'
    ),
    pytest.param('src/shop/orders_gen.py', python('LIMIT = 1') * 501, id='a generated file'),
    pytest.param(
      'src/shop/schema_gen/orders.py', python('LIMIT = 1') * 501, id='a generated folder'
    ),
    pytest.param(
      'src/shop/orders.py',
      with_limit_lifted(table_function_of(101)),
      id='a function returning one literal that lifts its limit with a reason',
    ),
    pytest.param(
      'src/shop/orders.py',
      with_limit_lifted(
        python(
          'def table() -> list[int]:',
          '  """The table."""',
          '  return [',
          *[LIST_LITERAL_LINE] * 97,
          '  ]',
        )
      ),
      id='a function returning one literal past its docstring',
    ),
    pytest.param(
      'src/shop/orders.py',
      with_limit_lifted(python('def table() -> None:', '  [', *[LIST_LITERAL_LINE] * 98, '  ]')),
      id='a function whose body is one literal standing alone',
    ),
  ],
)
def test_should_find_nothing_when_the_code_keeps_the_line_limits(path: str, text: str) -> None:
  # Act
  findings = _findings(path=path, text=text)

  # Assert
  assert findings == ()


@pytest.mark.parametrize(
  ('text', 'line_number', 'breach'),
  [
    pytest.param(
      python('LIMIT = 1', '', '', 'async ' + function_of(101)),
      4,
      LongFunction(function_name='tally', line_count=101, limit=100),
      id='a function of more than 100 lines',
    ),
    pytest.param(
      with_limit_lifted(function_of(101), reason=''),
      1,
      LongFunction(function_name='tally', line_count=101, limit=100),
      id='a function that lifts its limit without a reason',
    ),
    pytest.param(
      with_limit_lifted(function_of(101)),
      1,
      LongFunction(function_name='tally', line_count=101, limit=100),
      id='a function that lifts its limit for a body that is no literal',
    ),
    pytest.param(
      with_limit_lifted(
        python(
          'def table() -> list[int]:', '  x = 1', '  return [', *[LIST_LITERAL_LINE] * 97, '  ]'
        )
      ),
      1,
      LongFunction(function_name='table', line_count=101, limit=100),
      id='a function that lifts its limit for a literal after another statement',
    ),
    pytest.param(
      with_limit_lifted(
        python('def table() -> list[int]:', '  return sorted([', *[LIST_LITERAL_LINE] * 98, '  ])')
      ),
      1,
      LongFunction(function_name='table', line_count=101, limit=100),
      id='a function that lifts its limit for a call over a literal',
    ),
    pytest.param(
      python('LIMIT = 1') * 501,
      1,
      LongFile(line_count=501, limit=500),
      id='a file of more than 500 lines',
    ),
  ],
)
def test_should_report_the_code_when_it_passes_a_line_limit(
  text: str, line_number: int, breach: Breach
) -> None:
  # Act
  findings = _findings(path='src/shop/orders.py', text=text)

  # Assert
  assert findings == (
    Finding(path=Path('src/shop/orders.py'), line_number=line_number, breach=breach),
  )


@pytest.mark.parametrize(
  ('path', 'text'),
  [
    pytest.param(
      'src/shop/features/orders/infrastructure/sql/orders_repository.py',
      'from ...domain.entities import Order',
      id="a relative import of a domain role folder's surface",
    ),
    pytest.param(
      'src/shop/features/orders/infrastructure/sql/orders_repository.py',
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
      DOMAIN,
      'from shop.kernel.money import Money',
      id='an absolute import that leaves the feature',
    ),
    pytest.param(
      'src/shop/kernel/money.py',
      'from shop.kernel import currency',
      id='a top-level folder importing itself by its absolute path',
    ),
    pytest.param(
      DOMAIN,
      'from .order_value import Value',
      id='a relative import inside one role folder',
    ),
    pytest.param(
      DOMAIN,
      'from ...app.use_cases.place_order import place',
      id='a relative import into a folder outside the domain',
    ),
    pytest.param(
      'src/shop/features/orders/application/use_cases/queries/list_orders.py',
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
      id='an absolute import past a surface, which the contracts hold',
    ),
    pytest.param(
      'src/shop/libs/money/amount.py',
      'from shop.libs.tabula.sheet import Sheet',
      id="an absolute import past a sibling module's surface, which the contracts hold",
    ),
    pytest.param(
      'src/shop/composition/checkout/presentation/checkout_cli.py',
      'from ..domain.totals import Total',
      id='a relative import inside one module of composition',
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
def test_should_find_nothing_when_an_import_stays_in_its_module(path: str, text: str) -> None:
  # Act
  findings = _findings(path=path, text=text)

  # Assert
  assert findings == ()


@pytest.mark.parametrize(
  ('path', 'text', 'breach'),
  [
    pytest.param(
      DOMAIN,
      'from ....billing import Invoice',
      ImportLeavingModule(importer_module=folder('features/orders')),
      id='a relative import into another feature',
    ),
    pytest.param(
      DOMAIN,
      'from ..... import kernel',
      ImportLeavingModule(importer_module=folder('features/orders')),
      id='a relative import of a name past the feature',
    ),
    pytest.param(
      'src/shop/kernel/money.py',
      'from ..features.orders import Order',
      ImportLeavingModule(importer_module=folder('kernel')),
      id='a relative import out of a top-level folder',
    ),
    pytest.param(
      'src/shop/main.py',
      'from .kernel.money import Money',
      ImportLeavingModule(importer_module=folder('')),
      id='a relative import from the package root into a folder',
    ),
    pytest.param(
      'src/shop/kernel/money.py',
      'from ... import other',
      ImportClimbingOut(),
      id='a relative import past the import package',
    ),
    pytest.param(
      'src/shop/composition/billing/presentation/billing_cli.py',
      'from ...checkout import Checkout',
      ImportLeavingModule(importer_module=folder('composition/billing')),
      id='a relative import into another module of composition',
    ),
    pytest.param(
      'src/shop/composition/billing/presentation/billing_cli.py',
      'from shop.composition.billing.domain import Bill',
      ImportOfItself(imported_name='shop.composition.billing.domain'),
      id='a module of composition importing itself by its absolute path',
    ),
    pytest.param(
      DOMAIN,
      'from shop.features.orders.adapters.sql.orders_repository import OrdersRepository',
      ImportOfItself(imported_name='shop.features.orders.adapters.sql.orders_repository'),
      id='a feature importing itself by its absolute path',
    ),
    pytest.param(
      DOMAIN,
      'import shop.features.orders',
      ImportOfItself(imported_name='shop.features.orders'),
      id='a feature importing its own surface by its absolute path',
    ),
  ],
)
def test_should_report_an_import_when_it_crosses_the_border_of_its_module(
  path: str, text: str, breach: Breach
) -> None:
  # Act
  findings = _findings(path=path, text=text)

  # Assert
  assert findings == (Finding(path=Path(path), line_number=1, breach=breach),)


REPOSITORY: Final = 'src/shop/features/orders/infrastructure/sql/orders_repository.py'
MONEY: Final = 'src/shop/kernel/money.py'


@pytest.mark.parametrize(
  ('path', 'text', 'findings'),
  [
    pytest.param(
      REPOSITORY,
      'import json, shop.features.orders.domain',
      (
        Finding(
          path=Path(REPOSITORY),
          line_number=1,
          breach=ImportOfItself(imported_name='shop.features.orders.domain'),
        ),
      ),
      id='an absolute import of its own module among others',
    ),
    pytest.param(
      MONEY,
      'from .. import features, main',
      (
        Finding(
          path=Path(MONEY),
          line_number=1,
          breach=ImportLeavingModule(importer_module=folder('kernel')),
        ),
        Finding(
          path=Path(MONEY),
          line_number=1,
          breach=ImportLeavingModule(importer_module=folder('kernel')),
        ),
      ),
      id='a relative import of two names out of its module',
    ),
    pytest.param(
      APP,
      'import json, httpx, attrs',
      (
        Finding(
          path=Path(APP),
          line_number=1,
          breach=PackageWithoutHome(
            folder=folder('features/orders/presentation/bindings'), package_name='httpx'
          ),
        ),
        Finding(
          path=Path(APP),
          line_number=1,
          breach=PackageWithoutHome(
            folder=folder('features/orders/presentation/bindings'), package_name='attrs'
          ),
        ),
      ),
      id='two packages without a home',
    ),
  ],
)
def test_should_report_each_name_when_one_import_names_several(
  path: str, text: str, findings: tuple[Finding, ...]
) -> None:
  # Act
  found = _findings(path=path, text=text)

  # Assert
  assert found == findings


@pytest.mark.parametrize(
  ('path', 'text'),
  [
    pytest.param(DOMAIN, 'import dataclasses', id='the standard library in the domain'),
    pytest.param(DOMAIN, 'from __future__ import annotations', id='a future import in the domain'),
    pytest.param(DOMAIN, 'from shop.kernel import Money', id='the import package itself'),
    pytest.param(DOMAIN, 'from .order_value import Value', id='a relative import of a module'),
    pytest.param(APP, 'from . import steps', id='a relative import of a folder'),
    pytest.param(APP, 'import shop_libs_money', id="a unit of the repository's workspace"),
    pytest.param(
      'src/shop/features/orders/infrastructure/http/orders_client.py',
      'import httpx',
      id="a feature's adapter",
    ),
    pytest.param(
      'src/shop/infrastructure/mail/mail_adapter.py', 'import httpx', id='a shared adapter'
    ),
    pytest.param('src/shop/libs/tabula/sheet.py', 'import openpyxl', id='a library of libs/'),
    pytest.param(
      'src/shop/libs/tabula/domain/sheet.py',
      'import openpyxl',
      id='a folder of a library named like a layer',
    ),
    pytest.param('src/shop/root/wiring.py', 'import uvicorn', id='the composition root'),
    pytest.param(
      'src/shop/integrations/fastapi/router.py',
      'from fastapi import APIRouter',
      id='an integration into a host framework',
    ),
    pytest.param(
      'src/shop/features/orders/presentation/bindings/queries/list_orders/list_orders_api.py',
      'from fastapi import APIRouter',
      id="a home that names a feature's application layer",
    ),
    pytest.param(
      'src/shop/composition/checkout/presentation/bindings/commands/pay/pay_api.py',
      'import fastapi',
      id="a home that names a composition module's application layer",
    ),
    pytest.param(
      'src/shop/reports/monthly/sales.py',
      'import tabulate',
      id="a home that names a top-level folder of the project's own",
    ),
    pytest.param(
      'src/shop/composition/checkout/infrastructure/mail/mail_adapter.py',
      'import smtplib',
      id="an effect in a composition module's adapter",
    ),
    pytest.param(
      'src/shop/composition/checkout/presentation/bindings/commands/pay/pay_api.py',
      'from asyncio import sleep',
      id='a binding unit of a composition module schedules its own work',
    ),
    pytest.param('src/shop/main.py', 'import uvicorn', id='the entry file'),
    pytest.param('src/shop/__main__.py', 'import uvicorn', id='the module entry file'),
    pytest.param(
      'src/shop/entrypoints/worker/main.py',
      'import uvicorn',
      id="an entrypoint's entry file",
    ),
    pytest.param(
      'src/shop/shared/parsing/parse_utils.py',
      'import pydantic',
      id='a home that names an inner folder',
    ),
    pytest.param(
      'src/shop/infrastructure/mail/mail_adapter.py',
      'import pydantic',
      id='a home that names the edge',
    ),
    pytest.param('src/shop/root/logging.py', 'import structlog', id='a home inside the edge'),
    pytest.param('tests/test_orders.py', 'import pytest', id='a file outside the source root'),
    pytest.param(
      'src/shop/infrastructure/mail/mail_adapter.py', 'import smtplib', id='an effect in an adapter'
    ),
    pytest.param('src/shop/root/settings.py', 'from os import environ', id='an effect in the root'),
    pytest.param(APP, 'import urllib.parse', id='a pure module of a package with an effectful one'),
    pytest.param(
      'src/shop/root/config/settings.py',
      'HOST = os.environ[NAME]',
      id='the root reads the environment',
    ),
    pytest.param(APP, 'from asyncio import sleep', id='a binding unit schedules its own work'),
    pytest.param(
      'src/shop/main.py', 'HOST = os.getenv(NAME)', id='the entry file reads the environment'
    ),
    pytest.param(
      'src/shop/kernel/constants/kinds_constants.py',
      'from importlib.resources import files',
      id='the package reading its own data',
    ),
    pytest.param(
      'src/shop/infrastructure/clock/clock_adapter.py',
      'STAMP = datetime.now()',
      id='a call to the clock in an adapter',
    ),
    pytest.param(DOMAIN, 'VALUE = (lambda: 1)()', id='a call of something with no name'),
  ],
)
def test_should_find_nothing_when_a_package_or_an_effect_stays_in_its_home(
  path: str, text: str
) -> None:
  # Act
  findings = _findings(path=path, text=text)

  # Assert
  assert findings == ()


@pytest.mark.parametrize(
  ('path', 'text', 'breach'),
  [
    pytest.param(
      DOMAIN,
      'import attrs',
      PackageInPure(folder=folder('features/orders/domain/entities'), package_name='attrs'),
      id='a package in the domain',
    ),
    pytest.param(
      DOMAIN,
      'from orm.fields import Field',
      PackageInPure(folder=folder('features/orders/domain/entities'), package_name='orm'),
      id='a package whose home names the domain',
    ),
    pytest.param(
      'src/shop/features/orders/application/use_cases/commands/place_order.py',
      'import attrs',
      PackageInPure(
        folder=folder('features/orders/application/use_cases/commands'), package_name='attrs'
      ),
      id='a package in the application',
    ),
    pytest.param(
      'src/shop/kernel/money.py',
      'import attrs',
      PackageInPure(folder=folder('kernel'), package_name='attrs'),
      id='a package in the kernel',
    ),
    pytest.param(
      'src/shop/kernel/contracts/mail_port.py',
      'import attrs',
      PackageInPure(folder=folder('kernel/contracts'), package_name='attrs'),
      id='a package in a port the kernel shares',
    ),
    pytest.param(
      'src/shop/contracts/mail/mail_port.py',
      'import attrs',
      PackageWithoutHome(folder=folder('contracts/mail'), package_name='attrs'),
      id='a package in a top-level folder the tree does not name',
    ),
    pytest.param(
      'src/shop/composition/checkout/domain/totals/total.py',
      'import attrs',
      PackageInPure(folder=folder('composition/checkout/domain/totals'), package_name='attrs'),
      id="a package in a composition module's domain",
    ),
    pytest.param(
      'src/shop/composition/checkout/domain/totals/total.py',
      'import time',
      EffectOutsideEdge(
        folder=folder('composition/checkout/domain/totals'), effect_dotted_name='time'
      ),
      id="an effect in a composition module's domain",
    ),
    pytest.param(
      'src/shop/api/orders_api.py',
      'import fastapi',
      PackageOutsideHome(
        folder=folder('api'), package_name='fastapi', home=(WholeEdge(), Layer.PRESENTATION)
      ),
      id='a top-level folder the tree does not name, which is no part of the edge',
    ),
    pytest.param(
      'src/shop/shared/presentation/web.py',
      'import fastapi',
      PackageOutsideHome(
        folder=folder('shared/presentation'),
        package_name='fastapi',
        home=(WholeEdge(), Layer.PRESENTATION),
      ),
      id='a home that names a layer, matched only where the layer is',
    ),
    pytest.param(
      'src/shop/features/reports/presentation/monthly.py',
      'import tabulate',
      PackageOutsideHome(
        folder=folder('features/reports/presentation'),
        package_name='tabulate',
        home=(TopLevelFolder(name='reports'),),
      ),
      id='a home that names a top-level folder, matched only at the top',
    ),
    pytest.param(
      APP,
      'import httpx.auth',
      PackageWithoutHome(
        folder=folder('features/orders/presentation/bindings'), package_name='httpx'
      ),
      id='a package without a home in a binding unit',
    ),
    pytest.param(
      'src/shop/composition/checkout/checkout.py',
      'import httpx',
      PackageWithoutHome(folder=folder('composition/checkout'), package_name='httpx'),
      id='a package without a home in composition',
    ),
    pytest.param(
      'src/shop/utils/text_utils.py',
      'import httpx',
      PackageWithoutHome(folder=folder('utils'), package_name='httpx'),
      id='a package without a home in a role folder at the top of the package',
    ),
    pytest.param(
      'src/shop/version.py',
      'import httpx',
      PackageWithoutHome(folder=folder(''), package_name='httpx'),
      id='a package without a home in a file of the package root',
    ),
    pytest.param(
      'src/shop/entrypoints/worker/jobs.py',
      'import httpx',
      PackageWithoutHome(folder=folder('entrypoints/worker'), package_name='httpx'),
      id="a package without a home beside an entrypoint's entry file",
    ),
    pytest.param(
      'src/shop/entrypoints/worker/jobs/main.py',
      'import httpx',
      PackageWithoutHome(folder=folder('entrypoints/worker/jobs'), package_name='httpx'),
      id='a package without a home in a main file below an entrypoint',
    ),
    pytest.param(
      'src/shop/features/main.py',
      'import httpx',
      PackageWithoutHome(folder=folder('features'), package_name='httpx'),
      id='a package without a home in a main file that is no entry',
    ),
    pytest.param(
      APP,
      'import subprocess',
      EffectOutsideEdge(
        folder=folder('features/orders/presentation/bindings'), effect_dotted_name='subprocess'
      ),
      id='an effect of the standard library in a binding unit',
    ),
    pytest.param(
      DOMAIN,
      'from secrets import token_hex',
      EffectOutsideEdge(
        folder=folder('features/orders/domain/entities'), effect_dotted_name='secrets'
      ),
      id='an effect of the standard library in the domain',
    ),
    pytest.param(
      APP,
      'import urllib.request',
      EffectOutsideEdge(
        folder=folder('features/orders/presentation/bindings'), effect_dotted_name='urllib.request'
      ),
      id='an effectful submodule imported',
    ),
    pytest.param(
      APP,
      'from urllib.request import urlopen',
      EffectOutsideEdge(
        folder=folder('features/orders/presentation/bindings'), effect_dotted_name='urllib.request'
      ),
      id='a name imported from an effectful submodule',
    ),
    pytest.param(
      APP,
      'from uuid import uuid4',
      EffectOutsideEdge(
        folder=folder('features/orders/presentation/bindings'), effect_dotted_name='uuid.uuid4'
      ),
      id='an effectful function imported',
    ),
    pytest.param(
      DOMAIN,
      'STAMP = datetime.now()',
      EffectOutsideEdge(
        folder=folder('features/orders/domain/entities'), effect_dotted_name='datetime.datetime.now'
      ),
      id='the clock called through an imported class',
    ),
    pytest.param(
      DOMAIN,
      'TODAY = date.today()',
      EffectOutsideEdge(
        folder=folder('features/orders/domain/entities'), effect_dotted_name='datetime.date.today'
      ),
      id='the date called through an imported class',
    ),
    pytest.param(
      DOMAIN,
      'IDENTIFIER = uuid.uuid4()',
      EffectOutsideEdge(
        folder=folder('features/orders/domain/entities'), effect_dotted_name='uuid.uuid4'
      ),
      id='an identifier drawn through its module',
    ),
    pytest.param(
      DOMAIN,
      "TEXT = open('orders.txt').read()",
      EffectOutsideEdge(
        folder=folder('features/orders/domain/entities'), effect_dotted_name='open'
      ),
      id='a file opened by the builtin',
    ),
    pytest.param(
      APP,
      'from uuid import uuid7',
      EffectOutsideEdge(
        folder=folder('features/orders/presentation/bindings'), effect_dotted_name='uuid.uuid7'
      ),
      id='a time-ordered identifier imported',
    ),
    pytest.param(
      APP,
      'sys.stdout.write(TEXT)',
      EffectOutsideEdge(
        folder=folder('features/orders/presentation/bindings'), effect_dotted_name='sys.stdout'
      ),
      id='a standard stream written',
    ),
    pytest.param(
      DOMAIN,
      'ARGUMENTS = sys.argv',
      EffectOutsideEdge(
        folder=folder('features/orders/domain/entities'), effect_dotted_name='sys.argv'
      ),
      id='the arguments read',
    ),
    pytest.param(
      APP,
      'PROCESS = asyncio.create_subprocess_exec(COMMAND)',
      EffectOutsideEdge(
        folder=folder('features/orders/presentation/bindings'),
        effect_dotted_name='asyncio.create_subprocess_exec',
      ),
      id='a process started through asyncio',
    ),
    pytest.param(
      DOMAIN,
      'from asyncio import sleep',
      EffectOutsideEdge(
        folder=folder('features/orders/domain/entities'), effect_dotted_name='asyncio.sleep'
      ),
      id='a timer in the domain',
    ),
    pytest.param(
      'src/shop/composition/orders/orders_composition.py',
      'WAIT = threading.Timer(1, run)',
      EffectOutsideEdge(folder=folder('composition/orders'), effect_dotted_name='threading.Timer'),
      id='a timer in a composition module',
    ),
    pytest.param(
      APP,
      'import datetime as dt, json as j; STAMP = dt.datetime.now()',
      EffectOutsideEdge(
        folder=folder('features/orders/presentation/bindings'),
        effect_dotted_name='datetime.datetime.now',
      ),
      id='the clock read through a module imported under another name',
    ),
    pytest.param(
      APP,
      'import json as j; from datetime import datetime as moment; STAMP = moment.now()',
      EffectOutsideEdge(
        folder=folder('features/orders/presentation/bindings'),
        effect_dotted_name='datetime.datetime.now',
      ),
      id='the clock read through a class imported under another name',
    ),
    pytest.param(
      DOMAIN,
      'HERE = Path.cwd()',
      EffectOutsideEdge(
        folder=folder('features/orders/domain/entities'), effect_dotted_name='Path.cwd'
      ),
      id='the working folder read through pathlib',
    ),
    pytest.param(
      APP,
      'from bz2 import open',
      EffectOutsideEdge(
        folder=folder('features/orders/presentation/bindings'), effect_dotted_name='bz2.open'
      ),
      id='a compressed file opened',
    ),
    pytest.param(
      'src/shop/infrastructure/mail/mail_adapter.py',
      'HOST = os.environ[NAME]',
      EnvironmentOutsideRoot(folder=folder('infrastructure/mail'), environment_name='os.environ'),
      id='an adapter reads the environment',
    ),
    pytest.param(
      'src/shop/features/orders/presentation/bindings/commands/sync/sync_cli.py',
      'from os import getenv',
      EffectOutsideEdge(
        folder=folder('features/orders/presentation/bindings/commands/sync'),
        effect_dotted_name='os',
      ),
      id='a delivery unit imports a read of the environment',
    ),
    pytest.param(
      'src/shop/infrastructure/log/log_adapter.py',
      'import structlog',
      PackageOutsideHome(
        folder=folder('infrastructure/log'), package_name='structlog', home=(Layer.ROOT,)
      ),
      id='a package outside a home narrower than the edge',
    ),
    pytest.param(
      APP,
      'from pydantic import BaseModel',
      PackageOutsideHome(
        folder=folder('features/orders/presentation/bindings'),
        package_name='pydantic',
        home=(WholeEdge(), TopLevelFolder(name='shared')),
      ),
      id='a package outside a home that names the edge',
    ),
  ],
)
def test_should_report_a_package_or_an_effect_when_it_leaves_its_home(
  path: str, text: str, breach: Breach
) -> None:
  # Act
  findings = _findings(path=path, text=text)

  # Assert
  assert findings == (Finding(path=Path(path), line_number=1, breach=breach),)


def test_should_report_the_line_of_an_import_when_it_is_not_the_first() -> None:
  # Act
  findings = _findings(path=DOMAIN, text=python('LIMIT = 1', 'import attrs'))

  # Assert
  assert findings == (
    Finding(
      path=Path(DOMAIN),
      line_number=2,
      breach=PackageInPure(folder=folder('features/orders/domain/entities'), package_name='attrs'),
    ),
  )
