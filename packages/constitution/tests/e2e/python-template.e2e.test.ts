import { beforeAll, describe, expect, it } from 'bun:test';

import {
  createTaskBatch,
  isFoundIn,
  partTable,
  python,
  templateTable,
} from './python-template.fixtures';

const { runOf, runRegistered, taskCase, taskCases } = createTaskBatch();

// The runs of the check, mutmut's above all, take seconds each, not milliseconds.
const RUNS_MS = 600_000;
const manyLines = Array.from(
  {
    length: 100,
  },
  () => '  total += 1',
);
const longFunction = python('def tally() -> int:', '  total = 0', ...manyLines, '  return total');
const tangled = python(
  'def tangle(items: list[int]) -> int:',
  '  count = 0',
  '  for item in items:',
  '    if item > 0:',
  '      for other in items:',
  '        if other > item:',
  '          if other % 2 == 0:',
  '            count += 1',
  '          elif other % 3 == 0:',
  '            count -= 1',
  '          else:',
  '            count += 2',
  '  return count',
);
const specOfOneCase = python(
  'from shop.orders import total',
  '',
  '',
  'def test_should_subtract_the_discount() -> None:',
  '  # Arrange',
  '  prices = [3, 4]',
  '',
  '  # Act',
  '  result = total(prices, discount=2)',
  '',
  '  # Assert',
  '  assert result == 5',
);

const ordersWithLabel = (comment: string): string =>
  python(
    'def total(prices: list[int], *, discount: int) -> int:',
    '  return max(sum(prices) - discount, 0)',
    '',
    '',
    'async def totals(baskets: list[list[int]]) -> list[int]:',
    '  return [total(basket, discount=0) for basket in baskets]',
    '',
    '',
    'def label() -> str:',
    `  return 'orders'${comment}`,
  );

// A feature's folders, as core's tree lays them out, before a case adds a layer.
const feature = {
  'src/shop/features/__init__.py': '',
  'src/shop/features/orders/__init__.py': '',
};

const spec = (...body: readonly string[]): string =>
  python(
    'import socket',
    'import warnings',
    '',
    'import pytest',
    'from hypothesis import given',
    'from hypothesis import strategies as st',
    '',
    'from shop.orders import total',
    '',
    '',
    ...body,
  );

// The runs of every table are run before the first case.
beforeAll(runRegistered, RUNS_MS);

describe('the python template', () => {
  it.each([
    'complexipy',
    'deptry',
    'vulture',
  ])("should carry the settings of %s's part, which reads no file but the project's", (tool) => {
    // Arrange
    const part = partTable(tool);

    // Act
    const template = templateTable(tool);

    // Assert
    expect(template).toStrictEqual(part);
  });

  const wholeCheck = taskCase({
    changes: {
      'src/shop/orders.py': python(
        'def total(prices: list[int], *, discount: int) -> int:',
        '  return max(0, sum(prices) - discount)',
        '',
        '',
        'async def totals(baskets: list[list[int]]) -> list[int]:',
        '  return [total(basket, discount=0) for basket in baskets]',
      ),
    },
    task: 'check',
  });

  it('should pass the whole check when the specs kill every mutant of a changed function', () => {
    // Arrange
    const checked = wholeCheck;

    // Act
    const run = runOf(checked);

    // Assert
    expect({
      isClean: run.isClean,
      isMutated: run.output.includes('mutation: every mutant killed'),
    }).toStrictEqual({
      isClean: true,
      isMutated: true,
    });
  });

  it.each(
    taskCases([
      {
        condition: 'a module is laid out in four spaces',
        changes: {
          'src/shop/kernel.py': python('def zero() -> int:', '    return 0'),
        },
        finding: [
          'src/shop/kernel.py',
        ],
        task: 'format:check',
      },
      {
        condition: 'a spec is skipped',
        changes: {
          'tests/test_kernel.py': python(
            'import pytest',
            '',
            '',
            "@pytest.mark.skip(reason='later')",
            'def test_should_count() -> None:',
            '  assert True',
          ),
        },
        finding: [
          'TID251',
        ],
        task: 'lint:check',
      },
      {
        condition: 'a value is of the wrong type',
        changes: {
          'src/shop/kernel.py': python("LIMIT: int = 'ten'"),
        },
        finding: [
          'invalid-assignment',
        ],
        task: 'type:check',
      },
      {
        condition: 'a function holds more than 100 lines',
        changes: {
          'src/shop/kernel.py': longFunction,
        },
        finding: [
          'src/shop/kernel.py:1',
          'tally',
          '103',
          '100',
        ],
        task: 'code:check',
      },
      {
        condition: "a function's cognitive complexity passes 15",
        changes: {
          'src/shop/kernel.py': tangled,
        },
        finding: [
          'FAILED',
        ],
        task: 'complexity:check',
      },
      {
        condition: 'a feature imports another',
        changes: {
          'src/shop/features/__init__.py': '',
          'src/shop/features/billing/__init__.py': 'from shop.features.orders import ORDER\n',
          'src/shop/features/orders/__init__.py': 'ORDER = 1\n',
        },
        finding: [
          'feature-never-imports-a-feature BROKEN',
        ],
        task: 'architecture:check',
      },
      {
        condition: 'the kernel imports a feature',
        changes: {
          'src/shop/features/__init__.py': '',
          'src/shop/features/orders/__init__.py': 'ORDER = 1\n',
          'src/shop/kernel/__init__.py': 'from shop.features.orders import ORDER\n',
        },
        finding: [
          'kernel-imports-only-itself BROKEN',
        ],
        task: 'architecture:check',
      },
      {
        condition: 'two modules import each other',
        changes: {
          'src/shop/kernel/__init__.py': '',
          'src/shop/kernel/currency.py': 'from shop.kernel import money\n',
          'src/shop/kernel/money.py': 'from shop.kernel import currency\n',
        },
        finding: [
          'module-imports-form-no-cycle BROKEN',
        ],
        task: 'architecture:check',
      },
      {
        condition: "a feature's domain imports pydantic",
        changes: {
          ...feature,
          'src/shop/features/orders/domain/__init__.py': '',
          'src/shop/features/orders/domain/order_entity.py': 'from pydantic import BaseModel\n',
        },
        finding: [
          'features/orders/domain',
          'pydantic',
        ],
        task: 'code:check',
      },
      {
        condition: 'the kernel reads its settings through pydantic-settings',
        changes: {
          'src/shop/kernel/__init__.py': '',
          'src/shop/kernel/limits.py': 'from pydantic_settings import BaseSettings\n',
        },
        finding: [
          'kernel',
          'pydantic_settings',
        ],
        task: 'code:check',
      },
      {
        condition: "a feature's domain imports logging",
        changes: {
          ...feature,
          'src/shop/features/orders/domain/__init__.py': '',
          'src/shop/features/orders/domain/order_entity.py': 'import logging\n',
        },
        finding: [
          'domain-imports-no-logging BROKEN',
        ],
        task: 'architecture:check',
      },
      {
        condition: "a feature's application layer runs a process through a lib",
        changes: {
          ...feature,
          'src/shop/features/orders/app/__init__.py': '',
          'src/shop/features/orders/app/orders_export.py': 'from shop.libs.run import run\n',
          'src/shop/libs/__init__.py': '',
          'src/shop/libs/run/__init__.py': "from .run_utils import run\n\n__all__ = ['run']\n",
          'src/shop/libs/run/run_utils.py': "from subprocess import run\n\n__all__ = ['run']\n",
        },
        finding: [
          'effects-held-only-by-the-edge BROKEN',
        ],
        task: 'architecture:check',
      },
      {
        condition: 'a feature imports structlog',
        changes: {
          ...feature,
          'src/shop/features/orders/app/__init__.py': '',
          'src/shop/features/orders/app/orders_logs.py': 'import structlog\n',
        },
        finding: [
          'structlog',
          'features/orders/app',
          'root',
        ],
        task: 'code:check',
      },
      {
        condition: "a feature's application layer imports httpx2",
        changes: {
          ...feature,
          'src/shop/features/orders/app/__init__.py': '',
          'src/shop/features/orders/app/orders_client.py': 'import httpx2\n',
        },
        finding: [
          'httpx2',
          'features/orders/app',
          'adapters, libs, shared, root',
        ],
        task: 'code:check',
      },
      {
        condition: "a feature's application layer imports a package no block gives a home",
        changes: {
          ...feature,
          'src/shop/features/orders/app/__init__.py': '',
          'src/shop/features/orders/app/orders_dates.py': 'import arrow\n',
        },
        finding: [
          'arrow',
          'features/orders/app',
        ],
        task: 'code:check',
      },
      {
        condition: 'a shared adapter imports a feature',
        changes: {
          ...feature,
          'src/shop/adapters/__init__.py': '',
          'src/shop/adapters/mail/__init__.py': 'from shop.features import orders\n',
        },
        finding: [
          'adapter-imports-only-its-owners-domain-and-shared-layers BROKEN',
        ],
        task: 'architecture:check',
      },
      {
        condition: 'a feature imports the entry file',
        changes: {
          ...feature,
          'src/shop/features/orders/app/__init__.py': '',
          'src/shop/features/orders/app/orders_start.py': 'from shop.main import main\n',
          'src/shop/main.py': 'def main() -> None:\n  pass\n',
        },
        finding: [
          'entrypoint-never-imported BROKEN',
        ],
        task: 'architecture:check',
      },
      {
        condition: 'a feature imports the integration of a host framework',
        changes: {
          ...feature,
          'src/shop/features/orders/app/__init__.py': '',
          'src/shop/features/orders/app/orders_router.py':
            'from shop.integrations.fastapi import router\n',
          'src/shop/integrations/__init__.py': '',
          'src/shop/integrations/fastapi/__init__.py': 'router = 1\n',
        },
        finding: [
          'integration-never-imported BROKEN',
        ],
        task: 'architecture:check',
      },
      {
        condition: 'a feature imports the root',
        changes: {
          'src/shop/features/__init__.py': '',
          'src/shop/features/orders/__init__.py': 'from shop.root import wiring\n',
          'src/shop/root/__init__.py': '',
          'src/shop/root/wiring.py': 'WIRED = 1\n',
        },
        finding: [
          'root-imported-only-by-entries BROKEN',
        ],
        task: 'architecture:check',
      },
      {
        condition: 'a binding unit imports an adapter past its port',
        changes: {
          ...feature,
          'src/shop/features/orders/adapters/__init__.py': '',
          'src/shop/features/orders/adapters/http/__init__.py': 'ADAPTER = 1\n',
          'src/shop/features/orders/app/__init__.py': 'from ..adapters.http import ADAPTER\n',
        },
        finding: [
          'adapter-imported-only-by-the-root BROKEN',
        ],
        task: 'architecture:check',
      },
      {
        condition: "a feature's surface offers its adapter",
        changes: {
          'src/shop/features/__init__.py': '',
          'src/shop/features/orders/__init__.py': 'from .adapters.http import ADAPTER\n',
          'src/shop/features/orders/adapters/__init__.py': '',
          'src/shop/features/orders/adapters/http/__init__.py': 'ADAPTER = 1\n',
        },
        finding: [
          'adapter-imported-only-by-the-root BROKEN',
        ],
        task: 'architecture:check',
      },
      {
        condition: 'a read use-case imports a write one',
        changes: {
          ...feature,
          'src/shop/features/orders/domain/__init__.py': '',
          'src/shop/features/orders/domain/use_cases/__init__.py': '',
          'src/shop/features/orders/domain/use_cases/commands/__init__.py': '',
          'src/shop/features/orders/domain/use_cases/commands/place_order_use_case.py': '',
          'src/shop/features/orders/domain/use_cases/queries/__init__.py': '',
          'src/shop/features/orders/domain/use_cases/queries/list_orders_use_case.py':
            'from ..commands import place_order_use_case\n',
        },
        finding: [
          'query-and-command-apart BROKEN',
        ],
        task: 'architecture:check',
      },
      {
        condition: 'the root imports a layer folder',
        changes: {
          ...feature,
          'src/shop/root/__init__.py': '',
          'src/shop/root/wiring.py': 'from shop import features\n',
        },
        finding: [
          'surface-only-on-a-module-or-one-kind BROKEN',
        ],
        task: 'architecture:check',
      },
      {
        condition: 'the root reaches past the surface of a role folder of the kernel',
        changes: {
          'src/shop/kernel/__init__.py': '',
          'src/shop/kernel/types/__init__.py': '',
          'src/shop/kernel/types/money.py': 'MONEY = 1\n',
          'src/shop/root/__init__.py': '',
          'src/shop/root/wiring.py': 'from shop.kernel.types.money import MONEY\n',
        },
        finding: [
          'module-reached-only-through-its-surface BROKEN',
        ],
        task: 'architecture:check',
      },
      {
        condition: 'a port the kernel shares imports a vendor client of libs',
        changes: {
          'src/shop/kernel/__init__.py': '',
          'src/shop/kernel/contracts/__init__.py': 'from shop.libs.smtp import CLIENT\n',
          'src/shop/libs/__init__.py': '',
          'src/shop/libs/smtp/__init__.py': 'CLIENT = 1\n',
        },
        finding: [
          'kernel-imports-only-itself BROKEN',
        ],
        task: 'architecture:check',
      },
      {
        condition: 'shared plumbing imports a port the kernel shares',
        changes: {
          'src/shop/kernel/__init__.py': '',
          'src/shop/kernel/contracts/__init__.py': 'MAILER = 1\n',
          'src/shop/shared/__init__.py': '',
          'src/shop/shared/mail/__init__.py': 'from shop.kernel.contracts import MAILER\n',
        },
        finding: [
          'shared-imports-no-feature-adapter-contract-or-root BROKEN',
        ],
        task: 'architecture:check',
      },
      {
        condition: "a binding unit imports a port of its feature's domain",
        changes: {
          ...feature,
          'src/shop/features/orders/app/__init__.py': '',
          'src/shop/features/orders/app/orders_api.py':
            'from shop.features.orders.domain.contracts import ORDERS\n',
          'src/shop/features/orders/domain/__init__.py': '',
          'src/shop/features/orders/domain/contracts/__init__.py': 'ORDERS = 1\n',
        },
        finding: [
          'binding-unit-calls-only-use-cases BROKEN',
        ],
        task: 'architecture:check',
      },
      {
        condition: 'a module of composition imports another',
        changes: {
          'src/shop/composition/__init__.py': '',
          'src/shop/composition/billing/__init__.py':
            'from shop.composition.checkout import CHECKOUT\n',
          'src/shop/composition/checkout/__init__.py': 'CHECKOUT = 1\n',
        },
        finding: [
          'composition-module-never-imports-another BROKEN',
        ],
        task: 'architecture:check',
      },
      {
        condition: "a module of composition's domain imports a package",
        changes: {
          'src/shop/composition/__init__.py': '',
          'src/shop/composition/checkout/__init__.py': '',
          'src/shop/composition/checkout/domain/__init__.py': '',
          'src/shop/composition/checkout/domain/cart_entity.py': 'import attrs\n',
        },
        finding: [
          'composition/checkout/domain',
          'attrs',
        ],
        task: 'code:check',
      },
      {
        condition: 'a feature imports the composition above it',
        changes: {
          'src/shop/composition/__init__.py': '',
          'src/shop/composition/checkout.py': 'CHECKOUT = 1\n',
          'src/shop/features/__init__.py': '',
          'src/shop/features/orders/__init__.py': 'from shop.composition import checkout\n',
        },
        finding: [
          'import-points-inward BROKEN',
        ],
        task: 'architecture:check',
      },
      {
        condition: 'the program imports a module of the specs',
        changes: {
          'src/shop/kernel.py': python('import orders_fixtures', '', 'ORDERS = orders_fixtures'),
          'tests/orders_fixtures.py': 'ORDER = 1\n',
        },
        finding: [
          'DEP001',
        ],
        task: 'dependencies:check',
      },
      {
        condition: 'the program imports a tool of the dev group',
        changes: {
          'src/shop/kernel.py': python('import pytest', '', 'MARK = pytest.mark'),
        },
        finding: [
          'DEP004',
        ],
        task: 'dependencies:check',
      },
      {
        condition: 'a function is used by nothing in src/',
        changes: {
          'src/shop/kernel.py': python('def stale() -> int:', '  return 0'),
        },
        finding: [
          "unused function 'stale'",
        ],
        task: 'unused:check',
      },
      {
        condition: 'a branch is never taken',
        changes: {
          'tests/test_orders.py': specOfOneCase,
        },
        finding: [
          'Required test coverage of 100.0% not reached',
        ],
        task: 'test:check',
      },
      {
        condition: 'a spec warns',
        changes: {
          'tests/test_kernel.py': spec(
            'def test_should_warn_nothing() -> None:',
            "  warnings.warn('old', DeprecationWarning, stacklevel=1)",
          ),
        },
        finding: [
          'DeprecationWarning: old',
        ],
        task: 'test:check',
      },
      {
        condition: 'a spec carries an unknown marker',
        changes: {
          'tests/test_kernel.py': spec(
            '@pytest.mark.slow',
            'def test_should_count() -> None:',
            '  assert total([1], discount=0) == 1',
          ),
        },
        finding: [
          "'slow' not found in `markers` configuration option",
        ],
        task: 'test:check',
      },
      {
        condition: 'a spec reaches the network',
        changes: {
          'tests/test_kernel.py': spec(
            'def test_should_resolve() -> None:',
            "  assert socket.getaddrinfo('example.com', 443) == []",
          ),
        },
        finding: [
          'ConnectionRefusedError',
        ],
        task: 'test:check',
      },
      {
        condition: 'no spec reaches a new function',
        changes: {
          'src/shop/orders.py': ordersWithLabel(''),
        },
        finding: [
          'mutation: shop.orders.x_label__mutmut_1: no tests',
        ],
        task: 'mutation:check',
      },
    ]),
  )('should fail $task when $condition', ({ changes, finding, task }) => {
    // Arrange
    const changed = changes;

    // Act
    const run = runOf({
      changes: changed,
      task,
    });

    // Assert
    expect({
      hasFinding: isFoundIn({
        finding,
        output: run.output,
      }),
      isClean: run.isClean,
    }).toStrictEqual({
      hasFinding: true,
      isClean: false,
    });
  });

  it.each(
    taskCases([
      {
        condition: 'an integration spec fails, which the unit run leaves out',
        changes: {
          'tests/integration/test_engine.py': python(
            'def test_should_reach_the_engine() -> None:',
            '  assert False',
          ),
        },
        task: 'test:check',
      },
      {
        condition: '__main__.py calls main() of main.py',
        changes: {
          'src/shop/__main__.py': 'from shop.main import main\n\nmain()\n',
          'src/shop/main.py': 'def main() -> None:\n  pass\n',
        },
        task: 'architecture:check',
      },
      {
        condition: 'Hypothesis kept its examples in .hypothesis/',
        changes: {
          '.hypothesis/examples/0a1b2c3d/4e5f6a7b': '',
        },
        task: 'test:check',
      },
      {
        condition: 'an adapter parses with pydantic and calls through httpx2',
        changes: {
          ...feature,
          'src/shop/features/orders/adapters/__init__.py': '',
          'src/shop/features/orders/adapters/http/__init__.py': '',
          'src/shop/features/orders/adapters/http/orders_adapter.py': python(
            'import httpx2',
            'from pydantic import BaseModel',
          ),
        },
        task: 'code:check',
      },
      {
        condition: 'the root configures structlog and reads the settings through pydantic-settings',
        changes: {
          'src/shop/root/__init__.py': '',
          'src/shop/root/logs.py': 'import structlog\n',
          'src/shop/root/settings.py': 'from pydantic_settings import BaseSettings\n',
        },
        task: 'code:check',
      },
      {
        condition: "the root reaches a feature's adapter through the adapter's own surface",
        changes: {
          ...feature,
          'src/shop/features/orders/adapters/__init__.py': '',
          'src/shop/features/orders/adapters/http/__init__.py': 'ADAPTER = 1\n',
          'src/shop/root/__init__.py': '',
          'src/shop/root/wiring.py':
            'from shop.features.orders.adapters.http import ADAPTER\n\nWIRED = ADAPTER\n',
        },
        task: 'architecture:check',
      },
      {
        condition: "the package's surface offers a feature's adapter to its consumers",
        changes: {
          ...feature,
          'src/shop/__init__.py': python(
            'from .features.orders.adapters.http import ADAPTER',
            'from .orders import total, totals',
            '',
            "__all__ = ['ADAPTER', 'total', 'totals']",
          ),
          'src/shop/features/orders/adapters/__init__.py': '',
          'src/shop/features/orders/adapters/http/__init__.py': 'ADAPTER = 1\n',
        },
        task: 'architecture:check',
      },
      {
        condition:
          "a feature's delivery unit declares a FastAPI router and a composition module's adapter sends mail",
        changes: {
          ...feature,
          'src/shop/composition/__init__.py': '',
          'src/shop/composition/checkout/__init__.py': '',
          'src/shop/composition/checkout/adapters/__init__.py': '',
          'src/shop/composition/checkout/adapters/mail/__init__.py': '',
          'src/shop/composition/checkout/adapters/mail/mail_adapter.py': 'import smtplib\n',
          'src/shop/features/orders/app/__init__.py': '',
          'src/shop/features/orders/app/orders_api.py': 'from fastapi import APIRouter\n',
        },
        task: 'code:check',
      },
      {
        condition:
          "the root reaches a composition module's adapter through the adapter's own surface",
        changes: {
          'src/shop/composition/__init__.py': '',
          'src/shop/composition/checkout/__init__.py': '',
          'src/shop/composition/checkout/adapters/__init__.py': '',
          'src/shop/composition/checkout/adapters/mail/__init__.py': 'ADAPTER = 1\n',
          'src/shop/root/__init__.py': '',
          'src/shop/root/wiring.py':
            'from shop.composition.checkout.adapters.mail import ADAPTER\n\nWIRED = ADAPTER\n',
        },
        task: 'architecture:check',
      },
      {
        condition: "a changed function's log call is left unmutated",
        changes: {
          'src/shop/orders.py': python(
            'import logging',
            '',
            'logger = logging.getLogger(__name__)',
            '',
            '',
            'def total(prices: list[int], *, discount: int) -> int:',
            "  logger.info('totalling %d prices', len(prices))",
            '  return max(sum(prices) - discount, 0)',
            '',
            '',
            'async def totals(baskets: list[list[int]]) -> list[int]:',
            '  return [total(basket, discount=0) for basket in baskets]',
          ),
        },
        task: 'mutation:check',
      },
      {
        condition: 'only a spec changes',
        changes: {
          'tests/test_orders.py': specOfOneCase,
        },
        task: 'mutation:check',
      },
      {
        condition: 'the only mutants of a new line are marked equivalent',
        changes: {
          'src/shop/orders.py': ordersWithLabel('  # pragma: no mutate -- a name no spec reads'),
        },
        task: 'mutation:check',
      },
    ]),
  )('should pass $task when $condition', ({ changes, task }) => {
    // Arrange
    const changed = changes;

    // Act
    const run = runOf({
      changes: changed,
      task,
    });

    // Assert
    expect(run.isClean).toBe(true);
  });
});
