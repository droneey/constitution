import { describe, expect, it } from 'bun:test';

import { concept, feature, lintImports, ORDERS } from './import-linter-preset.fixtures';

const KERNEL = 'src/unit/kernel';

const kernel: Readonly<Record<string, string>> = {
  [`${KERNEL}/__init__.py`]: '',
  [`${KERNEL}/dates/__init__.py`]: 'class Calendar:\n  pass\n',
  [`${KERNEL}/values/__init__.py`]: 'class Money:\n  pass\n',
};

const version: Readonly<Record<string, string>> = {
  'src/unit/version.py': 'VERSION = 1\n',
};

const ORDER_AGGREGATE =
  'class Order:\n  pass\n\n\ndef restore_order() -> Order:\n  return Order()\n';
const MEMORY_STORE = 'class MemoryStore:\n  def size(self) -> int:\n    return 0\n';
const ORDERS_CLI = 'from ..application.use_cases import count as count\n';

describe("the configuration import-linter's presets write", () => {
  it('should load in import-linter and keep every contract when a unit follows every block import-linter is configured for', async () => {
    // Act
    const lint = await lintImports();

    // Assert
    expect(lint).toStrictEqual({
      broken: [],
      reported: [],
      status: 0,
    });
  });

  // Why: import-linter takes a key of a contract it does not know without a word, so each such key
  // the presets set has imports it must judge by it.
  it.each([
    {
      condition: 'the composition root builds a feature adapter, which its imports ignore',
      files: {
        ...feature,
        'src/unit/root/__init__.py': '',
        'src/unit/root/wiring.py':
          'from unit.features.orders.infrastructure.memory_store import MemoryStore\n\nSTORE = MemoryStore()\n',
      },
      lint: {
        broken: [],
        reported: [],
        status: 0,
      },
    },
    {
      condition:
        'a binding unit reaches a port only through a use case, as indirect imports are allowed',
      files: feature,
      lint: {
        broken: [],
        reported: [],
        status: 0,
      },
    },
    {
      condition: "a binding unit names a read model the surface of its feature's use cases offers",
      files: {
        ...feature,
        [`${ORDERS}/application/contracts/__init__.py`]:
          'from typing import Protocol\n\n\nclass OrderCount:\n  pass\n\n\nclass Store(Protocol):\n  def size(self) -> int: ...\n',
        [`${ORDERS}/application/use_cases/__init__.py`]:
          'from ..contracts import OrderCount as OrderCount\nfrom .count import count as count\n',
        [`${ORDERS}/presentation/orders_cli.py`]:
          'from ..application.use_cases import OrderCount as OrderCount\nfrom ..application.use_cases import count as count\n',
      },
      lint: {
        broken: [],
        reported: [],
        status: 0,
      },
    },
    {
      condition: "a binding unit imports a port from its feature's contracts",
      files: {
        ...feature,
        [`${ORDERS}/presentation/orders_cli.py`]:
          'from ..application.contracts import Store as Store\n',
      },
      lint: {
        broken: [
          'binding-unit-calls-only-use-cases',
        ],
        reported: [],
        status: 1,
      },
    },
    {
      condition:
        'a binding unit builds an adapter, which only the adapters themselves and not their packages may',
      files: {
        ...feature,
        [`${ORDERS}/presentation/orders_cli.py`]:
          'from ..infrastructure.memory_store import MemoryStore\n\nSTORE = MemoryStore()\n',
      },
      lint: {
        broken: [
          'adapter-imported-only-by-the-root',
        ],
        reported: [],
        status: 1,
      },
    },
    {
      condition:
        'a binding unit reaches the transitions only through a use case, and an adapter rebuilds an aggregate beside its root',
      files: {
        ...feature,
        ...concept,
        [`${ORDERS}/application/use_cases/ship.py`]:
          'from ...domain.order.transitions import ship_order as ship_order\n',
        [`${ORDERS}/presentation/ship_cli.py`]:
          'from ..application.use_cases.ship import ship_order as ship_order\n',
        [`${ORDERS}/infrastructure/order_store.py`]:
          'from ..domain.order.entities import restore_order as restore_order\n',
      },
      lint: {
        broken: [],
        reported: [],
        status: 0,
      },
    },
    {
      condition: "a binding unit calls an aggregate's transition",
      files: {
        ...feature,
        ...concept,
        [`${ORDERS}/presentation/ship_cli.py`]:
          'from ..domain.order.transitions import ship_order as ship_order\n',
      },
      lint: {
        broken: [
          'domain-model-changed-only-through-a-use-case',
        ],
        reported: [],
        status: 1,
      },
    },
    {
      condition: "an adapter calls an aggregate's transition",
      files: {
        ...feature,
        ...concept,
        [`${ORDERS}/infrastructure/order_store.py`]:
          'from ..domain.order.transitions import ship_order as ship_order\n',
      },
      lint: {
        broken: [
          'domain-model-changed-only-through-a-use-case',
        ],
        reported: [],
        status: 1,
      },
    },
    {
      condition: 'a binding unit imports a concept folder of the domain',
      files: {
        ...feature,
        ...concept,
        [`${ORDERS}/presentation/ship_cli.py`]: 'from ..domain import order as order\n',
      },
      lint: {
        broken: [
          'surface-only-on-a-module-or-one-kind',
        ],
        reported: [],
        status: 1,
      },
    },
  ])('should judge the imports by the contract keys when $condition', async ({ files, lint }) => {
    // Act
    const judged = await lintImports(files);

    // Assert
    expect(judged).toStrictEqual(lint);
  });

  // Why: each contract a plugin of the presets registers is proven on the imports it reports and on
  // those its rule allows, its exemptions included.
  it.each([
    {
      condition: 'a relative import leaves its feature',
      files: {
        ...feature,
        ...kernel,
        [`${ORDERS}/presentation/orders_cli.py`]: 'from ....kernel.values import Money as Money\n',
      },
      lint: {
        broken: [
          'relative-imports-stay-in-the-module',
        ],
        reported: [
          `${ORDERS}/presentation/orders_cli.py:1`,
        ],
        status: 1,
      },
    },
    {
      condition: 'a relative import leaves its top-level folder',
      files: {
        'src/unit/libs/__init__.py': '',
        'src/unit/libs/tabula/__init__.py': 'class Sheet:\n  pass\n',
        'src/unit/shared/__init__.py': '',
        'src/unit/shared/text/__init__.py': '',
        'src/unit/shared/text/text_utils.py': 'from ...libs.tabula import Sheet as Sheet\n',
      },
      lint: {
        broken: [
          'relative-imports-stay-in-the-module',
        ],
        reported: [
          'src/unit/shared/text/text_utils.py:1',
        ],
        status: 1,
      },
    },
    {
      condition: 'a relative import climbs out of the import package',
      files: {
        ...kernel,
        [`${KERNEL}/values/money.py`]: 'from .... import other as other\n',
      },
      lint: {
        broken: [
          'relative-imports-stay-in-the-module',
        ],
        reported: [
          `${KERNEL}/values/money.py:1`,
        ],
        status: 1,
      },
    },
    {
      condition: 'a file directly in the import package imports relatively',
      files: {
        ...version,
        'src/unit/main.py': 'from .version import VERSION as VERSION\n',
      },
      lint: {
        broken: [
          'relative-imports-stay-in-the-module',
        ],
        reported: [
          'src/unit/main.py:1',
        ],
        status: 1,
      },
    },
    {
      condition: "the import package's own surface re-exports a folder's name by a relative import",
      files: {
        ...kernel,
        'src/unit/__init__.py': 'from .kernel.values import Money as Money\n',
      },
      lint: {
        broken: [],
        reported: [],
        status: 0,
      },
    },
    {
      condition: "a relative import reaches another module's surface in its top-level folder",
      files: {
        ...kernel,
        [`${KERNEL}/values/money.py`]: 'from ..dates import Calendar as Calendar\n',
      },
      lint: {
        broken: [],
        reported: [],
        status: 0,
      },
    },
    {
      condition: 'a feature imports the kernel by its absolute path',
      files: {
        ...feature,
        ...kernel,
        [`${ORDERS}/presentation/orders_cli.py`]: 'from unit.kernel.values import Money as Money\n',
      },
      lint: {
        broken: [],
        reported: [],
        status: 0,
      },
    },
    {
      condition: 'a top-level folder that is no feature imports itself by its absolute path',
      files: {
        ...kernel,
        [`${KERNEL}/values/money.py`]: 'from unit.kernel.dates import Calendar as Calendar\n',
      },
      lint: {
        broken: [],
        reported: [],
        status: 0,
      },
    },
    {
      condition: 'a file directly in the import package imports by its absolute path',
      files: {
        ...version,
        'src/unit/main.py': 'from unit.version import VERSION as VERSION\n',
      },
      lint: {
        broken: [],
        reported: [],
        status: 0,
      },
    },
    {
      condition: 'the domain imports an installed package',
      files: {
        ...feature,
        ...concept,
        [`${ORDERS}/domain/order/entities/order_aggregate.py`]: `import attrs\n\n\n${ORDER_AGGREGATE}`,
      },
      lint: {
        broken: [
          'layer-imports-dependencies-by-its-role',
        ],
        reported: [
          `${ORDERS}/domain/order/entities/order_aggregate.py:1`,
        ],
        status: 1,
      },
    },
    {
      condition: 'the kernel imports an installed package',
      files: {
        ...kernel,
        [`${KERNEL}/values/__init__.py`]: 'import attrs\n',
      },
      lint: {
        broken: [
          'layer-imports-dependencies-by-its-role',
        ],
        reported: [
          `${KERNEL}/values/__init__.py:1`,
        ],
        status: 1,
      },
    },
    {
      condition: 'a value object imports a format library whose home is the domain',
      files: {
        ...feature,
        ...concept,
        [`${ORDERS}/domain/order/entities/order_aggregate.py`]: `import phonenumbers\n\n\n${ORDER_AGGREGATE}`,
      },
      lint: {
        broken: [],
        reported: [],
        status: 0,
      },
    },
    {
      condition: 'the kernel imports a format library whose home is the kernel',
      files: {
        ...kernel,
        [`${KERNEL}/values/__init__.py`]: 'import phonenumbers\n',
      },
      lint: {
        broken: [],
        reported: [],
        status: 0,
      },
    },
    {
      condition: 'a binding unit imports an installed package with no home',
      files: {
        ...feature,
        [`${ORDERS}/presentation/orders_cli.py`]: `import httpx\n${ORDERS_CLI}`,
      },
      lint: {
        broken: [
          'layer-imports-dependencies-by-its-role',
        ],
        reported: [
          `${ORDERS}/presentation/orders_cli.py:1`,
        ],
        status: 1,
      },
    },
    {
      condition: 'a file of the package root that is no entry imports a package with no home',
      files: {
        'src/unit/version.py': 'import httpx\n',
      },
      lint: {
        broken: [
          'layer-imports-dependencies-by-its-role',
        ],
        reported: [
          'src/unit/version.py:1',
        ],
        status: 1,
      },
    },
    {
      condition: "a file beside an entrypoint's entry file imports a package with no home",
      files: {
        'src/unit/entrypoints/__init__.py': '',
        'src/unit/entrypoints/worker/__init__.py': '',
        'src/unit/entrypoints/worker/jobs.py': 'import httpx\n',
      },
      lint: {
        broken: [
          'layer-imports-dependencies-by-its-role',
        ],
        reported: [
          'src/unit/entrypoints/worker/jobs.py:1',
        ],
        status: 1,
      },
    },
    {
      condition: 'an adapter imports a package outside a home narrower than the edge',
      files: {
        ...feature,
        [`${ORDERS}/infrastructure/memory_store.py`]: `import structlog\n\n\n${MEMORY_STORE}`,
      },
      lint: {
        broken: [
          'layer-imports-dependencies-by-its-role',
        ],
        reported: [
          `${ORDERS}/infrastructure/memory_store.py:1`,
        ],
        status: 1,
      },
    },
    {
      condition: 'a shared folder named like the layer a home names imports the package',
      files: {
        'src/unit/shared/__init__.py': '',
        'src/unit/shared/presentation/__init__.py': '',
        'src/unit/shared/presentation/web.py': 'import fastapi\n',
      },
      lint: {
        broken: [
          'layer-imports-dependencies-by-its-role',
        ],
        reported: [
          'src/unit/shared/presentation/web.py:1',
        ],
        status: 1,
      },
    },
    {
      condition: "a feature's folder named like a top-level home imports its package",
      files: {
        ...feature,
        [`${ORDERS}/shared/__init__.py`]: '',
        [`${ORDERS}/shared/parse_utils.py`]: 'import pydantic\n',
      },
      lint: {
        broken: [
          'layer-imports-dependencies-by-its-role',
        ],
        reported: [
          `${ORDERS}/shared/parse_utils.py:1`,
        ],
        status: 1,
      },
    },
    {
      condition: 'the domain imports the standard library and a future import',
      files: {
        ...feature,
        ...concept,
        [`${ORDERS}/domain/order/entities/order_aggregate.py`]: `from __future__ import annotations\n\nimport dataclasses\n\nFIELDS = dataclasses.fields\n\n\n${ORDER_AGGREGATE}`,
      },
      lint: {
        broken: [],
        reported: [],
        status: 0,
      },
    },
    {
      condition: 'a binding unit imports a unit of the workspace',
      files: {
        ...feature,
        [`${ORDERS}/presentation/orders_cli.py`]: `import unit_money\n${ORDERS_CLI}`,
      },
      lint: {
        broken: [],
        reported: [],
        status: 0,
      },
    },
    {
      condition: "a feature's adapter imports a package with no home",
      files: {
        ...feature,
        [`${ORDERS}/infrastructure/memory_store.py`]: `import httpx\n\n\n${MEMORY_STORE}`,
      },
      lint: {
        broken: [],
        reported: [],
        status: 0,
      },
    },
    {
      condition: 'a binding unit imports a package whose home names the presentation',
      files: {
        ...feature,
        [`${ORDERS}/presentation/orders_cli.py`]: `import fastapi\n${ORDERS_CLI}`,
      },
      lint: {
        broken: [],
        reported: [],
        status: 0,
      },
    },
    {
      condition: 'the composition root imports a package whose home it is',
      files: {
        'src/unit/root/__init__.py': '',
        'src/unit/root/logging.py': 'import structlog\n',
      },
      lint: {
        broken: [],
        reported: [],
        status: 0,
      },
    },
    {
      condition: 'the entry file imports a package with no home',
      files: {
        'src/unit/main.py': 'import uvicorn\n',
      },
      lint: {
        broken: [],
        reported: [],
        status: 0,
      },
    },
    {
      condition: 'a shared folder imports a package whose home names the top-level shared folder',
      files: {
        'src/unit/shared/__init__.py': '',
        'src/unit/shared/parsing/__init__.py': '',
        'src/unit/shared/parsing/parse_utils.py': 'import pydantic\n',
      },
      lint: {
        broken: [],
        reported: [],
        status: 0,
      },
    },
  ])(
    'should hold the rule of each contract a plugin registers when $condition',
    async ({ files, lint }) => {
      // Act
      const judged = await lintImports(files);

      // Assert
      expect(judged).toStrictEqual(lint);
    },
  );
});
