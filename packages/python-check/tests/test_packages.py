import ast
from pathlib import Path

import pytest

from droneey_python_check.findings import Finding, Rule
from droneey_python_check.packages import package_findings
from droneey_python_check.settings import Settings

SETTINGS = Settings(
  homes={
    'fastapi': ('edge', 'app'),
    'orm': ('domain',),
    'pydantic': ('edge', 'shared'),
    'structlog': ('root',),
  },
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
    pytest.param(
      'src/shop/features/orders/app/use_cases/queries/list_orders/list_orders_api.py',
      'from fastapi import APIRouter',
      id="a home that names a feature's application layer",
    ),
    pytest.param(
      'src/shop/composition/checkout/app/use_cases/commands/pay/pay_api.py',
      'import fastapi',
      id="a home that names a composition module's application layer",
    ),
    pytest.param(
      'src/shop/composition/checkout/adapters/mail/mail_adapter.py',
      'import smtplib',
      id="an effect in a composition module's adapter",
    ),
    pytest.param(
      'src/shop/composition/checkout/app/use_cases/commands/pay/pay_api.py',
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
      'src/shop/adapters/mail/mail_adapter.py', 'import pydantic', id='a home that names the edge'
    ),
    pytest.param('src/shop/root/logging.py', 'import structlog', id='a home inside the edge'),
    pytest.param('tests/test_orders.py', 'import pytest', id='a file outside the source root'),
    pytest.param(
      'src/shop/adapters/mail/mail_adapter.py', 'import smtplib', id='an effect in an adapter'
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
      'src/shop/adapters/clock/clock_adapter.py',
      'STAMP = datetime.now()',
      id='a call to the clock in an adapter',
    ),
    pytest.param(DOMAIN, 'VALUE = (lambda: 1)()', id='a call of something with no name'),
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
  ('importer', 'statement', 'breach'),
  [
    pytest.param(
      DOMAIN,
      'import attrs',
      (Rule.PACKAGE_IN_PURE, ('features/orders/domain/entities', 'attrs')),
      id='a package in the domain',
    ),
    pytest.param(
      DOMAIN,
      'from orm.fields import Field',
      (Rule.PACKAGE_IN_PURE, ('features/orders/domain/entities', 'orm')),
      id='a package whose home names the domain',
    ),
    pytest.param(
      'src/shop/kernel/money.py',
      'import attrs',
      (Rule.PACKAGE_IN_PURE, ('kernel', 'attrs')),
      id='a package in the kernel',
    ),
    pytest.param(
      'src/shop/kernel/contracts/mail_port.py',
      'import attrs',
      (Rule.PACKAGE_IN_PURE, ('kernel/contracts', 'attrs')),
      id='a package in a port the kernel shares',
    ),
    pytest.param(
      'src/shop/contracts/mail/mail_port.py',
      'import attrs',
      (Rule.PACKAGE_WITHOUT_HOME, ('attrs', 'contracts/mail')),
      id='a package in a top-level folder the tree does not name',
    ),
    pytest.param(
      'src/shop/composition/checkout/domain/totals/total.py',
      'import attrs',
      (Rule.PACKAGE_IN_PURE, ('composition/checkout/domain/totals', 'attrs')),
      id="a package in a composition module's domain",
    ),
    pytest.param(
      'src/shop/composition/checkout/domain/totals/total.py',
      'import time',
      (Rule.EFFECT_OUTSIDE_EDGE, ('composition/checkout/domain/totals', 'time')),
      id="an effect in a composition module's domain",
    ),
    pytest.param(
      'src/shop/api/orders_api.py',
      'import fastapi',
      (Rule.PACKAGE_OUTSIDE_HOME, ('fastapi', 'api', 'edge, app')),
      id='a top-level folder the tree does not name, which is no part of the edge',
    ),
    pytest.param(
      'src/shop/shared/app/web.py',
      'import fastapi',
      (Rule.PACKAGE_OUTSIDE_HOME, ('fastapi', 'shared/app', 'edge, app')),
      id='a home that names a layer, matched only where the layer is',
    ),
    pytest.param(
      APP,
      'import httpx.auth',
      (Rule.PACKAGE_WITHOUT_HOME, ('httpx', 'features/orders/app/use_cases')),
      id='a package without a home in a binding unit',
    ),
    pytest.param(
      'src/shop/composition/checkout/checkout.py',
      'import httpx',
      (Rule.PACKAGE_WITHOUT_HOME, ('httpx', 'composition/checkout')),
      id='a package without a home in composition',
    ),
    pytest.param(
      'src/shop/utils/text_utils.py',
      'import httpx',
      (Rule.PACKAGE_WITHOUT_HOME, ('httpx', 'utils')),
      id='a package without a home in a role folder at the top of the package',
    ),
    pytest.param(
      'src/shop/version.py',
      'import httpx',
      (Rule.PACKAGE_WITHOUT_HOME, ('httpx', 'the package root')),
      id='a package without a home in a file of the package root',
    ),
    pytest.param(
      'src/shop/entrypoints/worker/jobs.py',
      'import httpx',
      (Rule.PACKAGE_WITHOUT_HOME, ('httpx', 'entrypoints/worker')),
      id="a package without a home beside an entrypoint's entry file",
    ),
    pytest.param(
      'src/shop/entrypoints/worker/jobs/main.py',
      'import httpx',
      (Rule.PACKAGE_WITHOUT_HOME, ('httpx', 'entrypoints/worker/jobs')),
      id='a package without a home in a main file below an entrypoint',
    ),
    pytest.param(
      'src/shop/features/main.py',
      'import httpx',
      (Rule.PACKAGE_WITHOUT_HOME, ('httpx', 'features')),
      id='a package without a home in a main file that is no entry',
    ),
    pytest.param(
      APP,
      'import subprocess',
      (Rule.EFFECT_OUTSIDE_EDGE, ('features/orders/app/use_cases', 'subprocess')),
      id='an effect of the standard library in a binding unit',
    ),
    pytest.param(
      DOMAIN,
      'from secrets import token_hex',
      (Rule.EFFECT_OUTSIDE_EDGE, ('features/orders/domain/entities', 'secrets')),
      id='an effect of the standard library in the domain',
    ),
    pytest.param(
      APP,
      'import urllib.request',
      (Rule.EFFECT_OUTSIDE_EDGE, ('features/orders/app/use_cases', 'urllib.request')),
      id='an effectful submodule imported',
    ),
    pytest.param(
      APP,
      'from urllib.request import urlopen',
      (Rule.EFFECT_OUTSIDE_EDGE, ('features/orders/app/use_cases', 'urllib.request')),
      id='a name imported from an effectful submodule',
    ),
    pytest.param(
      APP,
      'from uuid import uuid4',
      (Rule.EFFECT_OUTSIDE_EDGE, ('features/orders/app/use_cases', 'uuid.uuid4')),
      id='an effectful function imported',
    ),
    pytest.param(
      DOMAIN,
      'STAMP = datetime.now()',
      (Rule.EFFECT_OUTSIDE_EDGE, ('features/orders/domain/entities', 'datetime.datetime.now')),
      id='the clock called through an imported class',
    ),
    pytest.param(
      DOMAIN,
      'TODAY = date.today()',
      (Rule.EFFECT_OUTSIDE_EDGE, ('features/orders/domain/entities', 'datetime.date.today')),
      id='the date called through an imported class',
    ),
    pytest.param(
      DOMAIN,
      'IDENTIFIER = uuid.uuid4()',
      (Rule.EFFECT_OUTSIDE_EDGE, ('features/orders/domain/entities', 'uuid.uuid4')),
      id='an identifier drawn through its module',
    ),
    pytest.param(
      DOMAIN,
      "TEXT = open('orders.txt').read()",
      (Rule.EFFECT_OUTSIDE_EDGE, ('features/orders/domain/entities', 'open')),
      id='a file opened by the builtin',
    ),
    pytest.param(
      APP,
      'from uuid import uuid7',
      (Rule.EFFECT_OUTSIDE_EDGE, ('features/orders/app/use_cases', 'uuid.uuid7')),
      id='a time-ordered identifier imported',
    ),
    pytest.param(
      APP,
      'sys.stdout.write(TEXT)',
      (Rule.EFFECT_OUTSIDE_EDGE, ('features/orders/app/use_cases', 'sys.stdout')),
      id='a standard stream written',
    ),
    pytest.param(
      DOMAIN,
      'ARGUMENTS = sys.argv',
      (Rule.EFFECT_OUTSIDE_EDGE, ('features/orders/domain/entities', 'sys.argv')),
      id='the arguments read',
    ),
    pytest.param(
      APP,
      'PROCESS = asyncio.create_subprocess_exec(COMMAND)',
      (
        Rule.EFFECT_OUTSIDE_EDGE,
        ('features/orders/app/use_cases', 'asyncio.create_subprocess_exec'),
      ),
      id='a process started through asyncio',
    ),
    pytest.param(
      DOMAIN,
      'from asyncio import sleep',
      (Rule.EFFECT_OUTSIDE_EDGE, ('features/orders/domain/entities', 'asyncio.sleep')),
      id='a timer in the domain',
    ),
    pytest.param(
      'src/shop/composition/orders/orders_composition.py',
      'WAIT = threading.Timer(1, run)',
      (Rule.EFFECT_OUTSIDE_EDGE, ('composition/orders', 'threading.Timer')),
      id='a timer in a composition module',
    ),
    pytest.param(
      APP,
      'import datetime as dt, json as j; STAMP = dt.datetime.now()',
      (Rule.EFFECT_OUTSIDE_EDGE, ('features/orders/app/use_cases', 'datetime.datetime.now')),
      id='the clock read through a module imported under another name',
    ),
    pytest.param(
      APP,
      'import json as j; from datetime import datetime as moment; STAMP = moment.now()',
      (Rule.EFFECT_OUTSIDE_EDGE, ('features/orders/app/use_cases', 'datetime.datetime.now')),
      id='the clock read through a class imported under another name',
    ),
    pytest.param(
      DOMAIN,
      'HERE = Path.cwd()',
      (Rule.EFFECT_OUTSIDE_EDGE, ('features/orders/domain/entities', 'Path.cwd')),
      id='the working folder read through pathlib',
    ),
    pytest.param(
      APP,
      'from bz2 import open',
      (Rule.EFFECT_OUTSIDE_EDGE, ('features/orders/app/use_cases', 'bz2.open')),
      id='a compressed file opened',
    ),
    pytest.param(
      'src/shop/adapters/mail/mail_adapter.py',
      'HOST = os.environ[NAME]',
      (Rule.ENVIRONMENT_OUTSIDE_ROOT, ('adapters/mail', 'os.environ')),
      id='an adapter reads the environment',
    ),
    pytest.param(
      'src/shop/features/orders/app/use_cases/commands/sync/sync_cli.py',
      'from os import getenv',
      (Rule.EFFECT_OUTSIDE_EDGE, ('features/orders/app/use_cases/commands/sync', 'os')),
      id='a delivery unit imports a read of the environment',
    ),
    pytest.param(
      'src/shop/adapters/log/log_adapter.py',
      'import structlog',
      (Rule.PACKAGE_OUTSIDE_HOME, ('structlog', 'adapters/log', 'root')),
      id='a package outside a home narrower than the edge',
    ),
    pytest.param(
      APP,
      'from pydantic import BaseModel',
      (Rule.PACKAGE_OUTSIDE_HOME, ('pydantic', 'features/orders/app/use_cases', 'edge, shared')),
      id='a package outside a home that names the edge',
    ),
  ],
)
def test_should_report_a_package_when_it_is_imported_outside_its_home(
  *,
  importer: str,
  statement: str,
  breach: tuple[Rule, tuple[str, ...]],
) -> None:
  # Arrange
  code = statement

  # Act
  findings = _findings(importer=importer, statement=code)

  # Assert
  assert findings == (Finding(path=Path(importer), line=1, rule=breach[0], values=breach[1]),)


def test_should_report_each_package_when_one_import_names_several() -> None:
  # Arrange
  statement = 'import json, httpx, attrs'

  # Act
  findings = _findings(importer=APP, statement=statement)

  # Assert
  assert findings == (
    Finding(
      path=Path(APP),
      line=1,
      rule=Rule.PACKAGE_WITHOUT_HOME,
      values=('httpx', 'features/orders/app/use_cases'),
    ),
    Finding(
      path=Path(APP),
      line=1,
      rule=Rule.PACKAGE_WITHOUT_HOME,
      values=('attrs', 'features/orders/app/use_cases'),
    ),
  )


def test_should_report_the_line_of_the_import_when_it_is_not_the_first() -> None:
  # Arrange
  statement = 'LIMIT = 1\nimport attrs\n'

  # Act
  findings = _findings(importer=DOMAIN, statement=statement)

  # Assert
  assert findings == (
    Finding(
      path=Path(DOMAIN),
      line=2,
      rule=Rule.PACKAGE_IN_PURE,
      values=('features/orders/domain/entities', 'attrs'),
    ),
  )
