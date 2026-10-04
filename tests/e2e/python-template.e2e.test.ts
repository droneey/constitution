import { describe, expect, it } from 'bun:test';

import { python, runInTemplate, runTask } from './python-template.fixtures';

// A run of the check, mutmut's above all, takes seconds, not milliseconds.
const RUN_MS = 60_000;
const MANY_LINES = Array.from(
  {
    length: 100,
  },
  () => '  total += 1',
);
const LONG_FUNCTION = python('def tally() -> int:', '  total = 0', ...MANY_LINES, '  return total');
const TANGLED = python(
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
const SPEC_OF_ONE_CASE = python(
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
const ORDERS_WITH_LABEL = (comment: string): string =>
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
// A feature's folders, as the anatomy lays them out, before a case adds a layer.
const FEATURE = {
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

describe('the python template', () => {
  it(
    'should pass the whole check when the package keeps every rule',
    () => {
      // Arrange
      const changes = {};

      // Act
      const run = runTask({
        changes,
        task: 'check',
      });

      // Assert
      expect(run.isClean).toBe(true);
    },
    RUN_MS,
  );

  it(
    'should pass the whole check when the specs kill every mutant of a changed function',
    () => {
      // Arrange
      const changes = {
        'src/shop/orders.py': python(
          'def total(prices: list[int], *, discount: int) -> int:',
          '  return max(0, sum(prices) - discount)',
          '',
          '',
          'async def totals(baskets: list[list[int]]) -> list[int]:',
          '  return [total(basket, discount=0) for basket in baskets]',
        ),
      };

      // Act
      const run = runTask({
        changes,
        task: 'check',
      });

      // Assert
      expect({
        isClean: run.isClean,
        isMutated: run.output.includes('mutation: every mutant killed'),
      }).toStrictEqual({
        isClean: true,
        isMutated: true,
      });
    },
    RUN_MS,
  );

  it.each([
    {
      condition: 'a module is laid out in four spaces',
      changes: {
        'src/shop/kernel.py': python('def zero() -> int:', '    return 0'),
      },
      finding: '1 file would be reformatted',
      task: 'format:check',
    },
    {
      condition: 'a parameter is not annotated',
      changes: {
        'src/shop/kernel.py': python('def zero(value) -> int:', '  return value'),
      },
      finding: 'ANN001',
      task: 'lint:check',
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
      finding: '`pytest.mark.skip` is banned',
      task: 'lint:check',
    },
    {
      condition: 'a value is of the wrong type',
      changes: {
        'src/shop/kernel.py': python("LIMIT: int = 'ten'"),
      },
      finding: 'invalid-assignment',
      task: 'type:check',
    },
    {
      condition: 'a function holds more than 100 lines',
      changes: {
        'src/shop/kernel.py': LONG_FUNCTION,
      },
      finding: 'src/shop/kernel.py:1: tally holds 103 lines, more than 100',
      task: 'code:check',
    },
    {
      condition: 'a relative import leaves its module',
      changes: {
        'src/shop/kernel/__init__.py': '',
        'src/shop/kernel/money.py': python('from ..orders import total'),
      },
      finding: 'src/shop/kernel/money.py:1: a relative import leaves its module, kernel',
      task: 'code:check',
    },
    {
      condition: "a function's cognitive complexity passes 10",
      changes: {
        'src/shop/kernel.py': TANGLED,
      },
      finding: 'FAILED',
      task: 'complexity:check',
    },
    {
      condition: 'a feature imports another',
      changes: {
        'src/shop/features/__init__.py': '',
        'src/shop/features/billing/__init__.py': 'from shop.features.orders import ORDER\n',
        'src/shop/features/orders/__init__.py': 'ORDER = 1\n',
      },
      finding: 'features-blind-to-each-other BROKEN',
      task: 'architecture:check',
    },
    {
      condition: 'the kernel imports a feature',
      changes: {
        'src/shop/features/__init__.py': '',
        'src/shop/features/orders/__init__.py': 'ORDER = 1\n',
        'src/shop/kernel/__init__.py': 'from shop.features.orders import ORDER\n',
      },
      finding: 'kernel-imports-only-itself BROKEN',
      task: 'architecture:check',
    },
    {
      condition: 'two modules import each other',
      changes: {
        'src/shop/kernel/__init__.py': '',
        'src/shop/kernel/currency.py': 'from shop.kernel import money\n',
        'src/shop/kernel/money.py': 'from shop.kernel import currency\n',
      },
      finding: 'no-import-cycles BROKEN',
      task: 'architecture:check',
    },
    {
      condition: "a feature's domain imports pydantic",
      changes: {
        ...FEATURE,
        'src/shop/features/orders/domain/__init__.py': '',
        'src/shop/features/orders/domain/order_entity.py': 'from pydantic import BaseModel\n',
      },
      finding: 'pydantic-kept-out-of-the-domain BROKEN',
      task: 'architecture:check',
    },
    {
      condition: 'the kernel reads its settings through pydantic-settings',
      changes: {
        'src/shop/kernel/__init__.py': '',
        'src/shop/kernel/limits.py': 'from pydantic_settings import BaseSettings\n',
      },
      finding: 'pydantic-kept-out-of-the-domain BROKEN',
      task: 'architecture:check',
    },
    {
      condition: 'a feature imports structlog',
      changes: {
        ...FEATURE,
        'src/shop/features/orders/app/__init__.py': '',
        'src/shop/features/orders/app/orders_logs.py': 'import structlog\n',
      },
      finding: 'structlog-imported-only-by-the-root BROKEN',
      task: 'architecture:check',
    },
    {
      condition: "a feature's application layer imports httpx2",
      changes: {
        ...FEATURE,
        'src/shop/features/orders/app/__init__.py': '',
        'src/shop/features/orders/app/orders_client.py': 'import httpx2\n',
      },
      finding: 'httpx2-kept-to-the-edge BROKEN',
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
      finding: 'root-imported-only-by-entry-and-delivery-wiring BROKEN',
      task: 'architecture:check',
    },
    {
      condition: 'the program imports a tool of the dev group',
      changes: {
        'src/shop/kernel.py': python('import pytest', '', 'MARK = pytest.mark'),
      },
      finding: 'DEP004',
      task: 'dependencies:check',
    },
    {
      condition: 'a function is used by nothing in src/',
      changes: {
        'src/shop/kernel.py': python('def stale() -> int:', '  return 0'),
      },
      finding: "unused function 'stale'",
      task: 'unused:check',
    },
    {
      condition: 'a branch is never taken',
      changes: {
        'tests/test_orders.py': SPEC_OF_ONE_CASE,
      },
      finding: 'Required test coverage of 100.0% not reached',
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
      finding: 'DeprecationWarning: old',
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
      finding: "'slow' not found in `markers` configuration option",
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
      finding: 'a spec reached the network',
      task: 'test:check',
    },
    {
      condition: 'a property breaks for some input',
      changes: {
        'tests/test_kernel.py': spec(
          '@given(st.lists(st.integers()))',
          'def test_should_never_exceed_the_sum(prices: list[int]) -> None:',
          '  assert total(prices, discount=0) == sum(prices)',
        ),
      },
      finding: 'Failing test case: test_should_never_exceed_the_sum',
      task: 'test:check',
    },
    {
      condition: 'a changed spec lets a mutant of its module live',
      changes: {
        'tests/test_orders.py': SPEC_OF_ONE_CASE,
      },
      finding: 'mutation: shop.orders.x_total__mutmut_',
      task: 'mutation:check',
    },
    {
      condition: 'no spec reaches a new function',
      changes: {
        'src/shop/orders.py': ORDERS_WITH_LABEL(''),
      },
      finding: 'mutation: shop.orders.x_label__mutmut_1: no tests',
      task: 'mutation:check',
    },
  ])(
    'should fail $task when $condition',
    ({ changes, finding, task }) => {
      // Arrange
      const changed = changes;

      // Act
      const run = runTask({
        changes: changed,
        task,
      });

      // Assert
      expect({
        hasFinding: run.output.includes(finding),
        isClean: run.isClean,
      }).toStrictEqual({
        hasFinding: true,
        isClean: false,
      });
    },
    RUN_MS,
  );

  it.each([
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
      condition: 'an adapter parses with pydantic and calls through httpx2',
      changes: {
        ...FEATURE,
        'src/shop/features/orders/adapters/__init__.py': '',
        'src/shop/features/orders/adapters/http/__init__.py': '',
        'src/shop/features/orders/adapters/http/orders_adapter.py': python(
          'import httpx2',
          'from pydantic import BaseModel',
        ),
      },
      task: 'architecture:check',
    },
    {
      condition: 'the root configures structlog and reads the settings through pydantic-settings',
      changes: {
        'src/shop/root/__init__.py': '',
        'src/shop/root/logs.py': 'import structlog\n',
        'src/shop/root/settings.py': 'from pydantic_settings import BaseSettings\n',
      },
      task: 'architecture:check',
    },
    {
      condition: 'the only mutants of a new line are marked equivalent',
      changes: {
        'src/shop/orders.py': ORDERS_WITH_LABEL('  # pragma: no mutate -- a name no spec reads'),
      },
      task: 'mutation:check',
    },
  ])(
    'should pass $task when $condition',
    ({ changes, task }) => {
      // Arrange
      const changed = changes;

      // Act
      const run = runTask({
        changes: changed,
        task,
      });

      // Assert
      expect(run.isClean).toBe(true);
    },
    RUN_MS,
  );

  it(
    "should draw the same inputs on every run when CI loads Hypothesis's own profile",
    () => {
      // Arrange
      const command = [
        'pytest',
        '-v',
      ];

      // Act
      const run = runInTemplate({
        changes: {},
        command,
        isCi: true,
      });

      // Assert
      expect({
        isClean: run.isClean,
        profile: run.output
          .match(/hypothesis profile 'ci' -> (?<settings>.*)/)
          ?.groups?.['settings']?.split(', ')
          .filter((setting) => /^(?:database|derandomize)=/.test(setting)),
      }).toStrictEqual({
        isClean: true,
        profile: [
          'database=None',
          'derandomize=True',
        ],
      });
    },
    RUN_MS,
  );
});
