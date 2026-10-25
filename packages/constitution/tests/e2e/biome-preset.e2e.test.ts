import { beforeAll, describe, expect, it } from 'bun:test';

import {
  baseParts,
  blockCode,
  formattedText,
  lintCase,
  lintCases,
  lintFindings,
  lintRegistered,
  presetFiles,
  presetText,
  presetWords,
} from './biome-preset.fixtures';

const ROOM_HOOK = `import { useEffect, useEffectEvent } from 'react';

const track = (label: string): void => {
  globalThis.dispatchEvent(new Event(label));
};

export function useRoom(label: string): void {
  const onOpen = useEffectEvent((): void => {
    track(label);
  });

  useEffect(() => {
    onOpen();
  }, []);
}
`;

const testParts = [
  ...baseParts,
  'typescript/bun-test',
];

const signInSpec = (step: string): string =>
  `import { expect, test } from '@playwright/test';\n\ntest('should sign in when the password is right', async ({ page }) => {\n  ${step}\n  await expect(page.getByRole('heading')).toBeVisible();\n});\n`;

const sixSuitesDeep = `import { describe, expect, test } from 'bun:test';\n\n${"describe('orders', () => {\n".repeat(6)}test('should add totals when two are given', () => {\n  expect(1).toBe(1);\n});\n${'});\n'.repeat(6)}`;

// Biome turns on the React and Tailwind rules only for a manifest that lists
// their libraries.
const manifest = JSON.stringify({
  name: 'fixture',
  dependencies: {
    react: '19.2.0',
    tailwindcss: '4.2.0',
  },
});

const webParts = [
  ...baseParts,
  'typescript/_react',
  'typescript/react-dom',
  'typescript/browser',
  'typescript/tailwind',
  'typescript/testing-library',
];

const indexes = (count: number): readonly number[] => [
  ...new Array<undefined>(count).keys(),
];

const statements = (count: number): string =>
  indexes(count)
    .map((index) => `  total += '${String(index)}'.length;`)
    .join('\n');

// Biome counts a function's body, the lines between its braces.
const functionWithBodyOf = (lines: number): string =>
  `export const measure = (): number => {\n  let total = 0;\n${statements(lines - 2)}\n  return total;\n};\n`;

const fileOfLines = (lines: number): string =>
  `${indexes(lines)
    .map((index) => `export const label${String(index)} = 'label';`)
    .join('\n')}\n`;

const THREE_PARAMETERS =
  "export const joinAll = (head: string, middle: string, tail: string): string =>\n  [head, middle, tail].join('');\n";
const FOUR_PARAMETERS =
  "export const joinAll = (head: string, middle: string, tail: string, end: string): string =>\n  [head, middle, tail, end].join('');\n";

// The line without its literal's letters.
const LINE = "export const label = '';";

const lineOf = (width: number): string =>
  `export const label = '${'a'.repeat(width - LINE.length)}';\n`;

const wrappedLine = `export const label =\n  '${'a'.repeat(101 - LINE.length)}';\n`;

const LINT_TIMEOUT = 60_000;

const component = (markup: string): string =>
  `export function Panel(): React.ReactElement {\n  return (\n    ${markup}\n  );\n}\n`;

// The projects of every table are linted before the first case.
beforeAll(lintRegistered, LINT_TIMEOUT);

describe('the Biome preset', () => {
  it.each(
    lintCases([
      {
        condition: 'null is assigned outside an adapter',
        files: {
          'src/features/orders/domain/order.ts':
            'export const cancelledAt: Date | undefined = null;\n',
        },
        plugin: 'undefined-is-the-only-absence',
      },
      {
        condition: 'a variable is named by an empty word',
        files: {
          'src/features/orders/order.ts': 'export const data = 1;\n',
        },
        plugin: 'biome-refuses-empty-names',
      },
      {
        condition: 'a destructured field keeps an empty name',
        files: {
          'src/features/orders/order.ts':
            'export const doubled = ({ value }: { value: number }): number => value * 2;\n',
        },
        plugin: 'biome-refuses-empty-names',
      },
      {
        condition: 'a case does not read should …',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('adds totals', () => {\n  expect(1).toBe(1);\n});\n",
        },
        plugin: 'case-named-should-when',
      },
      {
        condition: 'a spec replaces a module',
        files: {
          'src/__tests__/order.test.ts':
            "import { mock } from 'bun:test';\n\nmock.module('./order', () => ({}));\n",
        },
        plugin: 'module-never-mocked-in-a-spec',
      },
      {
        condition: "a spec replaces a module through vi's object",
        files: {
          'src/__tests__/order.test.ts':
            "import { vi } from 'bun:test';\n\nvi.mock('./order', () => ({}));\n",
        },
        plugin: 'module-never-mocked-in-a-spec',
      },
      {
        condition: "a spec replaces a module through jest's object",
        files: {
          'src/__tests__/order.test.ts':
            "import { jest } from 'bun:test';\n\njest.mock('./order');\n",
        },
        plugin: 'module-never-mocked-in-a-spec',
      },
      {
        condition: 'a spec spies on a module',
        files: {
          'src/__tests__/order.test.ts':
            "import { spyOn } from 'bun:test';\n\nimport * as orders from '../orders';\n\nspyOn(orders, 'load');\n",
        },
        plugin: 'module-never-mocked-in-a-spec',
      },
      {
        condition: 'a component memoises a value by hand',
        files: {
          'src/Panel.tsx':
            "import { useMemo } from 'react';\n\nexport function Panel({ label }: { label: string }): string {\n  return useMemo(() => label.trim(), [label]);\n}\n",
        },
        plugin: 'react-compiler-on',
      },
      {
        condition: 'a component is wrapped in React.memo',
        files: {
          'src/Panel.tsx':
            "import React from 'react';\n\nexport const Panel = React.memo(function Panel(): null {\n  return null;\n});\n",
        },
        plugin: 'react-compiler-on',
      },
      {
        condition: 'a type is taken from an as-const array',
        files: {
          'src/features/orders/domain/order-status.ts':
            "const STATUSES = ['open', 'closed'] as const;\n\nexport type OrderStatus = (typeof STATUSES)[number];\n",
        },
        plugin: 'closed-name-set-is-a-string-enum',
      },
      {
        condition: 'a type is taken from the values of an as-const object',
        files: {
          'src/features/orders/domain/order-status.ts':
            "const STATUS = { Open: 'open', Closed: 'closed' } as const;\n\nexport type OrderStatus = (typeof STATUS)[keyof typeof STATUS];\n",
        },
        plugin: 'closed-name-set-is-a-string-enum',
      },
      {
        condition: 'a type is taken from an as-const array without parentheses',
        files: {
          'src/features/orders/domain/order-status.ts':
            "const STATUSES = ['open', 'closed'] as const;\n\nexport type OrderStatus = typeof STATUSES[number];\n",
        },
        plugin: 'closed-name-set-is-a-string-enum',
      },
      {
        condition: "a spec spies on a module through jest's object",
        files: {
          'src/__tests__/order.test.ts':
            "import { jest } from 'bun:test';\n\nimport * as orders from '../orders';\n\njest.spyOn(orders, 'load');\n",
        },
        plugin: 'module-never-mocked-in-a-spec',
      },
      {
        condition: 'a catch holds only a comment',
        files: {
          'src/features/orders/app/load.ts':
            'export const load = (): void => {\n  try {\n    globalThis.focus();\n  } catch {\n    // ignore\n  }\n};\n',
        },
        plugin: 'catch-handles-only-what-it-recognises',
      },
      {
        condition: 'a concurrent case is left to do',
        files: {
          'src/__tests__/order.test.ts':
            "import { test } from 'bun:test';\n\ntest.concurrent.todo('should add totals when both are set');\n",
        },
        plugin: 'test-never-skipped-or-empty',
      },
      {
        condition: 'a type is a union of string literals',
        files: {
          'src/features/orders/domain/order-status.ts':
            "export type OrderStatus = 'open' | 'closed';\n",
        },
        plugin: 'closed-name-set-is-a-string-enum',
      },
      {
        condition: 'a module-level constant holding a literal is camelCase',
        files: {
          'src/features/orders/order.ts': 'export const maxItems = 5;\n',
        },
        plugin: 'identifier-case-by-kind',
      },
      {
        condition: 'a module-level constant computed at run time is SCREAMING_SNAKE_CASE',
        files: {
          'src/features/orders/order.ts': "export const MAX_ITEMS = Number('5');\n",
        },
        plugin: 'identifier-case-by-kind',
      },
      {
        condition: 'a module exports a value beside its component',
        files: {
          'src/Panel.tsx':
            "export const PANEL_WIDTH = 4;\n\nexport function Panel(): string {\n  return 'panel';\n}\n",
        },
        plugin: 'file-is-one-semantic-unit',
      },
    ]),
  )('should report a plugin finding when $condition', ({ files, plugin }) => {
    // Arrange
    const project = {
      files,
    };

    // Act
    const { plugins } = lintFindings(project);

    // Assert
    expect(plugins).toContain(plugin);
  });

  it.each(
    lintCases(
      [
        {
          condition: 'a spec replaces a module',
          files: {
            'src/__tests__/order.test.ts':
              "import { mock } from 'bun:test';\n\nmock.module('./order', () => ({}));\n",
          },
        },
        {
          condition: 'a component memoises a value by hand',
          files: {
            'src/Panel.tsx':
              "import { useMemo } from 'react';\n\nexport function Panel({ label }: { label: string }): string {\n  return useMemo(() => label.trim(), [label]);\n}\n",
          },
        },
        {
          condition: 'a component calls an effect',
          files: {
            'src/Panel.tsx':
              "import { useEffect } from 'react';\n\nexport function Panel(): string {\n  useEffect(() => {\n    globalThis.focus();\n  }, []);\n\n  return 'panel';\n}\n",
          },
        },
      ],
      {
        parts: [
          ...baseParts,
          'typescript/architecture/core',
        ],
      },
    ),
  )(
    'should report no plugin finding when $condition and a project extends only the self, core and typescript parts of the base and architecture core',
    ({ files, parts }) => {
      // Arrange
      const project = {
        files,
        parts,
      };

      // Act
      const { plugins } = lintFindings(project);

      // Assert
      expect(plugins).toStrictEqual([]);
    },
  );

  it.each(
    lintCases([
      {
        condition: 'an adapter maps null from the wire',
        files: {
          'src/features/orders/adapters/api/order.adapter.ts':
            'export const toCancelledAt = (raw: string | null): string | undefined =>\n  raw === null ? undefined : raw;\n',
        },
      },
      {
        condition: 'generic code in libs names a value by an empty word',
        files: {
          'src/libs/list/list.utils.ts':
            'export const firstOf = (items: readonly string[]): string | undefined => {\n  const value = items.at(0);\n\n  return value;\n};\n',
        },
      },
      {
        condition: "a workspace's libs name a value by an empty word",
        files: {
          'libs/list/languages/typescript/src/list.utils.ts':
            'export const firstOf = (items: readonly string[]): string | undefined => {\n  const value = items.at(0);\n\n  return value;\n};\n',
        },
      },
      {
        condition: 'a value is printed with a replacer of null',
        files: {
          'src/features/orders/domain/print.ts':
            'export const print = (order: object): string => JSON.stringify(order, null, 2);\n',
        },
      },
      {
        condition: 'a surface re-exports by name',
        files: {
          'src/features/orders/index.ts':
            "export { cancelOrder } from './app';\nexport type { Order } from './domain';\n",
        },
      },
      {
        condition: 'a hooks file calls an effect through an effect event',
        files: {
          'src/room.hooks.ts': ROOM_HOOK,
        },
      },
      {
        condition: 'a union mixes a string literal with another type',
        files: {
          'src/features/orders/domain/limit.ts': "export type Limit = 'none' | number;\n",
        },
      },
      {
        condition: 'a case reads should without a condition',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  expect(1).toBe(1);\n});\n",
        },
      },
      {
        condition: 'an object type has a string literal property',
        files: {
          'src/features/orders/domain/opened.ts':
            "export interface Opened {\n  readonly status: 'open';\n}\n",
        },
      },
      {
        condition: "a spec builds a fake function through vi's object",
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test, vi } from 'bun:test';\n\ntest('should call the loader when asked', () => {\n  const load = vi.fn();\n\n  load();\n\n  expect(load).toHaveBeenCalledTimes(1);\n});\n",
        },
      },
    ]),
  )('should report no plugin finding when $condition', ({ files }) => {
    // Arrange
    const project = {
      files,
    };

    // Act
    const { plugins } = lintFindings(project);

    // Assert
    expect(plugins).toStrictEqual([]);
  });

  const adapterOnTheBase = lintCase({
    files: {
      'src/features/orders/adapters/api/order.adapter.ts':
        'export const toCancelledAt = (raw: string | null): string | undefined =>\n  raw === null ? undefined : raw;\n',
    },
    parts: baseParts,
  });

  it('should report a plugin finding when an adapter maps null from the wire and a project extends only the self, core and typescript parts of the base', () => {
    // Arrange
    const project = adapterOnTheBase;

    // Act
    const { plugins } = lintFindings(project);

    // Assert
    expect(plugins).toContain('undefined-is-the-only-absence');
  });

  it('should name only folders, files and suffixes the blocks write when the preset scopes its rules', () => {
    // Arrange
    const code = blockCode();

    // Act
    const unwritten = presetWords().filter(
      (word) => !code.some((written) => written.includes(word)),
    );

    // Assert
    expect(unwritten).toStrictEqual([]);
  });
});

describe("the parts of Biome's base", () => {
  const probeBesideThePresets = lintCase({
    files: {
      '.droneey/constitution/probe.ts': 'export const data = null;\n',
      'src/order.ts': "export const ORDER_KIND = 'order';\n",
    },
    parts: baseParts,
  });

  it('should leave .droneey/constitution alone when a project lints its whole tree', () => {
    // Arrange
    const project = probeBesideThePresets;

    // Act
    const { plugins, rules } = lintFindings(project);

    // Assert
    expect([
      ...plugins,
      ...rules,
    ]).toStrictEqual([]);
  });

  it('should keep a line of 100 characters when a project formats its code', async () => {
    // Arrange
    const source = lineOf(100);

    // Act
    const text = await formattedText(source);

    // Assert
    expect(text).toBe(source);
  });

  it('should wrap a line of 101 characters when a project formats its code', async () => {
    // Arrange
    const source = lineOf(101);

    // Act
    const text = await formattedText(source);

    // Assert
    expect(text).toBe(wrappedLine);
  });

  it.each([
    'common/biome/foundation/git.jsonc',
  ])('should parse when a project extends %s', (path) => {
    // Arrange
    const text = presetText(path);

    // Act
    const config: unknown = Bun.JSONC.parse(text);

    // Assert
    expect(config).toBeObject();
  });

  it('should hold no rule at warn when a project extends any part', () => {
    // Arrange
    const texts = presetFiles().map(presetText);

    // Act
    const warnings = texts.filter((text) => /"warn"/.test(text));

    // Assert
    expect(warnings).toStrictEqual([]);
  });

  it.each(
    lintCases(
      [
        {
          condition: 'a function body passes 100 lines',
          files: {
            'src/main.ts': functionWithBodyOf(101),
          },
          rule: 'noExcessiveLinesPerFunction',
        },
        {
          condition: 'a file passes 500 lines',
          files: {
            'src/main.ts': fileOfLines(501),
          },
          rule: 'noExcessiveLinesPerFile',
        },
        {
          condition: 'a value read from outside is cast to its type',
          files: {
            'src/main.ts':
              'interface Order {\n  id: string;\n}\n\nexport const orderOf = (text: string): Order => JSON.parse(text) as Order;\n',
          },
          rule: 'noUnsafeTypeAssertion',
        },
        {
          condition: 'null is compared loosely',
          files: {
            'src/main.ts':
              'export const isAbsent = (value: string | null): boolean => value == null;\n',
          },
          rule: 'noDoubleEquals',
        },
        {
          condition: 'a function takes a fourth positional argument',
          files: {
            'src/main.ts': FOUR_PARAMETERS,
          },
          rule: 'useMaxParams',
        },
        {
          condition: 'shipped code writes to the console',
          files: {
            'src/main.ts': "console.info('ready');\n",
          },
          rule: 'noConsole',
        },
        {
          condition: 'a spec types a value as any',
          files: {
            'src/__tests__/main.test.ts':
              "import { expect, test } from 'bun:test';\n\ntest('should keep any out when a spec types a value', () => {\n  const value: any = 1;\n  expect(value).toBe(1);\n});\n",
          },
          rule: 'noExplicitAny',
        },
        {
          condition: 'a helper in __tests__ asserts non-null',
          files: {
            'src/__tests__/order.fixtures.ts':
              'export const first = (items: readonly string[]): string => items[0]!;\n',
          },
          rule: 'noNonNullAssertion',
        },
        {
          condition: 'a spec is focused',
          files: {
            'src/__tests__/main.test.ts':
              "import { expect, test } from 'bun:test';\n\ntest.only('should run alone when focused', () => {\n  expect(true).toBe(true);\n});\n",
          },
          rule: 'noFocusedTests',
        },
        {
          condition: 'an enum member leaves its value unwritten',
          files: {
            'src/main.ts': 'export enum ExitStatus {\n  Success,\n  Failure,\n}\n',
          },
          rule: 'useEnumInitializers',
        },
        {
          condition: 'a module imports a date library',
          files: {
            'src/main.ts':
              "import dayjs from 'dayjs';\n\nexport const today = (): string => dayjs().format();\n",
          },
          rule: 'noRestrictedImports',
        },
        {
          condition: 'a module imports a path inside a date library',
          files: {
            'src/main.ts':
              "import { addDays } from 'date-fns/addDays';\n\nexport const tomorrow = addDays;\n",
          },
          rule: 'noRestrictedImports',
        },
        {
          condition: 'a module imports an export marked deprecated',
          files: {
            'src/orders/order.ts':
              '/** @deprecated Use createOrder. */\nexport const makeOrder = (): number => 1;\n\nexport const createOrder = (): number => 2;\n',
            'src/main.ts':
              "import { makeOrder } from './orders/order';\n\nexport const order = makeOrder();\n",
          },
          rule: 'noDeprecatedImports',
        },
        {
          condition: 'a function returns undefined by name',
          files: {
            'src/main.ts': 'export const settle = (): undefined => {\n  return undefined;\n};\n',
          },
          rule: 'noUselessUndefined',
        },
        {
          condition: 'a promise is left floating',
          files: {
            'src/main.ts':
              'export const save = async (): Promise<void> => {\n  await Promise.resolve();\n};\n\nexport const run = (): void => {\n  save();\n};\n',
          },
          rule: 'noFloatingPromises',
        },
        {
          condition: 'a promise is used as a condition',
          files: {
            'src/main.ts':
              'export const ready = (): void => {\n  const loading = Promise.resolve(true);\n\n  if (loading) {\n    globalThis.focus();\n  }\n};\n',
          },
          rule: 'noMisusedPromises',
        },
        {
          condition: 'a block is empty',
          files: {
            'src/main.ts':
              'export const load = (): void => {\n  try {\n    globalThis.focus();\n  } catch {}\n};\n',
          },
          rule: 'noEmptyBlockStatements',
        },
        {
          condition: 'a function branches past its complexity',
          files: {
            'src/main.ts':
              "export const grade = (a: number, b: number, c: number): string => {\n  if (a > 1) {\n    if (b > 1) {\n      if (c > 1) {\n        for (const x of [a, b]) {\n          if (x > c && a > b) {\n            return 'high';\n          } else if (x < c || a < b) {\n            return 'low';\n          }\n        }\n      }\n    }\n  }\n\n  return 'none';\n};\n",
          },
          rule: 'noExcessiveCognitiveComplexity',
        },
        {
          condition: 'the code shows an alert',
          files: {
            'src/main.ts': "export const warn = (): void => {\n  alert('saved');\n};\n",
          },
          rule: 'noAlert',
        },
        {
          condition: 'a secret is written in the code',
          files: {
            'src/main.ts': `export const API_TOKEN = 'ghp_${'aB3dE5'.repeat(6)}';
`,
          },
          rule: 'noSecrets',
        },
        {
          condition: 'a switch over a union misses a member',
          files: {
            'src/main.ts':
              "type Status = 'open' | 'closed';\n\nexport const label = (status: Status): string => {\n  switch (status) {\n    case 'open':\n      return 'open';\n  }\n};\n",
          },
          rule: 'useExhaustiveSwitchCases',
        },
        {
          condition: 'a default is given with a logical or',
          files: {
            'src/main.ts':
              "export const nameOf = (name: string | undefined): string => name || 'anonymous';\n",
          },
          rule: 'useNullishCoalescing',
        },
        {
          condition: 'an expectation sits in a branch',
          files: {
            'src/__tests__/order.test.ts':
              "import { expect, test } from 'bun:test';\n\ntest('should add totals when both are set', () => {\n  const total = 1 + 1;\n\n  if (total > 1) {\n    expect(total).toBe(2);\n  }\n});\n",
          },
          rule: 'noConditionalExpect',
        },
        {
          condition: 'a case is skipped',
          files: {
            'src/main.ts':
              "import { expect, test } from 'bun:test';\n\ntest.skip('should add totals when both are set', () => {\n  expect(1 + 1).toBe(2);\n});\n",
          },
          rule: 'noSkippedTests',
        },
        {
          condition: 'a case asserts nothing',
          files: {
            'src/__tests__/order.test.ts':
              "import { test } from 'bun:test';\n\ntest('should add totals when both are set', () => {\n  const total = 1 + 1;\n\n  globalThis.console.info(total);\n});\n",
          },
          rule: 'useExpect',
        },
        {
          condition: 'a spec repeats a hook, which only the test domain catches',
          files: {
            'src/__tests__/order.test.ts':
              "import { beforeEach, describe, expect, test } from 'bun:test';\n\ndescribe('orders', () => {\n  beforeEach(() => {});\n  beforeEach(() => {});\n  test('should add totals when two are given', () => {\n    expect(1).toBe(1);\n  });\n});\n",
          },
          rule: 'noDuplicateTestHooks',
        },
      ],
      {
        parts: testParts,
      },
    ),
  )('should report $rule when $condition', ({ files, parts, rule }) => {
    // Arrange
    const project = {
      files,
      parts,
    };

    // Act
    const { rules } = lintFindings(project);

    // Assert
    expect(rules).toContain(rule);
  });

  const clientThatRetriesNothing = lintCase({
    files: {
      'src/__tests__/order.test.ts':
        "import { expect, test } from 'bun:test';\n\ntest('should load orders when the cache is fresh', () => {\n  const options = { queries: { retry: false } };\n\n  expect(options).toStrictEqual({ queries: { retry: false } });\n});\n",
    },
    parts: testParts,
  });

  it('should report no plugin finding when a case configures a client that retries nothing', () => {
    // Arrange
    const project = clientThatRetriesNothing;

    // Act
    const { plugins } = lintFindings(project);

    // Assert
    expect(plugins).toStrictEqual([]);
  });

  it.each(
    lintCases(
      [
        {
          condition: 'a function body holds 100 lines',
          files: {
            'src/main.ts': functionWithBodyOf(100),
          },
          rule: 'noExcessiveLinesPerFunction',
        },
        {
          condition: 'a spec passes 500 lines',
          files: {
            'src/__tests__/main.test.ts': fileOfLines(600),
          },
          rule: 'noExcessiveLinesPerFile',
        },
        {
          condition: 'a function takes a third positional argument',
          files: {
            'src/main.ts': THREE_PARAMETERS,
          },
          rule: 'useMaxParams',
        },
        {
          condition: 'a generated file passes 500 lines',
          files: {
            'src/orders.gen.ts': fileOfLines(600),
          },
          rule: 'noExcessiveLinesPerFile',
        },
        {
          condition: 'a generated file holds a function of more than 100 lines',
          files: {
            'src/schema.gen/orders.ts': functionWithBodyOf(150),
          },
          rule: 'noExcessiveLinesPerFunction',
        },
        {
          condition: 'a *.test.ts spec passes 500 lines',
          files: {
            'src/main.test.ts': fileOfLines(600),
          },
          rule: 'noExcessiveLinesPerFile',
        },
        {
          condition: 'a spec holds a function of more than 100 lines',
          files: {
            'src/__tests__/main.test.ts': functionWithBodyOf(150),
          },
          rule: 'noExcessiveLinesPerFunction',
        },
        {
          condition: 'a spec nests six suites, a rule the test domain turns on below an error',
          files: {
            'src/__tests__/order.test.ts': sixSuitesDeep,
          },
          rule: 'noExcessiveNestedTestSuites',
        },
      ],
      {
        parts: testParts,
      },
    ),
  )('should not report $rule when $condition', ({ files, parts, rule }) => {
    // Arrange
    const project = {
      files,
      parts,
    };

    // Act
    const { rules } = lintFindings(project);

    // Assert
    expect(rules).not.toContain(rule);
  });

  it.each(
    lintCases(
      [
        {
          condition: 'a function is named by an empty verb',
          files: {
            'src/features/orders/order.ts': 'export const process = (): number => 1;\n',
          },
          plugin: 'biome-refuses-empty-verbs',
        },
        {
          condition: 'a method is named by an empty verb',
          files: {
            'src/features/orders/order.ts':
              'export const orders = {\n  handle(): number {\n    return 1;\n  },\n};\n',
          },
          plugin: 'biome-refuses-empty-verbs',
        },
        {
          condition: 'a spec leaves a case to do',
          files: {
            'src/order.test.ts': "import { test } from 'bun:test';\n\ntest.todo('adds totals');\n",
          },
          plugin: 'test-never-skipped-or-empty',
        },
        {
          condition: 'a spec runs a case only under a condition',
          files: {
            'src/order.test.ts':
              "import { expect, test } from 'bun:test';\n\ntest.skipIf(process.platform === 'win32')('should add totals', () => {\n  expect(1).toBe(1);\n});\n",
          },
          plugin: 'test-never-skipped-or-empty',
        },
        {
          condition: 'a spec expects a case to fail',
          files: {
            'src/order.test.ts':
              "import { expect, test } from 'bun:test';\n\ntest.failing('should add totals', () => {\n  expect(1).toBe(2);\n});\n",
          },
          plugin: 'test-never-skipped-or-empty',
        },
        {
          condition: 'a type alias carries the Type suffix',
          files: {
            'src/features/orders/order.ts': 'export type OrderType = {\n  id: string;\n};\n',
          },
          plugin: 'type-names-undecorated',
        },
        {
          condition: 'an interface carries the I prefix',
          files: {
            'src/features/orders/order.ts': 'export interface IOrder {\n  id: string;\n}\n',
          },
          plugin: 'type-names-undecorated',
        },
        {
          condition: 'a module exports a binding it can reassign',
          files: {
            'src/session.ts': 'export let current = 0;\n',
          },
          plugin: 'module-level-value-never-changed',
        },
        {
          condition: 'a module keeps a variable it can reassign',
          files: {
            'src/session.ts': 'let current = 0;\nexport const next = (): number => current + 1;\n',
          },
          plugin: 'module-level-value-never-changed',
        },
        {
          condition: 'a spec compares with toEqual',
          files: {
            'src/order.test.ts':
              "import { expect, test } from 'bun:test';\n\ntest('adds totals', () => {\n  expect(1).toEqual(1);\n});\n",
          },
          plugin: 'strict-matcher-only',
        },
        {
          condition: 'a spec compares part of the outcome',
          files: {
            'src/order.test.ts':
              "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  expect({ total: 1 }).toMatchObject({ total: 1 });\n});\n",
          },
          plugin: 'strict-matcher-only',
        },
        {
          condition: 'a spec asks only for a truthy outcome',
          files: {
            'src/order.test.ts':
              "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  expect(1).toBeTruthy();\n});\n",
          },
          plugin: 'strict-matcher-only',
        },
        {
          condition: 'a case is retried',
          files: {
            'src/order.test.ts':
              "import { expect, it, test } from 'bun:test';\n\ntest('should add totals when both are set', () => {\n  expect(1).toBe(1);\n}, { retry: 3 });\n",
          },
          plugin: 'failed-test-never-retried',
        },
        {
          condition: 'a table of cases is repeated',
          files: {
            'src/order.test.ts':
              "import { expect, it, test } from 'bun:test';\n\nit.each([1])('should keep %p when given', (value) => {\n  expect(value).toBe(1);\n}, { timeout: 100, repeats: 5 });\n",
          },
          plugin: 'failed-test-never-retried',
        },
        {
          condition: 'a spec sleeps through Bun',
          files: {
            'src/order.test.ts':
              "import { expect, it, test } from 'bun:test';\n\ntest('should save when the user stops typing', async () => {\n  await Bun.sleep(50);\n  expect(1).toBe(1);\n});\n",
          },
          plugin: 'spec-never-sleeps',
        },
        {
          condition: 'a spec sleeps through a timer',
          files: {
            'src/order.test.ts':
              "import { expect, it, test } from 'bun:test';\n\ntest('should save when the user stops typing', async () => {\n  await new Promise((resolve) => setTimeout(resolve, 50));\n  expect(1).toBe(1);\n});\n",
          },
          plugin: 'spec-never-sleeps',
        },
        {
          condition: 'a spec imports the promised timer',
          files: {
            'src/order.test.ts':
              "import { setTimeout as wait } from 'node:timers/promises';\n\nexport const pause = wait;\n",
          },
          plugin: 'spec-never-sleeps',
        },
        {
          condition: 'a case branches',
          files: {
            'src/order.test.ts':
              "import { expect, it, test } from 'bun:test';\n\ntest('should add totals when both are set', () => {\n  if (Date.now() > 0) {\n    expect(1).toBe(1);\n  }\n});\n",
          },
          plugin: 'case-holds-no-logic',
        },
        {
          condition: 'a row of a table computes its expectation',
          files: {
            'src/order.test.ts':
              "import { expect, it, test } from 'bun:test';\n\nit.each([1])('should double %p when given', (value) => {\n  expect(value * 2).toBe(value > 0 ? 2 : 0);\n});\n",
          },
          plugin: 'case-holds-no-logic',
        },
      ],
      {
        parts: testParts,
      },
    ),
  )('should report a plugin finding when $condition', ({ files, parts, plugin }) => {
    // Arrange
    const project = {
      files,
      parts,
    };

    // Act
    const { plugins } = lintFindings(project);

    // Assert
    expect(plugins).toContain(plugin);
  });

  it.each(
    lintCases(
      [
        {
          condition: 'a type argument',
          files: {
            'src/features/accounts/adapters/api/models/account.model.ts':
              "import { z } from 'zod';\n\nexport const emailModel = z.string().brand<'Email'>();\n",
          },
        },
        {
          condition: 'a name after a format',
          files: {
            'src/features/accounts/adapters/api/models/account.model.ts':
              "import { z } from 'zod';\n\nexport const emailModel = z.string().email().brand('Email');\n",
          },
        },
      ],
      {
        parts: [
          ...baseParts,
          'typescript/zod',
        ],
      },
    ),
  )(
    'should report a plugin finding when a schema brands a value by $condition and a project extends the zod part',
    ({ files, parts }) => {
      // Arrange
      const project = {
        files,
        parts,
      };

      // Act
      const { plugins } = lintFindings(project);

      // Assert
      expect(plugins).toContain('schema-never-brands');
    },
  );

  it.each(
    lintCases(
      [
        {
          condition: 'a date is formatted without a locale',
          files: {
            'src/panel.tsx':
              'export const label = (at: Date): string => at.toLocaleDateString();\n',
          },
          plugin: 'locale-passed-to-every-intl-call',
        },
        {
          condition: 'a number formatter is built without a locale',
          files: {
            'src/panel.tsx': 'export const formatter = new Intl.NumberFormat();\n',
          },
          plugin: 'locale-passed-to-every-intl-call',
        },
        {
          condition: 'a date is formatted with undefined in place of the locale',
          files: {
            'src/panel.tsx':
              "export const label = (at: Date): string =>\n  at.toLocaleDateString(undefined, { month: 'long' });\n",
          },
          plugin: 'locale-passed-to-every-intl-call',
        },
        {
          condition: 'a formatter is built without new and without a locale',
          files: {
            'src/panel.tsx': 'export const formatter = Intl.DateTimeFormat();\n',
          },
          plugin: 'locale-passed-to-every-intl-call',
        },
      ],
      {
        parts: [
          ...baseParts,
          'typescript/i18n',
        ],
      },
    ),
  )(
    'should report a plugin finding when $condition and a project extends the i18n part',
    ({ files, parts, plugin }) => {
      // Arrange
      const project = {
        files,
        parts,
      };

      // Act
      const { plugins } = lintFindings(project);

      // Assert
      expect(plugins).toContain(plugin);
    },
  );

  it.each(
    lintCases(
      [
        {
          condition: 'a spec waits a fixed time',
          rule: 'noPlaywrightWaitForTimeout',
          files: {
            'tests/e2e/sign-in.e2e.test.ts':
              "import { expect, test } from '@playwright/test';\n\ntest('should sign in when the password is right', async ({ page }) => {\n  await page.waitForTimeout(500);\n  await expect(page.getByRole('heading')).toBeVisible();\n});\n",
          },
        },
        {
          condition: 'a spec waits for a quiet network',
          rule: 'noPlaywrightNetworkidle',
          files: {
            'tests/e2e/sign-in.e2e.test.ts':
              "import { expect, test } from '@playwright/test';\n\ntest('should sign in when the password is right', async ({ page }) => {\n  await page.goto('/', { waitUntil: 'networkidle' });\n});\n",
          },
        },
        {
          condition: 'a spec forces a click',
          rule: 'noPlaywrightForceOption',
          files: {
            'tests/e2e/sign-in.e2e.test.ts':
              "import { expect, test } from '@playwright/test';\n\ntest('should sign in when the password is right', async ({ page }) => {\n  await page.getByRole('button').click({ force: true });\n});\n",
          },
        },
        {
          condition: 'a spec leaves an assertion unawaited',
          rule: 'noPlaywrightMissingAwait',
          files: {
            'tests/e2e/sign-in.e2e.test.ts':
              "import { expect, test } from '@playwright/test';\n\ntest('should sign in when the password is right', async ({ page }) => {\n  await page.goto('/');\n  expect(page.getByRole('heading')).toBeVisible();\n});\n",
          },
        },
      ],
      {
        parts: [
          ...baseParts,
          'typescript/playwright',
        ],
      },
    ),
  )(
    'should report $rule when $condition and a project extends the playwright part',
    ({ files, parts, rule }) => {
      // Arrange
      const project = {
        files,
        parts,
      };

      // Act
      const { rules } = lintFindings(project);

      // Assert
      expect(rules).toContain(rule);
    },
  );

  it.each(
    lintCases(
      [
        {
          condition: 'a component holds a ref object',
          files: {
            'src/panel.tsx':
              "import { useRef } from 'react';\n\nexport function Panel(): React.ReactElement {\n  const box = useRef<HTMLDivElement>(null);\n\n  return <div ref={box} />;\n}\n",
          },
        },
        {
          condition: 'a component takes a ref object as a prop',
          files: {
            'src/panel.tsx':
              "import type { RefObject } from 'react';\n\nexport function Panel({ box }: { box: RefObject<HTMLDivElement | null> }): React.ReactElement {\n  return <div ref={box} />;\n}\n",
          },
        },
        {
          condition: 'a component renders the null branch of a conditional',
          files: {
            'src/panel.tsx':
              'export function Panel({ isOpen }: { isOpen: boolean }): React.ReactElement | null {\n  return isOpen ? <div /> : null;\n}\n',
          },
        },
        {
          condition: 'an override component renders nothing',
          files: {
            'src/panel.tsx': 'export const components = {\n  hr: () => null,\n};\n',
          },
        },
        {
          condition: 'a hook holds a ref object',
          files: {
            'src/panel.hooks.ts':
              "import { useRef } from 'react';\n\nexport const useBox = (): unknown => useRef(null);\n",
          },
        },
        {
          condition: 'a module builds a dictionary with no prototype',
          files: {
            'src/registry.ts':
              'export const registry: Record<string, number> = Object.create(null);\n',
          },
        },
        {
          condition: 'a type leaves keys out with a union',
          files: {
            'src/panel.types.ts':
              "interface Props {\n  label: string;\n  onSubmit: () => void;\n  isDisabled: boolean;\n}\n\nexport type FieldProps = Omit<Props, 'onSubmit' | 'isDisabled'>;\n",
          },
        },
        {
          condition: 'a handler typed for a proxy names its trap',
          files: {
            'src/settings.ts':
              'export const handler: ProxyHandler<object> = {\n  get(target, property) {\n    return Reflect.get(target, property);\n  },\n};\n',
          },
        },
        {
          condition: "a proxy's handler names its trap",
          files: {
            'src/settings.ts':
              'export const settings = new Proxy(\n  {},\n  {\n    get(target, property) {\n      return Reflect.get(target, property);\n    },\n  },\n);\n',
          },
        },
      ],
      {
        parts: [
          ...baseParts,
          'typescript/_react',
        ],
      },
    ),
  )('should report no plugin finding when $condition', ({ files, parts }) => {
    // Arrange
    const project = {
      files,
      parts,
    };

    // Act
    const { plugins } = lintFindings(project);

    // Assert
    expect(plugins).toStrictEqual([]);
  });

  it.each(
    lintCases(
      [
        {
          condition: 'a conditional returns null beside a value that is no markup',
          plugin: 'nothing-rendered-as-null',
          files: {
            'src/panel.tsx':
              'export const countOf = (isShown: boolean): number | undefined => (isShown ? 1 : null) ?? undefined;\n',
          },
        },
        {
          condition: 'a callback that is no component returns null',
          plugin: 'nothing-rendered-as-null',
          files: {
            'src/panel.tsx':
              "export const blanks = (): readonly unknown[] => ['row'].map(() => null);\n",
          },
        },
        {
          condition: 'a state hook takes a union of literals',
          plugin: 'closed-name-set-is-a-string-enum',
          files: {
            'src/panel.tsx':
              "import { useState } from 'react';\n\nexport const useMode = (): unknown => useState<'idle' | 'busy'>('idle');\n",
          },
        },
      ],
      {
        parts: [
          ...baseParts,
          'typescript/_react',
        ],
      },
    ),
  )('should report a plugin finding when $condition', ({ files, parts, plugin }) => {
    // Arrange
    const project = {
      files,
      parts,
    };

    // Act
    const { plugins } = lintFindings(project);

    // Assert
    expect(plugins).toContain(plugin);
  });

  it.each(
    lintCases(
      [
        {
          isReported: true,
          parts: baseParts,
        },
        {
          isReported: false,
          parts: [
            ...baseParts,
            'typescript/storybook',
          ],
        },
      ],
      {
        files: {
          'src/panel.stories.tsx': "const meta = { title: 'Panel' };\n\nexport default meta;\n",
        },
      },
    ),
  )(
    'should report noDefaultExport $isReported when a story exports its meta by default and a project extends $parts',
    ({ files, isReported, parts }) => {
      // Arrange
      const project = {
        files,
        parts,
      };

      // Act
      const { rules } = lintFindings(project);

      // Assert
      expect(rules.includes('noDefaultExport')).toBe(isReported);
    },
  );

  it.each(
    lintCases(
      [
        {
          condition: 'a class list negates a condition',
          files: {
            'src/panel.tsx':
              "export const classes = (isOpen: boolean): string => cn('px-2', !isOpen && 'hidden');\n",
          },
        },
        {
          condition: 'a class list asserts a value is present',
          files: {
            'src/panel.tsx':
              "export const classes = (size: string | undefined): string => cn(size!, 'px-2');\n",
          },
        },
      ],
      {
        parts: [
          ...baseParts,
          'typescript/tailwind',
        ],
      },
    ),
  )('should report no important-modifier finding when $condition', ({ files, parts }) => {
    // Arrange
    const project = {
      files,
      parts,
    };

    // Act
    const { plugins } = lintFindings(project);

    // Assert
    expect(plugins).not.toContain('important-modifier-never-in-a-class-list');
  });

  const formattingWithLocale = lintCase({
    files: {
      'src/panel.tsx': "export const label = (at: Date): string => at.toLocaleDateString('uk');\n",
    },
    parts: [
      ...baseParts,
      'typescript/i18n',
    ],
  });

  it('should report no plugin finding when formatting takes a locale and a project extends the i18n part', () => {
    // Arrange
    const project = formattingWithLocale;

    // Act
    const { plugins } = lintFindings(project);

    // Assert
    expect(plugins).toStrictEqual([]);
  });

  const bodyCastByJson = lintCase({
    files: {
      'src/features/orders/order.ts':
        'interface Order {\n  id: string;\n}\n\nexport const read = (response: Response): Promise<Order> =>\n  response.json<Order>();\n',
    },
    parts: [
      ...baseParts,
      'typescript/ky',
    ],
  });

  it('should report a plugin finding when a response body is cast with .json<T>() and a project extends the ky part', () => {
    // Arrange
    const project = bodyCastByJson;

    // Act
    const { plugins } = lintFindings(project);

    // Assert
    expect(plugins).toContain('ky-body-parsed-by-schema');
  });

  it.each(
    lintCases([
      {
        condition: 'a link target is concatenated',
        files: {
          'src/features/orders/ui/widgets/order-link.ts':
            "export const target = (id: string): { to: string } => ({ to: '/orders/' + id });\n",
        },
        plugin: 'links-name-typed-targets',
        parts: [
          ...baseParts,
          'typescript/tanstack-router',
        ],
      },
      {
        condition: 'a hook writes its read inline',
        files: {
          'src/features/orders/app/use-cases/queries/list/list.hooks.ts':
            "export const options = { queryKey: ['orders'], queryFn: (): number => 1 };\n",
        },
        plugin: 'read-declared-once-as-query-options',
        parts: [
          ...baseParts,
          'typescript/architecture/tanstack-query',
        ],
      },
      {
        condition: 'a module builds the query client at its top level',
        files: {
          'src/shared/query/client.ts':
            "import { QueryClient } from '@tanstack/react-query';\n\nexport const client = new QueryClient();\n",
        },
        plugin: 'query-client-built-by-the-root',
        parts: [
          ...baseParts,
          'typescript/architecture/tanstack-query',
        ],
      },
    ]),
  )(
    'should report a plugin finding when $condition and a project extends its part',
    ({ files, parts, plugin }) => {
      // Arrange
      const project = {
        files,
        parts,
      };

      // Act
      const { plugins } = lintFindings(project);

      // Assert
      expect(plugins).toContain(plugin);
    },
  );

  it.each(
    lintCases([
      {
        condition: 'a link names its route by path and params',
        files: {
          'src/features/orders/ui/widgets/order-link.ts':
            "export const target = { to: '/orders/$orderId' };\n",
        },
        parts: [
          ...baseParts,
          'typescript/tanstack-router',
        ],
      },
      {
        condition: 'the cache utilities declare a read and the root builds the client',
        files: {
          'src/features/orders/app/utils/cache.utils.ts':
            "export const listOptions = { queryKey: ['orders'], queryFn: (): number => 1 };\n",
          'src/root/query-client.ts':
            "import { QueryClient } from '@tanstack/react-query';\n\nexport const client = new QueryClient();\n",
        },
        parts: [
          ...baseParts,
          'typescript/architecture/tanstack-query',
        ],
      },
    ]),
  )(
    'should report no plugin finding when $condition and a project extends its part',
    ({ files, parts }) => {
      // Arrange
      const project = {
        files,
        parts,
      };

      // Act
      const { plugins } = lintFindings(project);

      // Assert
      expect(plugins).toStrictEqual([]);
    },
  );
});

const ERROR_WITHOUT_CAUSE =
  "export const readOrder = (text: string): unknown => {\n  try {\n    return JSON.parse(text);\n  } catch (error) {\n    throw new Error('unreadable order');\n  }\n};\n";

describe('the Biome parts of the libraries', () => {
  it.each(
    lintCases([
      {
        condition: 'a message is translated at the top level of a module',
        files: {
          'src/features/chat/ui/status.ts':
            "import { t } from '@lingui/core/macro';\n\nexport const online = t`Online`;\n",
        },
        plugin: 'module-level-messages-are-descriptors',
        parts: [
          ...baseParts,
          'typescript/lingui',
        ],
      },
      {
        condition: 'a schema chains a format on z.string()',
        files: {
          'src/features/chat/adapters/api/models/user.model.ts':
            "import { z } from 'zod';\n\nexport const userModel = z.strictObject({ email: z.string().email() });\n",
        },
        plugin: 'zod-four-forms-only',
        parts: [
          ...baseParts,
          'typescript/zod',
        ],
      },
    ]),
  )(
    'should report a plugin finding when $condition and a project extends the part that holds it',
    ({ files, parts, plugin }) => {
      // Arrange
      const project = {
        files,
        parts,
      };

      // Act
      const { plugins } = lintFindings(project);

      // Assert
      expect(plugins).toContain(plugin);
    },
  );

  it.each(
    lintCases([
      {
        condition: 'a module declares its message and a component translates it',
        files: {
          'src/features/chat/ui/status.ts':
            "import { msg, t } from '@lingui/core/macro';\n\nexport const online = msg`Online`;\nexport const label = (): string => t`Away`;\n",
        },
        parts: [
          ...baseParts,
          'typescript/lingui',
        ],
      },
      {
        condition: 'a schema takes a format on its own and merges by extend',
        files: {
          'src/features/chat/adapters/api/models/user.model.ts':
            "import { z } from 'zod';\n\nconst baseSchema = z.strictObject({ id: z.string() });\n\nexport const userModel = baseSchema.extend({ email: z.email() });\n",
        },
        parts: [
          ...baseParts,
          'typescript/zod',
        ],
      },
      {
        condition: "an entity's fields are readonly",
        files: {
          'src/features/chat/domain/entities/chat.entity.ts':
            'export interface Chat {\n  readonly title: string;\n  rename(title: string): Chat;\n}\n',
        },
        parts: [
          ...baseParts,
          'typescript/architecture/typescript',
        ],
      },
    ]),
  )(
    'should report no plugin finding when $condition and a project extends the part that holds it',
    ({ files, parts }) => {
      // Arrange
      const project = {
        files,
        parts,
      };

      // Act
      const { plugins } = lintFindings(project);

      // Assert
      expect(plugins).toStrictEqual([]);
    },
  );
});

const UNTYPED_RETURN = 'export const next = (count: number) => count + 1;\n';

describe('the Biome part that needs each setting', () => {
  it.each(
    lintCases([
      {
        condition: 'a function leaves its return type unwritten',
        files: {
          'src/main.ts': UNTYPED_RETURN,
        },
        isReported: false,
        parts: [
          'common/self',
          'typescript/self',
          'typescript/core',
        ],
        rule: 'useExplicitReturnType',
      },
      {
        condition: 'a function leaves its return type unwritten',
        files: {
          'src/main.ts': UNTYPED_RETURN,
        },
        isReported: true,
        parts: baseParts,
        rule: 'useExplicitReturnType',
      },
      {
        condition: 'a catch block throws a new error without its cause',
        files: {
          'src/main.ts': ERROR_WITHOUT_CAUSE,
        },
        isReported: false,
        parts: [
          'common/self',
          'typescript/self',
        ],
        rule: 'useErrorCause',
      },
      {
        condition: 'a catch block throws a new error without its cause',
        files: {
          'src/main.ts': ERROR_WITHOUT_CAUSE,
        },
        isReported: true,
        parts: [
          'common/self',
          'typescript/self',
          'typescript/core',
        ],
        rule: 'useErrorCause',
      },
      {
        condition: 'the dependency-cruiser configuration exports by default',
        files: {
          '.dependency-cruiser.mjs': 'export default {};\n',
        },
        isReported: true,
        parts: baseParts,
        rule: 'noDefaultExport',
      },
      {
        condition: 'the dependency-cruiser configuration exports by default',
        files: {
          '.dependency-cruiser.mjs': 'export default {};\n',
        },
        isReported: false,
        parts: [
          ...baseParts,
          'typescript/dependency-cruiser',
        ],
        rule: 'noDefaultExport',
      },
      {
        condition: 'a bigint is added to a number',
        files: {
          'src/main.ts': 'export const total = (count: number): bigint => 1n + count;\n',
        },
        isReported: true,
        parts: baseParts,
        rule: 'noUnsafePlusOperands',
      },
      {
        condition: 'a declared return type is wider than what is returned',
        files: {
          'src/main.ts': 'export const rank = (isFirst: boolean): number => (isFirst ? 0 : 1);\n',
        },
        isReported: true,
        parts: baseParts,
        rule: 'noMisleadingReturnType',
      },
      {
        condition: 'a string is thrown',
        files: {
          'src/main.ts': "export const fail = (): never => {\n  throw 'broken';\n};\n",
        },
        isReported: true,
        parts: baseParts,
        rule: 'useThrowOnlyError',
      },
      {
        condition: 'a feature reads the environment',
        files: {
          'src/features/orders/order.ts':
            "export const region = (): string => process.env['REGION'] ?? 'eu';\n",
        },
        isReported: true,
        parts: [
          ...baseParts,
          'typescript/architecture/typescript',
        ],
        rule: 'noProcessEnv',
      },
      {
        condition: 'the root reads the environment',
        files: {
          'src/root/config.ts':
            "export const region = (): string => process.env['REGION'] ?? 'eu';\n",
        },
        isReported: false,
        parts: [
          ...baseParts,
          'typescript/architecture/typescript',
        ],
        rule: 'noProcessEnv',
      },
      {
        condition: 'a component calls the global fetch',
        files: {
          'src/features/orders/ui/components/order-card/order-card.ts':
            "export const load = (): Promise<Response> => fetch('/orders');\n",
        },
        isReported: true,
        parts: [
          ...baseParts,
          'typescript/architecture/ui',
        ],
        rule: 'noRestrictedGlobals',
      },
      {
        condition: 'an adapter calls the global fetch',
        files: {
          'src/features/orders/adapters/http/orders.adapter.ts':
            "export const load = (): Promise<Response> => fetch('/orders');\n",
        },
        isReported: false,
        parts: [
          ...baseParts,
          'typescript/architecture/ui',
        ],
        rule: 'noRestrictedGlobals',
      },
      {
        condition: 'an element without children is closed by a tag',
        files: {
          'src/panel.tsx': component('<div></div>'),
        },
        isReported: true,
        parts: [
          ...baseParts,
          'typescript/_react',
        ],
        rule: 'useSelfClosingElements',
      },
      {
        condition: 'a parameter is only handed on to the recursive call',
        files: {
          'src/main.ts':
            'export const depth = (level: number, label: string): number =>\n  level > 0 ? depth(level - 1, label) : 0;\n',
        },
        isReported: true,
        parts: baseParts,
        rule: 'noParametersOnlyUsedInRecursion',
      },
      {
        condition: 'a promise is rejected with a string',
        files: {
          'src/main.ts': "export const fail = (): Promise<never> => Promise.reject('broken');\n",
        },
        isReported: true,
        parts: baseParts,
        rule: 'usePromiseRejectErrors',
      },
      {
        condition: 'a component renders an obsolete element',
        files: {
          'src/panel.tsx': component('<center>Orders</center>'),
        },
        isReported: true,
        parts: [
          ...baseParts,
          'typescript/react-dom',
        ],
        rule: 'noObsoleteTags',
      },
      {
        condition: "a class names a colour of Tailwind's default palette",
        files: {
          'src/panel.tsx': component("<p className='text-pink-500'>Orders</p>"),
        },
        isReported: true,
        parts: [
          ...baseParts,
          'typescript/tailwind',
        ],
        rule: 'noTailwindRawColors',
      },
      {
        condition: 'a spec pauses the page',
        files: {
          'tests/e2e/sign-in.e2e.test.ts': signInSpec('await page.pause();'),
        },
        isReported: true,
        parts: [
          ...baseParts,
          'typescript/playwright',
        ],
        rule: 'noPlaywrightPagePause',
      },
      {
        condition: 'a spec takes an element handle',
        files: {
          'tests/e2e/sign-in.e2e.test.ts': signInSpec("await page.$('h1');"),
        },
        isReported: true,
        parts: [
          ...baseParts,
          'typescript/playwright',
        ],
        rule: 'noPlaywrightElementHandle',
      },
      {
        condition: 'a spec evaluates a selector on the page',
        files: {
          'tests/e2e/sign-in.e2e.test.ts': signInSpec(
            "await page.$eval('h1', (heading) => heading.textContent);",
          ),
        },
        isReported: true,
        parts: [
          ...baseParts,
          'typescript/playwright',
        ],
        rule: 'noPlaywrightEval',
      },
    ]),
  )(
    'should report $rule $isReported when $condition and a project extends $parts',
    ({ files, isReported, parts, rule }) => {
      // Arrange
      const project = {
        files,
        parts,
      };

      // Act
      const { rules } = lintFindings(project);

      // Assert
      expect(rules.includes(rule)).toBe(isReported);
    },
  );
});

const LAYERED =
  '@layer base, components;\n\n@layer base {\n  :root {\n    --color-text: oklch(20% 0 0);\n  }\n}\n\n';

describe('the Biome css part', () => {
  it.each(
    lintCases(
      [
        {
          condition: 'a rule sits outside a layer',
          files: {
            'src/theme.css': `${LAYERED}.card {\n  color: var(--color-text);\n}\n`,
          },
          rule: 'useLayeredStyles',
        },
        {
          condition: 'a layer has no name',
          files: {
            'src/theme.css': `${LAYERED}@layer {\n  .card {\n    color: var(--color-text);\n  }\n}\n`,
          },
          rule: 'useNamedLayer',
        },
        {
          condition: 'a selector holds four classes',
          files: {
            'src/theme.css': `${LAYERED}@layer components {\n  .card .title .label .icon {\n    color: var(--color-text);\n  }\n}\n`,
          },
          rule: 'noExcessiveSelectorClasses',
        },
        {
          condition: 'a custom property is read before it is declared',
          files: {
            'src/theme.css': `${LAYERED}@layer components {\n  .card {\n    color: var(--color-missing);\n  }\n}\n`,
          },
          rule: 'noUndeclaredCustomProperties',
        },
        {
          condition: 'a declared class is used nowhere',
          files: {
            'src/theme.css': `${LAYERED}@layer components {\n  .unused {\n    color: var(--color-text);\n  }\n}\n`,
          },
          rule: 'noUnusedClasses',
        },
      ],
      {
        files: {
          'src/panel.tsx':
            "import './theme.css';\n\nexport function Panel(): React.ReactElement {\n  return <div className='card title label icon' />;\n}\n",
        },
        parts: [
          ...baseParts,
          'css/css',
        ],
      },
    ),
  )('should report $rule when $condition', ({ files, parts, rule }) => {
    // Arrange
    const project = {
      files,
      parts,
    };

    // Act
    const { rules } = lintFindings(project);

    // Assert
    expect(rules).toContain(rule);
  });

  it.each(
    lintCases(
      [
        {
          condition: 'a feature beyond the baseline stands unguarded',
          files: {
            'src/theme.css': `${LAYERED}@layer components {\n  .card {\n    interpolate-size: allow-keywords;\n  }\n}\n`,
          },
        },
      ],
      {
        parts: [
          ...baseParts,
          'css/css',
          'css/browser',
        ],
      },
    ),
  )(
    'should report useBaseline when $condition in a project that extends the browser part',
    ({ files, parts }) => {
      // Arrange
      const project = {
        files,
        parts,
      };

      // Act
      const { rules } = lintFindings(project);

      // Assert
      expect(rules).toContain('useBaseline');
    },
  );

  it.each(
    lintCases(
      [
        {
          condition: 'the theme keeps the default scales',
          files: {
            'src/libs/ui/theme/theme.css': '@theme {\n  --color-text: oklch(20% 0 0);\n}\n',
          },
          isReported: true,
        },
        {
          condition: 'the theme resets the default scales',
          files: {
            'src/libs/ui/theme/theme.css':
              '@theme {\n  --*: initial;\n  --color-text: oklch(20% 0 0);\n}\n',
          },
          isReported: false,
        },
        {
          condition: 'the theme is inline',
          files: {
            'src/libs/ui/theme/theme.css': '@theme inline {\n  --font-sans: var(--font-body);\n}\n',
          },
          isReported: false,
        },
      ],
      {
        parts: [
          ...baseParts,
          'css/css',
          'css/tailwind',
        ],
      },
    ),
  )(
    'should report a plugin finding $isReported when $condition',
    ({ files, isReported, parts }) => {
      // Arrange
      const project = {
        files,
        parts,
      };

      // Act
      const { plugins } = lintFindings(project);

      // Assert
      expect(plugins.includes('utilities-only-from-tokens')).toBe(isReported);
    },
  );

  const propertyDeclaredByTheTheme = lintCase({
    files: {
      'src/theme.css':
        '@theme {\n  --color-text: oklch(20% 0 0);\n}\n\n@layer components {\n  .card {\n    color: var(--color-text);\n  }\n}\n',
    },
    parts: [
      ...baseParts,
      'css/css',
      'css/tailwind',
    ],
  });

  it('should report no undeclared custom property when a project extends the tailwind part', () => {
    // Arrange
    const project = propertyDeclaredByTheTheme;

    // Act
    const { rules } = lintFindings(project);

    // Assert
    expect(rules.includes('noUndeclaredCustomProperties')).toBe(false);
  });

  const selectorById = lintCase({
    files: {
      'src/theme.css': `${LAYERED}@layer components {\n  #main {\n    color: var(--color-text);\n  }\n}\n`,
    },
    parts: [
      ...baseParts,
      'css/css',
    ],
  });

  it('should report a plugin finding when a stylesheet styles an element by its id', () => {
    // Arrange
    const project = selectorById;

    // Act
    const { plugins } = lintFindings(project);

    // Assert
    expect(plugins).toContain('selector-never-targets-an-id');
  });

  it.each(
    lintCases(
      [
        {
          isReported: true,
          parts: [
            ...baseParts,
            'css/css',
            'typescript/css',
          ],
        },
        {
          isReported: false,
          parts: [
            ...baseParts,
            'css/css',
            'typescript/css',
            'typescript/tailwind',
          ],
        },
      ],
      {
        files: {
          'src/panel.tsx':
            "import './theme.css';\n\nexport function Panel(): React.ReactElement {\n  return <div className='flex' />;\n}\n",
          'src/theme.css': LAYERED,
        },
      },
    ),
  )(
    'should report a utility class as undeclared $isReported when a project extends $parts',
    ({ files, isReported, parts }) => {
      // Arrange
      const project = {
        files,
        parts,
      };

      // Act
      const { rules } = lintFindings(project);

      // Assert
      expect(rules.includes('noUndeclaredClasses')).toBe(isReported);
    },
  );
});

describe('the Biome browser part', () => {
  it.each(
    lintCases(
      [
        {
          condition: 'markup is assigned to innerHTML',
          files: {
            'src/features/orders/ui/show.ts':
              'export const show = (panel: Element, markup: string): void => {\n  panel.innerHTML = markup;\n};\n',
          },
        },
        {
          condition: 'markup is inserted beside an element',
          files: {
            'src/features/orders/ui/show.ts':
              "export const show = (panel: Element, markup: string): void => {\n  panel.insertAdjacentHTML('beforeend', markup);\n};\n",
          },
        },
        {
          condition: 'markup is written into the document',
          files: {
            'src/features/orders/ui/show.ts':
              'export const show = (markup: string): void => {\n  document.write(markup);\n};\n',
          },
        },
        {
          condition: 'markup is appended to innerHTML',
          files: {
            'src/features/orders/ui/show.ts':
              'export const show = (panel: Element, markup: string): void => {\n  panel.innerHTML += markup;\n};\n',
          },
        },
        {
          condition: "markup is set as a frame's document",
          files: {
            'src/features/orders/ui/show.ts':
              "export const show = (frame: Element, markup: string): void => {\n  frame.setAttribute('srcdoc', markup);\n};\n",
          },
        },
        {
          condition: 'markup is set without the sanitiser',
          files: {
            'src/features/orders/ui/show.ts':
              'export const show = (panel: Element, markup: string): void => {\n  panel.setHTMLUnsafe(markup);\n};\n',
          },
        },
        {
          condition: 'markup is parsed into a document',
          files: {
            'src/features/orders/ui/show.ts':
              "export const show = (parser: DOMParser, markup: string): Document =>\n  parser.parseFromString(markup, 'text/html');\n",
          },
        },
        {
          condition: 'markup is parsed into a fragment',
          files: {
            'src/features/orders/ui/show.ts':
              'export const show = (range: Range, markup: string): DocumentFragment =>\n  range.createContextualFragment(markup);\n',
          },
        },
      ],
      {
        parts: [
          ...baseParts,
          'typescript/browser',
        ],
      },
    ),
  )('should report raw HTML when $condition', ({ files, parts }) => {
    // Arrange
    const project = {
      files,
      parts,
    };

    // Act
    const { plugins } = lintFindings(project);

    // Assert
    expect(plugins).toContain('raw-html-never-reaches-the-dom');
  });

  const textThroughTheElement = lintCase({
    files: {
      'src/features/orders/ui/show.ts':
        'export const show = (panel: Element, label: string): void => {\n  panel.textContent = label;\n};\n',
    },
    parts: [
      ...baseParts,
      'typescript/browser',
    ],
  });

  it('should report no plugin finding when text is set through the element interfaces', () => {
    // Arrange
    const project = textThroughTheElement;

    // Act
    const { plugins } = lintFindings(project);

    // Assert
    expect(plugins).toStrictEqual([]);
  });
});

describe('the Biome design-system part', () => {
  it.each(
    lintCases(
      [
        {
          isReported: true,
          parts: [
            ...baseParts,
            'css/css',
            'css/design-system',
          ],
        },
        {
          isReported: false,
          parts: [
            ...baseParts,
            'css/css',
          ],
        },
      ],
      {
        files: {
          'src/theme.css':
            '@layer base;\n\n@layer base {\n  :root {\n    --color-text: #102030;\n  }\n}\n',
        },
      },
    ),
  )(
    'should report noHexColors $isReported when a theme writes a hexadecimal colour and a project extends $parts',
    ({ files, isReported, parts }) => {
      // Arrange
      const project = {
        files,
        parts,
      };

      // Act
      const { rules } = lintFindings(project);

      // Assert
      expect(rules.includes('noHexColors')).toBe(isReported);
    },
  );
});

describe('the Biome framework parts', () => {
  it.each(
    lintCases(
      [
        {
          condition: 'a component is a class',
          files: {
            'src/panel.tsx':
              "import { Component } from 'react';\n\nexport class Panel extends Component {\n  public render(): null {\n    return null;\n  }\n}\n",
          },
          rule: 'useReactFunctionComponents',
        },
        {
          condition: 'an ARIA attribute is written in camelCase',
          files: {
            'src/panel.tsx': component("<input ariaLabel='Email' />"),
          },
          rule: 'noUnknownAttribute',
        },
        {
          condition: 'an id is typed by hand',
          files: {
            'src/panel.tsx': component("<input id='email' />"),
          },
          rule: 'useUniqueElementIds',
        },
        {
          condition: 'a component assigns to its props',
          files: {
            'src/panel.tsx':
              'export function Panel(props: { size: number }): React.ReactElement {\n  props.size = 2;\n\n  return <div />;\n}\n',
          },
          rule: 'noReactPropAssignments',
        },
        {
          condition: 'the viewport blocks zooming',
          files: {
            'src/panel.tsx': component(
              "<meta content='width=device-width, user-scalable=no' name='viewport' />",
            ),
          },
          rule: 'noNonScalableViewport',
        },
        {
          condition: 'an image declares no size',
          files: {
            'src/panel.tsx': component("<img alt='Logo' src='/logo.svg' />"),
          },
          rule: 'useImageSize',
        },
        {
          condition: 'a class carries an arbitrary value',
          files: {
            'src/panel.tsx': component("<div className='p-[13px]' />"),
          },
          rule: 'noTailwindArbitraryValue',
        },
        {
          condition: 'a ref is forwarded the legacy way',
          files: {
            'src/panel.tsx':
              "import { forwardRef } from 'react';\n\nexport const Field = forwardRef<HTMLInputElement>((props, ref) => <input ref={ref} {...props} />);\n",
          },
          rule: 'noReactForwardRef',
        },
        {
          condition: 'a hook factory makes a component',
          files: {
            'src/panel.tsx':
              'export function makeBadge() {\n  return function Badge(): null {\n    return null;\n  };\n}\n',
          },
          rule: 'noComponentHookFactories',
        },
        {
          condition: 'a component is defined inside a component',
          files: {
            'src/panel.tsx':
              'export function Panel(): React.ReactElement {\n  function Title(): React.ReactElement {\n    return <h2>Orders</h2>;\n  }\n\n  return <Title />;\n}\n',
          },
          rule: 'noNestedComponentDefinitions',
        },
        {
          condition: 'a button has no label',
          files: {
            'src/panel.tsx': component("<button type='button' />"),
          },
          rule: 'useControlLabel',
        },
      ],
      {
        files: {
          'package.json': manifest,
        },
        parts: webParts,
      },
    ),
  )('should report $rule when $condition', ({ files, parts, rule }) => {
    // Arrange
    const project = {
      files,
      parts,
    };

    // Act
    const { rules } = lintFindings(project);

    // Assert
    expect(rules).toContain(rule);
  });

  it.each(
    lintCases(
      [
        {
          condition: 'a list item takes a click handler',
          files: {
            'src/panel.tsx': component('<li onClick={() => undefined}>item</li>'),
          },
          parts: [
            ...baseParts,
            'typescript/react-dom',
          ],
          rule: 'noNoninteractiveElementInteractions',
        },
        {
          condition: 'a hook is called inside a condition in a .ts file',
          files: {
            'package.json': JSON.stringify({
              name: 'fixture',
            }),
            'src/order.hooks.ts':
              "import { useState } from 'react';\n\nexport function useOrder(open: boolean): number {\n  if (open) {\n    const [count] = useState(0);\n    return count;\n  }\n  return 0;\n}\n",
          },
          parts: [
            ...baseParts,
            'typescript/_react',
          ],
          rule: 'useHookAtTopLevel',
        },
        {
          condition: 'a React Native style holds a literal colour',
          files: {
            'package.json': JSON.stringify({
              name: 'fixture',
              dependencies: {
                react: '19.2.0',
                'react-native': '0.81.0',
              },
            }),
            'src/panel.tsx':
              "import { View } from 'react-native';\n\nexport function Panel(): React.ReactElement {\n  return <View style={{ backgroundColor: 'red' }} />;\n}\n",
          },
          parts: [
            ...baseParts,
            'typescript/_react',
            'typescript/react-native',
          ],
          rule: 'noReactNativeLiteralColors',
        },
        {
          condition: 'a component file is in PascalCase',
          files: {
            'src/Panel.tsx': component('<div />'),
          },
          parts: [
            ...baseParts,
            'typescript/_react',
          ],
          rule: 'useFilenamingConvention',
        },
      ],
      {
        files: {
          'package.json': manifest,
        },
      },
    ),
  )(
    'should report $rule when $condition and a project extends $parts',
    ({ files, parts, rule }) => {
      // Arrange
      const project = {
        files,
        parts,
      };

      // Act
      const { rules } = lintFindings(project);

      // Assert
      expect(rules).toContain(rule);
    },
  );

  it.each(
    lintCases(
      [
        {
          condition: 'a cascade layer has no name',
          files: {
            'src/styles.css': '@layer {\n  a {\n    color: red;\n  }\n}\n',
          },
          rule: 'useNamedLayer',
        },
        {
          condition: 'a list item takes a click handler',
          files: {
            'src/panel.tsx': component('<li onClick={() => undefined}>item</li>'),
          },
          rule: 'noNoninteractiveElementInteractions',
        },
        {
          condition: 'a class carries an arbitrary value',
          files: {
            'src/panel.tsx': component("<div className='p-[13px]' />"),
          },
          rule: 'noTailwindArbitraryValue',
        },
      ],
      {
        files: {
          'package.json': manifest,
        },
        parts: baseParts,
      },
    ),
  )(
    'should not report $rule when $condition and a project extends only the self, core and typescript parts of the base',
    ({ files, parts, rule }) => {
      // Arrange
      const project = {
        files,
        parts,
      };

      // Act
      const { rules } = lintFindings(project);

      // Assert
      expect(rules).not.toContain(rule);
    },
  );

  it.each(
    lintCases(
      [
        {
          condition: 'a context is read with useContext',
          files: {
            'src/panel.tsx':
              "import { createContext, useContext } from 'react';\n\nconst ThemeContext = createContext('light');\n\nexport function Panel(): string {\n  return useContext(ThemeContext);\n}\n",
          },
          plugin: 'modern-react-api-only',
        },
        {
          condition: 'a context is provided through Context.Provider',
          files: {
            'src/panel.tsx':
              "import { createContext } from 'react';\n\nconst ThemeContext = createContext('light');\n\nexport function Panel(): React.ReactElement {\n  return <ThemeContext.Provider value='dark' />;\n}\n",
          },
          plugin: 'modern-react-api-only',
        },
        {
          condition: 'a component takes defaultProps',
          files: {
            'src/panel.tsx': `${component('<div />')}\nPanel.defaultProps = {};\n`,
          },
          plugin: 'modern-react-api-only',
        },
        {
          condition: 'a ref is made with createRef',
          files: {
            'src/panel.ts':
              "import { createRef } from 'react';\n\nexport const panelRef = createRef<HTMLDivElement>();\n",
          },
          plugin: 'modern-react-api-only',
        },
        {
          condition: 'an id is random',
          files: {
            'src/panel.tsx': component('<input id={crypto.randomUUID()} />'),
          },
          plugin: 'labels-bound-with-use-id',
        },
        {
          condition: 'an email field declares no autocomplete',
          files: {
            'src/panel.tsx': component("<input aria-label='Email' type='email' />"),
          },
          plugin: 'field-declares-its-autocomplete',
        },
        {
          condition: 'a spec finds an element by its test id',
          files: {
            'src/__tests__/panel.test.tsx':
              "import { screen } from '@testing-library/react';\n\nexport const panel = (): HTMLElement => screen.getByTestId('panel');\n",
          },
          plugin: 'queries-by-role-label-text',
        },
        {
          condition: 'a spec finds an element by a selector',
          files: {
            'src/__tests__/panel.test.tsx':
              "export const panel = (container: HTMLElement): Element | null =>\n  container.querySelector('.panel');\n",
          },
          plugin: 'queries-by-role-label-text',
        },
        {
          condition: 'a class list sizes with h-screen',
          files: {
            'src/panel.tsx': component("<main className='min-h-screen' />"),
          },
          plugin: 'screen-sized-classes-never-used',
        },
        {
          condition: 'a variant map sizes with h-screen',
          files: {
            'src/panel.variants.ts':
              "import { cva } from 'class-variance-authority';\n\nexport const panelVariants = cva('flex h-screen');\n",
          },
          plugin: 'screen-sized-classes-never-used',
        },
        {
          condition: 'a class list sets a physical margin',
          files: {
            'src/panel.tsx': component("<div className='ml-4' />"),
          },
          plugin: 'logical-utilities-for-direction',
        },
        {
          condition: 'a class list aligns text to the left',
          files: {
            'src/panel.tsx': component("<div className='md:text-left' />"),
          },
          plugin: 'logical-utilities-for-direction',
        },
        {
          condition: 'a class list marks a utility important after it',
          files: {
            'src/panel.tsx': component("<div className='px-0! text-sm' />"),
          },
          plugin: 'important-modifier-never-in-a-class-list',
        },
        {
          condition: 'a class list marks a utility important before it',
          files: {
            'src/panel.tsx': component("<div className='!px-0 text-sm' />"),
          },
          plugin: 'important-modifier-never-in-a-class-list',
        },
        {
          condition: 'a class list removes the outline',
          files: {
            'src/panel.tsx': component("<button className='outline-none' />"),
          },
          plugin: 'focus-shown-by-focusable-utility',
        },
        {
          condition: 'a class list sizes with w-screen',
          files: {
            'src/panel.tsx': component("<main className='w-screen' />"),
          },
          plugin: 'screen-sized-classes-never-used',
        },
        {
          condition: 'an inline style comes from a variable',
          files: {
            'src/panel.tsx':
              "const look = { color: 'red' };\n\nexport function Panel(): React.ReactElement {\n  return <div style={look} />;\n}\n",
          },
          plugin: 'inline-style-only-custom-properties-and-geometry',
        },
        {
          condition: 'an inline style spreads another object',
          files: {
            'src/panel.tsx': component("<div style={{ ...{ color: 'red' } }} />"),
          },
          plugin: 'inline-style-only-custom-properties-and-geometry',
        },
        {
          condition: 'an inline style uses a shorthand property',
          files: {
            'src/panel.tsx':
              'export function Panel({ top }: { top: number }): React.ReactElement {\n  return <div style={{ top }} />;\n}\n',
          },
          plugin: 'inline-style-only-custom-properties-and-geometry',
        },
        {
          condition: 'an element takes an inline visual value',
          files: {
            'src/panel.tsx': component("<div style={{ color: 'red' }} />"),
          },
          plugin: 'inline-style-only-custom-properties-and-geometry',
        },
        {
          condition: 'a class list narrows with a max-* breakpoint',
          files: {
            'src/panel.tsx': component("<main className='flex max-md:hidden' />"),
          },
          plugin: 'mobile-first-breakpoints',
        },
        {
          condition: 'a variant map narrows with a max-* breakpoint',
          files: {
            'src/panel.variants.ts':
              "import { cva } from 'class-variance-authority';\n\nexport const panelVariants = cva('flex max-md:hidden');\n",
          },
          plugin: 'mobile-first-breakpoints',
        },
      ],
      {
        files: {
          'package.json': manifest,
        },
        parts: webParts,
      },
    ),
  )('should report a plugin finding when $condition', ({ files, parts, plugin }) => {
    // Arrange
    const project = {
      files,
      parts,
    };

    // Act
    const { plugins } = lintFindings(project);

    // Assert
    expect(plugins).toContain(plugin);
  });

  it.each(
    lintCases(
      [
        {
          condition: 'a field declares its autocomplete',
          files: {
            'src/panel.tsx': component(
              "<input aria-label='Email' autoComplete='email' type='email' />",
            ),
          },
        },
        {
          condition: 'a class list sizes to the dynamic viewport',
          files: {
            'src/panel.tsx': component("<main className='h-dvh' />"),
          },
        },
        {
          condition: 'a component renders nothing',
          files: {
            'src/panel.tsx': 'export function Panel(): React.ReactNode {\n  return null;\n}\n',
          },
        },
        {
          condition: 'an inline style sets only a custom property',
          files: {
            'src/panel.tsx': component("<div style={{ '--progress': '50%' }} />"),
          },
        },
        {
          condition: 'a max-* breakpoint bounds a range after a minimum',
          files: {
            'src/panel.tsx': component("<main className='md:max-lg:hidden' />"),
          },
        },
        {
          condition: 'a class list uses logical sides',
          files: {
            'src/panel.tsx': component("<div className='ms-4 text-start items-center' />"),
          },
        },
        {
          condition: 'a class list widens from the small screen',
          files: {
            'src/panel.tsx': component("<main className='max-w-md md:flex' />"),
          },
        },
        {
          condition: 'a spec finds an element by its role',
          files: {
            'src/__tests__/panel.test.tsx':
              "import { screen } from '@testing-library/react';\n\nexport const panel = (): HTMLElement => screen.getByRole('region');\n",
          },
        },
      ],
      {
        files: {
          'package.json': manifest,
        },
        parts: webParts,
      },
    ),
  )('should report no plugin finding when $condition', ({ files, parts }) => {
    // Arrange
    const project = {
      files,
      parts,
    };

    // Act
    const { plugins } = lintFindings(project);

    // Assert
    expect(plugins).toStrictEqual([]);
  });

  const effectOutsideReactManifest = lintCase({
    files: {
      'package.json': JSON.stringify({
        name: 'fixture',
      }),
      'src/room.hooks.ts': ROOM_HOOK.replace(
        'useEffectEvent((): void => {',
        '((): void => {',
      ).replace(', useEffectEvent', ''),
    },
    parts: webParts,
  });

  it('should report a missing dependency when an effect calls a plain function in a hooks file of a project whose manifest names no React', () => {
    // Arrange
    const project = effectOutsideReactManifest;

    // Act
    const { rules } = lintFindings(project);

    // Assert
    expect(rules).toContain('useExhaustiveDependencies');
  });
});

const RANDOM_ID =
  'export const orderId = (): string => crypto.randomUUID();\nexport const placedAt = (): number => Date.now();\n';
const FOUR_DEPENDENCIES =
  'export class Orders {\n  public constructor(\n    private readonly clock: Date,\n    private readonly region: string,\n    private readonly limit: number,\n    private readonly label: string,\n  ) {}\n}\n';
const CLOCK_ONLY_IN_THE_CONSTRUCTOR =
  "import { Clock } from './clock';\n\nexport class Orders {\n  public constructor(private readonly clock: Clock) {}\n}\n";
const TIMER = 'export const later = (run: () => void): void => {\n  setTimeout(run, 10);\n};\n';

describe('the Biome architecture parts', () => {
  it.each(
    lintCases(
      [
        {
          file: 'src/features/orders/app/use-cases/place-order.use-case.ts',
          files: {
            'src/features/orders/app/use-cases/place-order.use-case.ts':
              'export const placedAt = (): number => performance.now();\n',
          },
          isReported: true,
        },
        {
          file: 'src/kernel/values/money.ts',
          files: {
            'src/kernel/values/money.ts':
              "export const load = (): Promise<Response> => fetch('/orders');\n",
          },
          isReported: true,
        },
        {
          file: 'src/adapters/clock/clock.adapter.ts',
          files: {
            'src/adapters/clock/clock.adapter.ts':
              'export const placedAt = (): number => performance.now();\n',
          },
          isReported: false,
        },
        {
          file: 'src/features/orders/ui/widgets/orders-widget/orders-widget.ts',
          files: {
            'src/features/orders/ui/widgets/orders-widget/orders-widget.ts':
              "export const load = (): Promise<Response> => fetch('/orders');\n",
          },
          isReported: true,
        },
        {
          file: 'src/kernel/contracts/mail.port.ts',
          files: {
            'src/kernel/contracts/mail.port.ts':
              "export const load = (): Promise<Response> => fetch('/mail');\n",
          },
          isReported: true,
        },
        {
          file: 'src/composition/checkout/adapters/payments/payments.adapter.ts',
          files: {
            'src/composition/checkout/adapters/payments/payments.adapter.ts':
              "export const load = (): Promise<Response> => fetch('/payments');\n",
          },
          isReported: false,
        },
        {
          file: 'apps/web/src/features/orders/domain/entities/order.entity.ts',
          files: {
            'apps/web/src/features/orders/domain/entities/order.entity.ts':
              "export const load = (): Promise<Response> => fetch('/orders');\n",
          },
          isReported: true,
        },
        {
          file: 'shared/messages/src/adapters/http/http.adapter.ts',
          files: {
            'shared/messages/src/adapters/http/http.adapter.ts':
              "export const load = (): Promise<Response> => fetch('/messages');\n",
          },
          isReported: false,
        },
        {
          file: 'src/client.ts',
          files: {
            'src/client.ts':
              "export const mount = (): HTMLElement | null => document.getElementById('app');\n",
          },
          isReported: false,
        },
      ],
      {
        parts: [
          ...baseParts,
          'typescript/architecture/core',
        ],
      },
    ),
  )(
    'should report an effect reached through a global $isReported in $file when a project extends the core part',
    ({ files, isReported, parts }) => {
      // Arrange
      const project = {
        files,
        parts,
      };

      // Act
      const { rules } = lintFindings(project);

      // Assert
      expect(rules.includes('noRestrictedGlobals')).toBe(isReported);
    },
  );

  it.each(
    lintCases(
      [
        {
          file: 'src/features/orders/domain/entities/order.entity.ts',
          files: {
            'src/features/orders/domain/entities/order.entity.ts': RANDOM_ID,
          },
          isReported: true,
        },
        {
          file: 'src/adapters/ids/ids.adapter.ts',
          files: {
            'src/adapters/ids/ids.adapter.ts': RANDOM_ID,
          },
          isReported: false,
        },
      ],
      {
        parts: [
          ...baseParts,
          'typescript/architecture/typescript',
          'typescript/architecture/core',
        ],
      },
    ),
  )(
    'should report a random value drawn $isReported in $file when a project extends the core part',
    ({ files, isReported, parts }) => {
      // Arrange
      const project = {
        files,
        parts,
      };

      // Act
      const { plugins } = lintFindings(project);

      // Assert
      expect(plugins.includes('effects-held-only-by-the-edge')).toBe(isReported);
    },
  );

  it.each(
    lintCases(
      [
        {
          file: 'src/features/orders/domain/entities/order.entity.ts',
          files: {
            'src/features/orders/domain/entities/order.entity.ts': TIMER,
          },
          isReported: true,
        },
        {
          file: 'src/features/orders/app/use-cases/poll-orders.use-case.ts',
          files: {
            'src/features/orders/app/use-cases/poll-orders.use-case.ts': TIMER,
          },
          isReported: false,
        },
        {
          file: 'src/composition/checkout/app/use-cases/queries/cart/cart.hooks.ts',
          files: {
            'src/composition/checkout/app/use-cases/queries/cart/cart.hooks.ts': TIMER,
          },
          isReported: false,
        },
        {
          file: 'src/features/orders/ui/widgets/orders-widget/orders-widget.ts',
          files: {
            'src/features/orders/ui/widgets/orders-widget/orders-widget.ts': TIMER,
          },
          isReported: true,
        },
      ],
      {
        parts: [
          ...baseParts,
          'typescript/architecture/typescript',
        ],
      },
    ),
  )(
    'should report a timer $isReported in $file when a project extends the typescript part',
    ({ files, isReported, parts }) => {
      // Arrange
      const project = {
        files,
        parts,
      };

      // Act
      const { plugins } = lintFindings(project);

      // Assert
      expect(plugins.includes('timer-set-only-by-the-edge-and-binding-units')).toBe(isReported);
    },
  );

  it.each(
    lintCases([
      {
        condition: 'a surface re-exports everything',
        files: {
          'src/features/orders/index.ts': "export * from './app';\n",
        },
        parts: [
          ...baseParts,
          'typescript/architecture/core',
        ],
        rule: 'noReExportAll',
      },
    ]),
  )(
    'should report $rule when $condition and a project extends $parts',
    ({ files, parts, rule }) => {
      // Arrange
      const project = {
        files,
        parts,
      };

      // Act
      const { rules } = lintFindings(project);

      // Assert
      expect(rules).toContain(rule);
    },
  );

  it.each(
    lintCases(
      [
        {
          isReported: false,
          parts: [
            ...baseParts,
            'typescript/architecture/core',
          ],
        },
        {
          isReported: true,
          parts: [
            ...baseParts,
            'typescript/architecture/typescript',
          ],
        },
      ],
      {
        files: {
          'src/features/orders/index.ts': "export const ORDERS = 'orders';\n",
        },
      },
    ),
  )(
    'should report a declaring surface $isReported when a project extends $parts',
    ({ files, isReported, parts }) => {
      // Arrange
      const project = {
        files,
        parts,
      };

      // Act
      const { plugins } = lintFindings(project);

      // Assert
      expect(plugins.includes('surface-only-re-exports')).toBe(isReported);
    },
  );

  it.each(
    lintCases(
      [
        {
          isReported: true,
          parts: baseParts,
        },
        {
          isReported: false,
          parts: [
            ...baseParts,
            'typescript/nestjs',
          ],
        },
      ],
      {
        files: {
          'src/orders.service.ts':
            'export class OrdersService {\n  public constructor(private readonly clock: Date) {}\n}\n',
        },
      },
    ),
  )(
    'should report noParameterProperties $isReported when a provider takes its dependencies through its constructor and a project extends $parts',
    ({ files, isReported, parts }) => {
      // Arrange
      const project = {
        files,
        parts,
      };

      // Act
      const { rules } = lintFindings(project);

      // Assert
      expect(rules.includes('noParameterProperties')).toBe(isReported);
    },
  );

  it.each(
    lintCases([
      {
        isReported: true,
        parts: baseParts,
        path: 'src/orders.controller.ts',
        files: {
          'src/orders.controller.ts': FOUR_DEPENDENCIES,
        },
      },
      {
        isReported: false,
        parts: [
          ...baseParts,
          'typescript/nestjs',
        ],
        path: 'src/orders.controller.ts',
        files: {
          'src/orders.controller.ts': FOUR_DEPENDENCIES,
        },
      },
      {
        isReported: false,
        parts: [
          ...baseParts,
          'typescript/nestjs',
          'typescript/architecture/nestjs',
        ],
        path: 'src/place-order.use-case.ts',
        files: {
          'src/place-order.use-case.ts': FOUR_DEPENDENCIES,
        },
      },
      {
        isReported: true,
        parts: [
          ...baseParts,
          'typescript/nestjs',
          'typescript/architecture/nestjs',
        ],
        path: 'src/orders.ts',
        files: {
          'src/orders.ts': FOUR_DEPENDENCIES,
        },
      },
    ]),
  )(
    'should report useMaxParams $isReported when $path holds a constructor of four dependencies and a project extends $parts',
    ({ files, isReported, parts }) => {
      // Arrange
      const project = {
        files,
        parts,
      };

      // Act
      const { rules } = lintFindings(project);

      // Assert
      expect(rules.includes('useMaxParams')).toBe(isReported);
    },
  );

  it.each(
    lintCases(
      [
        {
          isReported: false,
          parts: [
            ...baseParts,
            'typescript/nestjs',
          ],
          path: 'src/orders.controller.ts',
          files: {
            'src/orders.controller.ts': CLOCK_ONLY_IN_THE_CONSTRUCTOR,
          },
        },
        {
          isReported: false,
          parts: [
            ...baseParts,
            'typescript/nestjs',
            'typescript/architecture/nestjs',
          ],
          path: 'src/orders.adapter.ts',
          files: {
            'src/orders.adapter.ts': CLOCK_ONLY_IN_THE_CONSTRUCTOR,
          },
        },
        {
          isReported: true,
          parts: [
            ...baseParts,
            'typescript/nestjs',
            'typescript/architecture/nestjs',
          ],
          path: 'src/place-order.use-case.ts',
          files: {
            'src/place-order.use-case.ts': CLOCK_ONLY_IN_THE_CONSTRUCTOR,
          },
        },
      ],
      {
        files: {
          'src/clock.ts': 'export class Clock {}\n',
        },
      },
    ),
  )(
    'should report useImportType $isReported when $path imports a class only its constructor names and a project extends $parts',
    ({ files, isReported, parts }) => {
      // Arrange
      const project = {
        files,
        parts,
      };

      // Act
      const { rules } = lintFindings(project);

      // Assert
      expect(rules.includes('useImportType')).toBe(isReported);
    },
  );
});

describe('the Biome base where a rule allows what a setting caught', () => {
  it.each(
    lintCases(
      [
        {
          condition: 'a file of end-to-end specs in a package of a workspace runs past 500 lines',
          files: {
            'apps/web/tests/e2e/long.ts': fileOfLines(505),
          },
          rule: 'noExcessiveLinesPerFile',
        },
        {
          condition: "a declaration file merges into the runtime's names",
          files: {
            'src/env.d.ts':
              '// biome-ignore lint/style/noNamespace: the runtime declares its environment in this namespace\ndeclare global {\n  namespace NodeJS {\n    interface ProcessEnv {\n      PORT?: string;\n    }\n  }\n}\n\nexport {};\n',
          },
          rule: 'useNamingConvention',
        },
        {
          condition: 'the router names a route by its parameter',
          files: {
            'src/root/routes/$orderId.tsx': 'export const orderId = 1;\n',
            'src/root/routeTree.gen.ts': 'export const routeTree = 1;\n',
          },
          rule: 'useFilenamingConvention',
        },
      ],
      {
        parts: [
          ...baseParts,
          'typescript/tanstack-router',
        ],
      },
    ),
  )('should report no $rule when $condition', ({ files, parts, rule }) => {
    // Arrange
    const project = {
      files,
      parts,
    };

    // Act
    const { rules } = lintFindings(project);

    // Assert
    expect(rules).not.toContain(rule);
  });
});
