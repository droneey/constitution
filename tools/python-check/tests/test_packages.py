import ast
from pathlib import Path

import pytest
from python_check.findings import Finding
from python_check.packages import package_findings
from python_check.settings import Settings

SETTINGS = Settings(
  homes={'pydantic': ('edge', 'shared'), 'structlog': ('root',), 'orm': ('domain',)},
  units=frozenset({'shop_libs_money'}),
)

APP = 'src/shop/features/orders/app/use_cases/place_order.py'
DOMAIN = 'src/shop/features/orders/domain/entities/order_entity.py'


def _findings(*, importer: str, statement: str) -> tuple[Finding, ...]:
  return package_findings(path=Path(importer), settings=SETTINGS, tree=ast.parse(statement))


@pytest.mark.parametrize(
  ('importer', 'statement'),
  [
    pytest.param(DOMAIN, 'import dataclasses', id='the standard library in the domain'),
    pytest.param(DOMAIN, 'from __future__ import annotations', id='a future import in the domain'),
    pytest.param(DOMAIN, 'from shop.kernel import Money', id='the import package itself'),
    pytest.param(DOMAIN, 'from .order_value import Value', id='a relative import of a module'),
    pytest.param(APP, 'from . import steps', id='a relative import of a folder'),
    pytest.param(APP, 'import shop_libs_money', id="a unit of the repository's workspace"),
    pytest.param(
      'src/shop/features/orders/adapters/http/orders_client.py',
      'import httpx',
      id="a feature's adapter",
    ),
    pytest.param('src/shop/adapters/mail/mail_adapter.py', 'import httpx', id='a shared adapter'),
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
    pytest.param('src/shop/api/orders_api.py', 'import fastapi', id='the delivery layer'),
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
    pytest.param('src/shop/api/orders_api.py', 'import pydantic', id='a home that names the edge'),
    pytest.param('src/shop/root/logging.py', 'import structlog', id='a home inside the edge'),
    pytest.param('tests/test_orders.py', 'import pytest', id='a file outside the source root'),
  ],
)
def test_should_find_nothing_when_a_package_is_imported_in_its_home(
  *,
  importer: str,
  statement: str,
) -> None:
  # Arrange
  code = statement

  # Act
  findings = _findings(importer=importer, statement=code)

  # Assert
  assert findings == ()


@pytest.mark.parametrize(
  ('importer', 'statement', 'message'),
  [
    pytest.param(
      DOMAIN,
      'import attrs',
      'features/orders/domain/entities imports no package, and attrs is one',
      id='a package in the domain',
    ),
    pytest.param(
      DOMAIN,
      'from orm.fields import Field',
      'features/orders/domain/entities imports no package, and orm is one',
      id='a package whose home names the domain',
    ),
    pytest.param(
      'src/shop/kernel/money.py',
      'import attrs',
      'kernel imports no package, and attrs is one',
      id='a package in the kernel',
    ),
    pytest.param(
      'src/shop/contracts/mail/mail_port.py',
      'import attrs',
      'contracts/mail imports no package, and attrs is one',
      id='a package in a shared contract',
    ),
    pytest.param(
      APP,
      'import httpx.auth',
      (
        'httpx has no home in features/orders/app/use_cases; '
        'a package without one is imported at the edge'
      ),
      id='a package without a home in a binding unit',
    ),
    pytest.param(
      'src/shop/composition/checkout/checkout.py',
      'import httpx',
      'httpx has no home in composition/checkout; a package without one is imported at the edge',
      id='a package without a home in composition',
    ),
    pytest.param(
      'src/shop/utils/text_utils.py',
      'import httpx',
      'httpx has no home in utils; a package without one is imported at the edge',
      id='a package without a home in a role folder at the top of the package',
    ),
    pytest.param(
      'src/shop/version.py',
      'import httpx',
      'httpx has no home in the package root; a package without one is imported at the edge',
      id='a package without a home in a file of the package root',
    ),
    pytest.param(
      'src/shop/entrypoints/worker/jobs.py',
      'import httpx',
      'httpx has no home in entrypoints/worker; a package without one is imported at the edge',
      id="a package without a home beside an entrypoint's entry file",
    ),
    pytest.param(
      'src/shop/entrypoints/worker/jobs/main.py',
      'import httpx',
      (
        'httpx has no home in entrypoints/worker/jobs; '
        'a package without one is imported at the edge'
      ),
      id='a package without a home in a main file below an entrypoint',
    ),
    pytest.param(
      'src/shop/features/main.py',
      'import httpx',
      'httpx has no home in features; a package without one is imported at the edge',
      id='a package without a home in a main file that is no entry',
    ),
    pytest.param(
      'src/shop/adapters/log/log_adapter.py',
      'import structlog',
      'structlog is imported in adapters/log, outside its home: root',
      id='a package outside a home narrower than the edge',
    ),
    pytest.param(
      APP,
      'from pydantic import BaseModel',
      'pydantic is imported in features/orders/app/use_cases, outside its home: edge, shared',
      id='a package outside a home that names the edge',
    ),
  ],
)
def test_should_report_a_package_when_it_is_imported_outside_its_home(
  *,
  importer: str,
  statement: str,
  message: str,
) -> None:
  # Arrange
  code = statement

  # Act
  findings = _findings(importer=importer, statement=code)

  # Assert
  assert findings == (Finding(path=Path(importer), line=1, message=message),)


def test_should_report_each_package_when_one_import_names_several() -> None:
  # Arrange
  statement = 'import json, httpx, attrs'

  # Act
  findings = _findings(importer=APP, statement=statement)

  # Assert
  assert [finding.message.split()[0] for finding in findings] == ['httpx', 'attrs']


def test_should_report_the_line_of_the_import_when_it_is_not_the_first() -> None:
  # Arrange
  statement = 'LIMIT = 1\nimport attrs\n'

  # Act
  findings = _findings(importer=DOMAIN, statement=statement)

  # Assert
  assert [finding.line for finding in findings] == [2]
