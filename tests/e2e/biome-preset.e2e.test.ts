import { describe, expect, it } from 'bun:test';

import {
  blockCode,
  FOUNDATION_PARTS,
  lintFindings,
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

const TEST_PARTS = [
  ...FOUNDATION_PARTS,
  'typescript/foundation/bun-test',
];

// Biome turns on the React and Tailwind rules only for a manifest that lists
// their libraries.
const MANIFEST = JSON.stringify({
  name: 'fixture',
  dependencies: {
    react: '19.2.0',
    tailwindcss: '4.2.0',
  },
});

const WEB_PARTS = [
  ...FOUNDATION_PARTS,
  'typescript/foundation/_react',
  'typescript/foundation/react-dom',
  'typescript/foundation/browser',
  'typescript/foundation/tailwind',
  'typescript/foundation/testing-library',
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

const component = (markup: string): string =>
  `export function Panel(): React.ReactElement {\n  return (\n    ${markup}\n  );\n}\n`;

describe('the Biome preset', () => {
  it.each([
    {
      condition: 'null is assigned outside an adapter',
      files: {
        'src/features/orders/domain/order.ts':
          'export const cancelledAt: Date | undefined = null;\n',
      },
      message: 'null outside the boundary',
    },
    {
      condition: 'a surface declares a value',
      files: {
        'src/features/orders/index.ts':
          "export { cancelOrder } from './app';\nexport const ORDERS = 'orders';\n",
      },
      message: 'A surface only re-exports by name',
    },
    {
      condition: 'a variable is named by an empty word',
      files: {
        'src/features/orders/order.ts': 'export const data = 1;\n',
      },
      message: 'Name what it holds',
    },
    {
      condition: 'a parameter is named by an empty word',
      files: {
        'src/features/orders/order.ts':
          'export const doubled = (data: number): number => data * 2;\n',
      },
      message: 'Name what it holds',
    },
    {
      condition: 'a destructured field keeps an empty name',
      files: {
        'src/features/orders/order.ts':
          'export const doubled = ({ value }: { value: number }): number => value * 2;\n',
      },
      message: 'Name what it holds',
    },
    {
      condition: 'a case does not read should … when …',
      files: {
        'src/__tests__/order.test.ts':
          "import { expect, test } from 'bun:test';\n\ntest('adds totals', () => {\n  expect(1).toBe(1);\n});\n",
      },
      message: "A case reads 'should <behaviour> when <condition>'",
    },
    {
      condition: 'a spec replaces a module',
      files: {
        'src/__tests__/order.test.ts':
          "import { mock } from 'bun:test';\n\nmock.module('./order', () => ({}));\n",
      },
      message: 'Fake an effect through its port',
    },
    {
      condition: 'a spec spies on a module',
      files: {
        'src/__tests__/order.test.ts':
          "import { spyOn } from 'bun:test';\n\nimport * as orders from '../orders';\n\nspyOn(orders, 'load');\n",
      },
      message: 'Fake an effect through its port',
    },
    {
      condition: 'a component memoises a value by hand',
      files: {
        'src/Panel.tsx':
          "import { useMemo } from 'react';\n\nexport function Panel({ label }: { label: string }): string {\n  return useMemo(() => label.trim(), [label]);\n}\n",
      },
      message: 'Leave memoisation to the React Compiler',
    },
    {
      condition: 'a component is wrapped in React.memo',
      files: {
        'src/Panel.tsx':
          "import React from 'react';\n\nexport const Panel = React.memo(function Panel(): null {\n  return null;\n});\n",
      },
      message: 'Leave memoisation to the React Compiler',
    },
    {
      condition: 'a component calls an effect',
      files: {
        'src/Panel.tsx':
          "import { useEffect } from 'react';\n\nexport function Panel(): null {\n  useEffect(() => {\n    globalThis.focus();\n  }, []);\n  return null;\n}\n",
      },
      message: 'Call an effect from a hook',
    },
    {
      condition: 'a type is taken from an as-const array',
      files: {
        'src/features/orders/domain/order-status.ts':
          "const STATUSES = ['open', 'closed'] as const;\n\nexport type OrderStatus = (typeof STATUSES)[number];\n",
      },
      message:
        'A closed set of named values is a string enum, not a type taken from an as-const array',
    },
    {
      condition: 'a type is taken from the values of an as-const object',
      files: {
        'src/features/orders/domain/order-status.ts':
          "const STATUS = { Open: 'open', Closed: 'closed' } as const;\n\nexport type OrderStatus = (typeof STATUS)[keyof typeof STATUS];\n",
      },
      message:
        'A closed set of named values is a string enum, not a type taken from an as-const array',
    },
    {
      condition: 'a type is a union of string literals',
      files: {
        'src/features/orders/domain/order-status.ts':
          "export type OrderStatus = 'open' | 'closed';\n",
      },
      message:
        'A closed set of named values is a string enum, not a union of string literals',
    },
  ])('should report a plugin finding when $condition', ({ files, message }) => {
    // Arrange
    const project = {
      files,
    };

    // Act
    const { plugins } = lintFindings(project);

    // Assert
    expect(plugins.some((finding) => finding.startsWith(message))).toBe(true);
  });

  it.each([
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
          "import { useEffect } from 'react';\n\nexport function Panel(): string {\n  useEffect(() => {\n    globalThis.focus();\n  }, []);\n  return 'panel';\n}\n",
      },
    },
  ])(
    'should report no plugin finding when $condition and a project extends only foundation self, core and typescript and architecture core',
    ({ files }) => {
      // Arrange
      const project = {
        files,
        parts: [
          ...FOUNDATION_PARTS,
          'typescript/architecture/core',
        ],
      };

      // Act
      const { plugins } = lintFindings(project);

      // Assert
      expect(plugins).toStrictEqual([]);
    },
  );

  it.each([
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
          'export const firstOf = (items: readonly string[]): string | undefined => {\n  const value = items.at(0);\n  return value;\n};\n',
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
      condition: 'a callback takes the index an array method passes',
      files: {
        'src/main.ts':
          "export const numbered = ['a'].map((line, index) => `${String(index)}${line}`);\n",
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
        'src/features/orders/domain/limit.ts':
          "export type Limit = 'none' | number;\n",
      },
    },
    {
      condition: 'an object type has a string literal property',
      files: {
        'src/features/orders/domain/opened.ts':
          "export interface Opened {\n  status: 'open';\n}\n",
      },
    },
  ])('should report no plugin finding when $condition', ({ files }) => {
    // Arrange
    const project = {
      files,
    };

    // Act
    const { plugins } = lintFindings(project);

    // Assert
    expect(plugins).toStrictEqual([]);
  });

  it('should report a plugin finding when an adapter maps null from the wire and a project extends only foundation self, core and typescript', () => {
    // Arrange
    const project = {
      files: {
        'src/features/orders/adapters/api/order.adapter.ts':
          'export const toCancelledAt = (raw: string | null): string | undefined =>\n  raw === null ? undefined : raw;\n',
      },
      parts: FOUNDATION_PARTS,
    };

    // Act
    const { plugins } = lintFindings(project);

    // Assert
    expect(
      plugins.some((finding) =>
        finding.startsWith('null outside the boundary'),
      ),
    ).toBe(true);
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

describe('the Biome foundation parts', () => {
  it('should leave .constitution alone when a project lints its whole tree', () => {
    // Arrange
    const project = {
      files: {
        '.constitution/probe.ts': 'export const data = null;\n',
        'src/order.ts': "export const orderKind = 'order';\n",
      },
      parts: FOUNDATION_PARTS,
    };

    // Act
    const { plugins, rules } = lintFindings(project);

    // Assert
    expect([
      ...plugins,
      ...rules,
    ]).toStrictEqual([]);
  });

  it.each([
    ...presetFiles(),
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

  it.each([
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
        'src/main.ts':
          'export const settle = (): undefined => {\n  return undefined;\n};\n',
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
        'src/main.ts':
          "export const warn = (): void => {\n  alert('saved');\n};\n",
      },
      rule: 'noAlert',
    },
    {
      condition: 'the code stops in the debugger',
      files: {
        'src/main.ts': 'export const trace = (): void => {\n  debugger;\n};\n',
      },
      rule: 'noDebugger',
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
      condition: 'a type error is ignored',
      files: {
        'src/main.ts':
          "// @ts-ignore: legacy\nexport const total: number = 'one';\n",
      },
      rule: 'noTsIgnore',
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
  ])('should report $rule when $condition', ({ files, rule }) => {
    // Arrange
    const project = {
      files,
      parts: TEST_PARTS,
    };

    // Act
    const { rules } = lintFindings(project);

    // Assert
    expect(rules).toContain(rule);
  });

  it('should report no plugin finding when a case configures a client that retries nothing', () => {
    // Arrange
    const project = {
      files: {
        'src/__tests__/order.test.ts':
          "import { expect, test } from 'bun:test';\n\ntest('should load orders when the cache is fresh', () => {\n  const options = { queries: { retry: false } };\n\n  expect(options).toStrictEqual({ queries: { retry: false } });\n});\n",
      },
      parts: TEST_PARTS,
    };

    // Act
    const { plugins } = lintFindings(project);

    // Assert
    expect(plugins).toStrictEqual([]);
  });

  it('should report no cast when a value read from outside is narrowed by plain checks or held as a constant', () => {
    // Arrange
    const project = {
      files: {
        'src/main.ts':
          "const STATUSES = ['open', 'closed'] as const;\n\nexport const statusOf = (text: string): (typeof STATUSES)[number] | undefined => {\n  const value: unknown = JSON.parse(text);\n\n  return STATUSES.find((status) => status === value);\n};\n",
      },
    };

    // Act
    const { rules } = lintFindings(project);

    // Assert
    expect(rules).not.toContain('noUnsafeTypeAssertion');
  });

  it.each([
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
  ])('should not report $rule when $condition', ({ files, rule }) => {
    // Arrange
    const project = {
      files,
      parts: TEST_PARTS,
    };

    // Act
    const { rules } = lintFindings(project);

    // Assert
    expect(rules).not.toContain(rule);
  });

  it.each([
    {
      condition: 'a function is named by an empty verb',
      files: {
        'src/features/orders/order.ts':
          'export const process = (): number => 1;\n',
      },
      message: 'Name what the function does',
    },
    {
      condition: 'a method is named by an empty verb',
      files: {
        'src/features/orders/order.ts':
          'export const orders = {\n  handle(): number {\n    return 1;\n  },\n};\n',
      },
      message: 'Name what the function does',
    },
    {
      condition: 'a spec leaves a case to do',
      files: {
        'src/order.test.ts':
          "import { test } from 'bun:test';\n\ntest.todo('adds totals');\n",
      },
      message: 'Write the case so it runs every time',
    },
    {
      condition: 'a spec runs a case only under a condition',
      files: {
        'src/order.test.ts':
          "import { expect, test } from 'bun:test';\n\ntest.skipIf(process.platform === 'win32')('should add totals', () => {\n  expect(1).toBe(1);\n});\n",
      },
      message: 'Write the case so it runs every time',
    },
    {
      condition: 'a spec expects a case to fail',
      files: {
        'src/order.test.ts':
          "import { expect, test } from 'bun:test';\n\ntest.failing('should add totals', () => {\n  expect(1).toBe(2);\n});\n",
      },
      message: 'Write the case so it runs every time',
    },
    {
      condition: 'a type alias carries the Type suffix',
      files: {
        'src/features/orders/order.ts':
          'export type OrderType = {\n  id: string;\n};\n',
      },
      message: 'A type is a noun, undecorated',
    },
    {
      condition: 'an interface carries the I prefix',
      files: {
        'src/features/orders/order.ts':
          'export interface IOrder {\n  id: string;\n}\n',
      },
      message: 'A type is a noun, undecorated',
    },
    {
      condition: 'a module exports a binding it can reassign',
      files: {
        'src/session.ts': 'export let current = 0;\n',
      },
      message: 'Export a const',
    },
    {
      condition: 'a spec compares with toEqual',
      files: {
        'src/order.test.ts':
          "import { expect, test } from 'bun:test';\n\ntest('adds totals', () => {\n  expect(1).toEqual(1);\n});\n",
      },
      message: 'Compare with toStrictEqual',
    },
    {
      condition: 'a case is retried',
      files: {
        'src/order.test.ts':
          "import { expect, it, test } from 'bun:test';\n\ntest('should add totals when both are set', () => {\n  expect(1).toBe(1);\n}, { retry: 3 });\n",
      },
      message: 'Fix or delete a flaky case',
    },
    {
      condition: 'a table of cases is repeated',
      files: {
        'src/order.test.ts':
          "import { expect, it, test } from 'bun:test';\n\nit.each([1])('should keep %p when given', (value) => {\n  expect(value).toBe(1);\n}, { timeout: 100, repeats: 5 });\n",
      },
      message: 'Fix or delete a flaky case',
    },
    {
      condition: 'a spec sleeps through Bun',
      files: {
        'src/order.test.ts':
          "import { expect, it, test } from 'bun:test';\n\ntest('should save when the user stops typing', async () => {\n  await Bun.sleep(50);\n  expect(1).toBe(1);\n});\n",
      },
      message: 'Wait for a condition or advance a fake clock',
    },
    {
      condition: 'a spec sleeps through a timer',
      files: {
        'src/order.test.ts':
          "import { expect, it, test } from 'bun:test';\n\ntest('should save when the user stops typing', async () => {\n  await new Promise((resolve) => setTimeout(resolve, 50));\n  expect(1).toBe(1);\n});\n",
      },
      message: 'Wait for a condition or advance a fake clock',
    },
    {
      condition: 'a spec sleeps through a timer inside a block',
      files: {
        'src/order.test.ts':
          "import { expect, test } from 'bun:test';\n\ntest('should save when the user stops typing', async () => {\n  await new Promise((resolve) => {\n    setTimeout(resolve, 50);\n  });\n  expect(1).toBe(1);\n});\n",
      },
      message: 'Wait for a condition or advance a fake clock',
    },
    {
      condition: 'a spec imports the promised timer',
      files: {
        'src/order.test.ts':
          "import { setTimeout as wait } from 'node:timers/promises';\n\nexport const pause = wait;\n",
      },
      message: 'Wait for a condition or advance a fake clock',
    },
    {
      condition: 'a case branches',
      files: {
        'src/order.test.ts':
          "import { expect, it, test } from 'bun:test';\n\ntest('should add totals when both are set', () => {\n  if (Date.now() > 0) {\n    expect(1).toBe(1);\n  }\n});\n",
      },
      message: 'Keep logic out of a case',
    },
    {
      condition: 'a row of a table computes its expectation',
      files: {
        'src/order.test.ts':
          "import { expect, it, test } from 'bun:test';\n\nit.each([1])('should double %p when given', (value) => {\n  expect(value * 2).toBe(value > 0 ? 2 : 0);\n});\n",
      },
      message: 'Keep logic out of a case',
    },
  ])('should report a plugin finding when $condition', ({ files, message }) => {
    // Arrange
    const project = {
      files,
      parts: TEST_PARTS,
    };

    // Act
    const { plugins } = lintFindings(project);

    // Assert
    expect(plugins.some((finding) => finding.startsWith(message))).toBe(true);
  });

  it.each([
    "z.string().brand<'Email'>()",
    "z.string().email().brand('Email')",
  ])(
    'should report a plugin finding when a schema brands a value object with %s and a project extends the zod part',
    (schema) => {
      // Arrange
      const project = {
        files: {
          'src/features/accounts/adapters/api/models/account.model.ts': `import { z } from 'zod';\n\nexport const emailModel = ${schema};\n`,
        },
        parts: [
          ...FOUNDATION_PARTS,
          'typescript/architecture/zod',
        ],
      };

      // Act
      const { plugins } = lintFindings(project);

      // Assert
      expect(
        plugins.some((finding) =>
          finding.startsWith('Build the value object through the domain'),
        ),
      ).toBe(true);
    },
  );

  it.each([
    {
      condition: 'a date is formatted without a locale',
      source:
        'export const label = (at: Date): string => at.toLocaleDateString();\n',
      message: 'Pass the active locale',
    },
    {
      condition: 'a number formatter is built without a locale',
      source: 'export const formatter = new Intl.NumberFormat();\n',
      message: 'Pass the active locale',
    },
    {
      condition: 'a date is formatted with undefined in place of the locale',
      source:
        "export const label = (at: Date): string =>\n  at.toLocaleDateString(undefined, { month: 'long' });\n",
      message: 'Pass the active locale',
    },
    {
      condition: 'a formatter is built without new and without a locale',
      source: 'export const formatter = Intl.DateTimeFormat();\n',
      message: 'Pass the active locale',
    },
  ])(
    'should report a plugin finding when $condition and a project extends the i18n part',
    ({ message, source }) => {
      // Arrange
      const project = {
        files: {
          'src/panel.tsx': source,
        },
        parts: [
          ...FOUNDATION_PARTS,
          'typescript/foundation/i18n',
        ],
      };

      // Act
      const { plugins } = lintFindings(project);

      // Assert
      expect(plugins.some((finding) => finding.startsWith(message))).toBe(true);
    },
  );

  it.each([
    {
      condition: 'a spec waits a fixed time',
      rule: 'noPlaywrightWaitForTimeout',
      source:
        "import { expect, test } from '@playwright/test';\n\ntest('should sign in when the password is right', async ({ page }) => {\n  await page.waitForTimeout(500);\n  await expect(page.getByRole('heading')).toBeVisible();\n});\n",
    },
    {
      condition: 'a spec waits for a quiet network',
      rule: 'noPlaywrightNetworkidle',
      source:
        "import { expect, test } from '@playwright/test';\n\ntest('should sign in when the password is right', async ({ page }) => {\n  await page.goto('/', { waitUntil: 'networkidle' });\n});\n",
    },
    {
      condition: 'a spec forces a click',
      rule: 'noPlaywrightForceOption',
      source:
        "import { expect, test } from '@playwright/test';\n\ntest('should sign in when the password is right', async ({ page }) => {\n  await page.getByRole('button').click({ force: true });\n});\n",
    },
    {
      condition: 'a spec leaves an assertion unawaited',
      rule: 'noPlaywrightMissingAwait',
      source:
        "import { expect, test } from '@playwright/test';\n\ntest('should sign in when the password is right', async ({ page }) => {\n  await page.goto('/');\n  expect(page.getByRole('heading')).toBeVisible();\n});\n",
    },
  ])(
    'should report $rule when $condition and a project extends the playwright part',
    ({ rule, source }) => {
      // Arrange
      const project = {
        files: {
          'tests/e2e/sign-in.e2e.test.ts': source,
        },
        parts: [
          ...FOUNDATION_PARTS,
          'typescript/foundation/playwright',
        ],
      };

      // Act
      const { rules } = lintFindings(project);

      // Assert
      expect(rules).toContain(rule);
    },
  );

  it.each([
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
  ])('should report no plugin finding when $condition', ({ files }) => {
    // Arrange
    const project = {
      files,
      parts: [
        ...FOUNDATION_PARTS,
        'typescript/foundation/_react',
      ],
    };

    // Act
    const { plugins } = lintFindings(project);

    // Assert
    expect(plugins).toStrictEqual([]);
  });

  it.each([
    {
      condition: 'a conditional returns null beside a value that is no markup',
      message: 'null outside the boundary',
      source:
        'export const countOf = (isShown: boolean): number | undefined => (isShown ? 1 : null) ?? undefined;\n',
    },
    {
      condition: 'a callback that is no component returns null',
      message: 'null outside the boundary',
      source:
        "export const blanks = (): readonly unknown[] => ['row'].map(() => null);\n",
    },
    {
      condition: 'a state hook takes a union of literals',
      message: 'A closed set of named values is a string enum',
      source:
        "import { useState } from 'react';\n\nexport const useMode = (): unknown => useState<'idle' | 'busy'>('idle');\n",
    },
  ])(
    'should report a plugin finding when $condition',
    ({ message, source }) => {
      // Arrange
      const project = {
        files: {
          'src/panel.tsx': source,
        },
        parts: [
          ...FOUNDATION_PARTS,
          'typescript/foundation/_react',
        ],
      };

      // Act
      const { plugins } = lintFindings(project);

      // Assert
      expect(plugins.some((finding) => finding.startsWith(message))).toBe(true);
    },
  );

  it.each([
    {
      isReported: true,
      parts: FOUNDATION_PARTS,
    },
    {
      isReported: false,
      parts: [
        ...FOUNDATION_PARTS,
        'typescript/foundation/storybook',
      ],
    },
  ])(
    'should report noDefaultExport $isReported when a story exports its meta by default and a project extends $parts',
    ({ isReported, parts }) => {
      // Arrange
      const project = {
        files: {
          'src/panel.stories.tsx':
            "const meta = { title: 'Panel' };\n\nexport default meta;\n",
        },
        parts,
      };

      // Act
      const { rules } = lintFindings(project);

      // Assert
      expect(rules.includes('noDefaultExport')).toBe(isReported);
    },
  );

  it('should report no plugin finding when formatting takes a locale and a project extends the i18n part', () => {
    // Arrange
    const project = {
      files: {
        'src/panel.tsx':
          "export const label = (at: Date): string => at.toLocaleDateString('uk');\n",
      },
      parts: [
        ...FOUNDATION_PARTS,
        'typescript/foundation/i18n',
      ],
    };

    // Act
    const { plugins } = lintFindings(project);

    // Assert
    expect(plugins).toStrictEqual([]);
  });

  it('should report a plugin finding when a response body is cast with .json<T>() and a project extends the ky part', () => {
    // Arrange
    const project = {
      files: {
        'src/features/orders/order.ts':
          'interface Order {\n  id: string;\n}\n\nexport const read = (response: Response): Promise<Order> =>\n  response.json<Order>();\n',
      },
      parts: [
        ...FOUNDATION_PARTS,
        'typescript/foundation/ky',
      ],
    };

    // Act
    const { plugins } = lintFindings(project);

    // Assert
    expect(
      plugins.some((finding) =>
        finding.startsWith(
          'A response body is unknown until a schema parses it',
        ),
      ),
    ).toBe(true);
  });
});

const ERROR_WITHOUT_CAUSE =
  "export const readOrder = (text: string): unknown => {\n  try {\n    return JSON.parse(text);\n  } catch (error) {\n    throw new Error('unreadable order');\n  }\n};\n";

const UNTYPED_RETURN = 'export const next = (count: number) => count + 1;\n';

describe('the Biome part that needs each setting', () => {
  it.each([
    {
      condition: 'a function leaves its return type unwritten',
      files: {
        'src/main.ts': UNTYPED_RETURN,
      },
      isReported: false,
      parts: [
        'common/foundation/self',
        'typescript/foundation/self',
        'typescript/foundation/core',
      ],
      rule: 'useExplicitType',
    },
    {
      condition: 'a function leaves its return type unwritten',
      files: {
        'src/main.ts': UNTYPED_RETURN,
      },
      isReported: true,
      parts: FOUNDATION_PARTS,
      rule: 'useExplicitType',
    },
    {
      condition: 'a catch block throws a new error without its cause',
      files: {
        'src/main.ts': ERROR_WITHOUT_CAUSE,
      },
      isReported: false,
      parts: [
        'common/foundation/self',
        'typescript/foundation/self',
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
        'common/foundation/self',
        'typescript/foundation/self',
        'typescript/foundation/core',
      ],
      rule: 'useErrorCause',
    },
    {
      condition: 'the dependency-cruiser configuration exports by default',
      files: {
        '.dependency-cruiser.mjs': 'export default {};\n',
      },
      isReported: true,
      parts: FOUNDATION_PARTS,
      rule: 'noDefaultExport',
    },
    {
      condition: 'the dependency-cruiser configuration exports by default',
      files: {
        '.dependency-cruiser.mjs': 'export default {};\n',
      },
      isReported: false,
      parts: [
        ...FOUNDATION_PARTS,
        'typescript/foundation/dependency-cruiser',
      ],
      rule: 'noDefaultExport',
    },
    {
      condition: 'a bigint is added to a number',
      files: {
        'src/main.ts':
          'export const total = (count: number): bigint => 1n + count;\n',
      },
      isReported: true,
      parts: FOUNDATION_PARTS,
      rule: 'noUnsafePlusOperands',
    },
    {
      condition: 'an object is printed by its default toString',
      files: {
        'src/main.ts':
          'interface Order {\n  id: string;\n}\n\nexport const label = (order: Order): string => `Order ${order}`;\n',
      },
      isReported: true,
      parts: FOUNDATION_PARTS,
      rule: 'noBaseToString',
    },
    {
      condition: 'a declared return type is wider than what is returned',
      files: {
        'src/main.ts':
          'export const rank = (isFirst: boolean): number => (isFirst ? 0 : 1);\n',
      },
      isReported: true,
      parts: FOUNDATION_PARTS,
      rule: 'noMisleadingReturnType',
    },
    {
      condition: 'a string is thrown',
      files: {
        'src/main.ts':
          "export const fail = (): never => {\n  throw 'broken';\n};\n",
      },
      isReported: true,
      parts: FOUNDATION_PARTS,
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
        ...FOUNDATION_PARTS,
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
        ...FOUNDATION_PARTS,
        'typescript/architecture/typescript',
      ],
      rule: 'noProcessEnv',
    },
    {
      condition: 'an element without children is closed by a tag',
      files: {
        'src/panel.tsx': component('<div></div>'),
      },
      isReported: true,
      parts: [
        ...FOUNDATION_PARTS,
        'typescript/foundation/_react',
      ],
      rule: 'useSelfClosingElements',
    },
  ])(
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
  it.each([
    {
      condition: 'a rule sits outside a layer',
      css: '.card {\n  color: var(--color-text);\n}\n',
      rule: 'useLayeredStyles',
    },
    {
      condition: 'a layer has no name',
      css: '@layer {\n  .card {\n    color: var(--color-text);\n  }\n}\n',
      rule: 'useNamedLayer',
    },
    {
      condition: 'a declaration is important',
      css: '@layer components {\n  .card {\n    color: var(--color-text) !important;\n  }\n}\n',
      rule: 'noImportantStyles',
    },
    {
      condition: 'a stylesheet writes a hexadecimal colour',
      css: '@layer components {\n  .card {\n    color: #102030;\n  }\n}\n',
      rule: 'noHexColors',
    },
    {
      condition: 'a selector holds four classes',
      css: '@layer components {\n  .card .title .label .icon {\n    color: var(--color-text);\n  }\n}\n',
      rule: 'noExcessiveSelectorClasses',
    },
    {
      condition: 'a custom property is read before it is declared',
      css: '@layer components {\n  .card {\n    color: var(--color-missing);\n  }\n}\n',
      rule: 'noUndeclaredCustomProperties',
    },
    {
      condition: 'a registered property has an invalid initial value',
      css: "@property --size {\n  syntax: '<length>';\n  inherits: false;\n  initial-value: red;\n}\n",
      rule: 'noInvalidPropertyInitValue',
    },
    {
      condition: 'a custom property is read without var()',
      css: '@layer components {\n  .card {\n    color: --color-text;\n  }\n}\n',
      rule: 'noMissingVarFunction',
    },
    {
      condition: 'a less specific selector follows a more specific one',
      css: '@layer components {\n  .card .title {\n    color: var(--color-text);\n  }\n\n  .title {\n    color: var(--color-text);\n  }\n}\n',
      rule: 'noDescendingSpecificity',
    },
    {
      condition: 'a feature is not yet in the baseline',
      css: '@layer components {\n  .card {\n    color: var(--color-text);\n    interpolate-size: allow-keywords;\n  }\n}\n',
      rule: 'useBaseline',
    },
    {
      condition: 'a declared class is used nowhere',
      css: '@layer components {\n  .unused {\n    color: var(--color-text);\n  }\n}\n',
      rule: 'noUnusedClasses',
    },
  ])('should report $rule when $condition', ({ css, rule }) => {
    // Arrange
    const project = {
      files: {
        'src/panel.tsx':
          "import './theme.css';\n\nexport function Panel(): React.ReactElement {\n  return <div className='card title label icon' />;\n}\n",
        'src/theme.css': `${LAYERED}${css}`,
      },
      parts: [
        ...FOUNDATION_PARTS,
        'css/foundation/css',
      ],
    };

    // Act
    const { rules } = lintFindings(project);

    // Assert
    expect(rules).toContain(rule);
  });

  it('should report noHexColors when the theme writes a hexadecimal colour', () => {
    // Arrange
    const project = {
      files: {
        'src/libs/ui/theme/theme.css': `${LAYERED}@layer components {\n  .card {\n    color: #102030;\n  }\n}\n`,
      },
      parts: [
        ...FOUNDATION_PARTS,
        'css/foundation/css',
      ],
    };

    // Act
    const { rules } = lintFindings(project);

    // Assert
    expect(rules).toContain('noHexColors');
  });

  it.each([
    {
      isReported: true,
      parts: [
        ...FOUNDATION_PARTS,
        'css/foundation/css',
      ],
    },
    {
      isReported: false,
      parts: [
        ...FOUNDATION_PARTS,
        'css/foundation/css',
        'css/foundation/browser',
      ],
    },
  ])(
    'should report useBaseline $isReported when a popover is placed by anchor positioning and a project extends $parts',
    ({ isReported, parts }) => {
      // Arrange
      const project = {
        files: {
          'src/theme.css': `${LAYERED}@layer components {\n  .card {\n    anchor-name: --trigger;\n  }\n\n  .title {\n    position-anchor: --trigger;\n    position-area: bottom;\n    top: anchor(bottom);\n  }\n}\n`,
        },
        parts,
      };

      // Act
      const { rules } = lintFindings(project);

      // Assert
      expect(rules.includes('useBaseline')).toBe(isReported);
    },
  );

  it('should report a plugin finding when a stylesheet styles an element by its id', () => {
    // Arrange
    const project = {
      files: {
        'src/theme.css': `${LAYERED}@layer components {\n  #main {\n    color: var(--color-text);\n  }\n}\n`,
      },
      parts: [
        ...FOUNDATION_PARTS,
        'css/foundation/css',
      ],
    };

    // Act
    const { plugins } = lintFindings(project);

    // Assert
    expect(
      plugins.some((finding) =>
        finding.startsWith('Style by class or attribute'),
      ),
    ).toBe(true);
  });

  it.each([
    {
      isReported: true,
      parts: [
        ...FOUNDATION_PARTS,
        'css/foundation/css',
        'typescript/foundation/css',
      ],
    },
    {
      isReported: false,
      parts: [
        ...FOUNDATION_PARTS,
        'css/foundation/css',
        'typescript/foundation/css',
        'typescript/foundation/tailwind',
      ],
    },
  ])(
    'should report a utility class as undeclared $isReported when a project extends $parts',
    ({ isReported, parts }) => {
      // Arrange
      const project = {
        files: {
          'src/panel.tsx':
            "import './theme.css';\n\nexport function Panel(): React.ReactElement {\n  return <div className='flex' />;\n}\n",
          'src/theme.css': LAYERED,
        },
        parts,
      };

      // Act
      const { rules } = lintFindings(project);

      // Assert
      expect(rules.includes('noUndeclaredClasses')).toBe(isReported);
    },
  );
});

describe('the Biome tanstack-query part', () => {
  it.each([
    {
      condition: 'a query writes its key inline',
      isReported: true,
      source:
        "export const read = (id: string) => useQuery({ queryKey: ['orders', id], queryFn });\n",
    },
    {
      condition: 'an invalidation writes its key inline',
      isReported: true,
      source:
        "export const refresh = () => client.invalidateQueries({ queryKey: ['orders'] });\n",
    },
    {
      condition: 'the query client writes a key inline',
      isReported: true,
      source:
        "export const reset = () => client.setQueryData(['orders'], []);\n",
    },
    {
      condition: 'the query client reads a key inline',
      isReported: true,
      source: "export const cached = () => client.getQueryData(['orders']);\n",
    },
    {
      condition: 'the query client reads a key from the factory',
      isReported: false,
      source:
        'export const cached = (id: string) => client.getQueryData(orderKeys.detail(id));\n',
    },
    {
      condition: 'a query takes its key from the factory',
      isReported: false,
      source:
        'export const read = (id: string) => useQuery({ queryKey: orderKeys.detail(id), queryFn });\n',
    },
  ])(
    'should report an inline key $isReported when $condition',
    ({ isReported, source }) => {
      // Arrange
      const project = {
        files: {
          'src/features/orders/orders.hooks.ts': source,
        },
        parts: [
          ...FOUNDATION_PARTS,
          'typescript/foundation/tanstack-query',
        ],
      };

      // Act
      const { plugins } = lintFindings(project);

      // Assert
      expect(
        plugins.some((finding) =>
          finding.startsWith('Take the key from the key factory'),
        ),
      ).toBe(isReported);
    },
  );
});

describe('the Biome browser part', () => {
  it.each([
    {
      condition: 'markup is assigned to innerHTML',
      source:
        'export const show = (panel: Element, markup: string): void => {\n  panel.innerHTML = markup;\n};\n',
    },
    {
      condition: 'markup is inserted beside an element',
      source:
        "export const show = (panel: Element, markup: string): void => {\n  panel.insertAdjacentHTML('beforeend', markup);\n};\n",
    },
    {
      condition: 'markup is written into the document',
      source:
        'export const show = (markup: string): void => {\n  document.write(markup);\n};\n',
    },
  ])('should report raw HTML when $condition', ({ source }) => {
    // Arrange
    const project = {
      files: {
        'src/features/orders/ui/show.ts': source,
      },
      parts: [
        ...FOUNDATION_PARTS,
        'typescript/architecture/browser',
      ],
    };

    // Act
    const { plugins } = lintFindings(project);

    // Assert
    expect(
      plugins.some((finding) =>
        finding.startsWith('Render markup through a sanitising renderer'),
      ),
    ).toBe(true);
  });
});

describe('the Biome framework parts', () => {
  it.each([
    {
      condition: 'a component is a class',
      source:
        "import { Component } from 'react';\n\nexport class Panel extends Component {\n  public render(): null {\n    return null;\n  }\n}\n",
      rule: 'useReactFunctionComponents',
    },
    {
      condition: 'a ref is a string',
      source: component("<div ref='box' />"),
      rule: 'noReactStringRefs',
    },
    {
      condition: 'an element with an interactive role cannot take focus',
      source: component("<div role='button' />"),
      rule: 'useFocusableInteractive',
    },
    {
      condition: 'an ARIA attribute is written in camelCase',
      source: component("<input ariaLabel='Email' />"),
      rule: 'noUnknownAttribute',
    },
    {
      condition: 'an id is typed by hand',
      source: component("<input id='email' />"),
      rule: 'useUniqueElementIds',
    },
    {
      condition: 'raw HTML is injected beside children',
      source: component(
        "<div dangerouslySetInnerHTML={{ __html: '' }}>text</div>",
      ),
      rule: 'noDangerouslySetInnerHtmlWithChildren',
    },
    {
      condition: 'a component assigns to its props',
      source:
        'export function Panel(props: { size: number }): React.ReactElement {\n  props.size = 2;\n\n  return <div />;\n}\n',
      rule: 'noReactPropAssignments',
    },
    {
      condition: 'the viewport blocks zooming',
      source: component(
        "<meta content='width=device-width, user-scalable=no' name='viewport' />",
      ),
      rule: 'noNonScalableViewport',
    },
    {
      condition: 'an image declares no size',
      source: component("<img alt='Logo' src='/logo.svg' />"),
      rule: 'useImageSize',
    },
    {
      condition: 'a class carries an arbitrary value',
      source: component("<div className='p-[13px]' />"),
      rule: 'noTailwindArbitraryValue',
    },
    {
      condition: 'a list keys its items by index',
      source: component(
        '<ul>{items.map((item, index) => <li key={index}>{item}</li>)}</ul>',
      ),
      rule: 'noArrayIndexKey',
    },
    {
      condition: 'an item of a mapped list has no key',
      source: component('<ul>{items.map((item) => <li>{item}</li>)}</ul>'),
      rule: 'useJsxKeyInIterable',
    },
    {
      condition: 'a ref is forwarded the legacy way',
      source:
        "import { forwardRef } from 'react';\n\nexport const Field = forwardRef<HTMLInputElement>((props, ref) => <input ref={ref} {...props} />);\n",
      rule: 'noReactForwardRef',
    },
    {
      condition: 'a hook factory makes a component',
      source:
        'export function makeBadge() {\n  return function Badge(): null {\n    return null;\n  };\n}\n',
      rule: 'noComponentHookFactories',
    },
    {
      condition: 'a component is defined inside a component',
      source:
        'export function Panel(): React.ReactElement {\n  function Title(): React.ReactElement {\n    return <h2>Orders</h2>;\n  }\n\n  return <Title />;\n}\n',
      rule: 'noNestedComponentDefinitions',
    },
    {
      condition: 'a label names no control',
      source: component('<label>Email</label>'),
      rule: 'noLabelWithoutControl',
    },
    {
      condition: 'an SVG has no title',
      source: component("<svg><circle r='1' /></svg>"),
      rule: 'noSvgWithoutTitle',
    },
    {
      condition: 'an image has no alternative text',
      source: component("<img src='/order.png' />"),
      rule: 'useAltText',
    },
    {
      condition: 'a link has no content',
      source: component("<a href='/orders' />"),
      rule: 'useAnchorContent',
    },
    {
      condition: 'a button has no label',
      source: component("<button type='button' />"),
      rule: 'useControlLabel',
    },
    {
      condition: 'an iframe has no title',
      source: component("<iframe src='/map' />"),
      rule: 'useIframeTitle',
    },
    {
      condition: 'an autocomplete token is unknown',
      source: component("<input type='email' autoComplete='mail' />"),
      rule: 'useValidAutocomplete',
    },
    {
      condition: 'a static element takes a handler',
      source: component('<div onClick={open} />'),
      rule: 'noStaticElementInteractions',
    },
    {
      condition: 'a role HTML has an element for is set on a div',
      source: component("<div role='button' tabIndex={0} />"),
      rule: 'useSemanticElements',
    },
    {
      condition: 'a link has no real href',
      source: component("<a href='#'>Orders</a>"),
      rule: 'useValidAnchor',
    },
    {
      condition: 'a focusable element is hidden from assistive technology',
      source: component(
        "<button type='button' aria-hidden='true'>Save</button>",
      ),
      rule: 'noAriaHiddenOnFocusable',
    },
    {
      condition: 'an interactive element takes a static role',
      source: component("<button type='button' role='article'>Save</button>"),
      rule: 'noInteractiveElementToNoninteractiveRole',
    },
    {
      condition: 'a static element takes an interactive role',
      source: component("<li role='button'>Save</li>"),
      rule: 'noNoninteractiveElementToInteractiveRole',
    },
    {
      condition: 'an element restates its own role',
      source: component("<button type='button' role='button'>Save</button>"),
      rule: 'noRedundantRoles',
    },
    {
      condition: 'a role lacks its required attribute',
      source: component("<span role='checkbox' />"),
      rule: 'useAriaPropsForRole',
    },
    {
      condition: 'an ARIA attribute does not exist',
      source: component("<input aria-labeledby='x' />"),
      rule: 'useValidAriaProps',
    },
    {
      condition: 'a role does not exist',
      source: component("<div role='datepicker' />"),
      rule: 'useValidAriaRole',
    },
    {
      condition: 'an ARIA value is of the wrong kind',
      source: component("<div aria-hidden='yes' />"),
      rule: 'useValidAriaValues',
    },
  ])('should report $rule when $condition', ({ rule, source }) => {
    // Arrange
    const project = {
      files: {
        'package.json': MANIFEST,
        'src/panel.tsx': source,
      },
      parts: WEB_PARTS,
    };

    // Act
    const { rules } = lintFindings(project);

    // Assert
    expect(rules).toContain(rule);
  });

  it.each([
    {
      condition: 'a cascade layer has no name',
      files: {
        'src/styles.css': '@layer {\n  a {\n    color: red;\n  }\n}\n',
      },
      parts: [
        ...FOUNDATION_PARTS,
        'css/foundation/css',
      ],
      rule: 'useNamedLayer',
    },
    {
      condition: 'a list item takes a click handler',
      files: {
        'src/panel.tsx': component('<li onClick={() => undefined}>item</li>'),
      },
      parts: [
        ...FOUNDATION_PARTS,
        'typescript/foundation/react-dom',
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
        ...FOUNDATION_PARTS,
        'typescript/foundation/_react',
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
        ...FOUNDATION_PARTS,
        'typescript/foundation/_react',
        'typescript/foundation/react-native',
      ],
      rule: 'noReactNativeLiteralColors',
    },
    {
      condition: 'a component file is in PascalCase',
      files: {
        'src/Panel.tsx': component('<div />'),
      },
      parts: [
        ...FOUNDATION_PARTS,
        'typescript/foundation/_react',
      ],
      rule: 'useFilenamingConvention',
    },
  ])(
    'should report $rule when $condition and a project extends $parts',
    ({ files, parts, rule }) => {
      // Arrange
      const project = {
        files: {
          'package.json': MANIFEST,
          ...files,
        },
        parts,
      };

      // Act
      const { rules } = lintFindings(project);

      // Assert
      expect(rules).toContain(rule);
    },
  );

  it.each([
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
  ])(
    'should not report $rule when $condition and a project extends only foundation self, core and typescript',
    ({ files, rule }) => {
      // Arrange
      const project = {
        files: {
          'package.json': MANIFEST,
          ...files,
        },
        parts: FOUNDATION_PARTS,
      };

      // Act
      const { rules } = lintFindings(project);

      // Assert
      expect(rules).not.toContain(rule);
    },
  );

  it.each([
    {
      condition: 'a context is read with useContext',
      files: {
        'src/panel.tsx':
          "import { createContext, useContext } from 'react';\n\nconst ThemeContext = createContext('light');\n\nexport function Panel(): string {\n  return useContext(ThemeContext);\n}\n",
      },
      message: 'Read a context with use(Context)',
    },
    {
      condition: 'a context is provided through Context.Provider',
      files: {
        'src/panel.tsx':
          "import { createContext } from 'react';\n\nconst ThemeContext = createContext('light');\n\nexport function Panel(): React.ReactElement {\n  return <ThemeContext.Provider value='dark' />;\n}\n",
      },
      message: 'Render the context itself as its provider',
    },
    {
      condition: 'a component takes defaultProps',
      files: {
        'src/panel.tsx': `${component('<div />')}\nPanel.defaultProps = {};\n`,
      },
      message: 'Give a prop its default in the parameter',
    },
    {
      condition: 'a ref is made with createRef',
      files: {
        'src/panel.ts':
          "import { createRef } from 'react';\n\nexport const panelRef = createRef<HTMLDivElement>();\n",
      },
      message: 'Hold a ref with useRef or a ref callback',
    },
    {
      condition: 'an id is random',
      files: {
        'src/panel.tsx': component('<input id={crypto.randomUUID()} />'),
      },
      message: 'Take an id from useId',
    },
    {
      condition: 'an email field declares no autocomplete',
      files: {
        'src/panel.tsx': component("<input aria-label='Email' type='email' />"),
      },
      message: "A field for the user's own data declares its purpose",
    },
    {
      condition: 'a spec finds an element by its test id',
      files: {
        'src/__tests__/panel.test.tsx':
          "import { screen } from '@testing-library/react';\n\nexport const panel = (): HTMLElement => screen.getByTestId('panel');\n",
      },
      message: 'Find an element as a person does',
    },
    {
      condition: 'a spec finds an element by a selector',
      files: {
        'src/__tests__/panel.test.tsx':
          "export const panel = (container: HTMLElement): Element | null =>\n  container.querySelector('.panel');\n",
      },
      message: 'Find an element as a person does',
    },
    {
      condition: 'a class list sizes with h-screen',
      files: {
        'src/panel.tsx': component("<main className='min-h-screen' />"),
      },
      message: 'Size to the small viewport with h-svh',
    },
    {
      condition: 'a variant map sizes with h-screen',
      files: {
        'src/panel.variants.ts':
          "import { cva } from 'class-variance-authority';\n\nexport const panelVariants = cva('flex h-screen');\n",
      },
      message: 'Size to the small viewport with h-svh',
    },
    {
      condition: 'a class list sets a physical margin',
      files: {
        'src/panel.tsx': component("<div className='ml-4' />"),
      },
      message: 'Use the logical utility',
    },
    {
      condition: 'a class list aligns text to the left',
      files: {
        'src/panel.tsx': component("<div className='md:text-left' />"),
      },
      message: 'Use the logical utility',
    },
    {
      condition: 'a class list removes the outline',
      files: {
        'src/panel.tsx': component("<button className='outline-none' />"),
      },
      message: 'Show focus with focusable',
    },
    {
      condition: 'a class list sizes with w-screen',
      files: {
        'src/panel.tsx': component("<main className='w-screen' />"),
      },
      message: 'Size to the small viewport with h-svh',
    },
    {
      condition: 'an inline style comes from a variable',
      files: {
        'src/panel.tsx':
          "const look = { color: 'red' };\n\nexport function Panel(): React.ReactElement {\n  return <div style={look} />;\n}\n",
      },
      message: 'Pass the value as a custom property',
    },
    {
      condition: 'an inline style spreads another object',
      files: {
        'src/panel.tsx': component("<div style={{ ...{ color: 'red' } }} />"),
      },
      message: 'Pass the value as a custom property',
    },
    {
      condition: 'an inline style uses a shorthand property',
      files: {
        'src/panel.tsx':
          'export function Panel({ top }: { top: number }): React.ReactElement {\n  return <div style={{ top }} />;\n}\n',
      },
      message: 'Pass the value as a custom property',
    },
    {
      condition: 'an element takes an inline visual value',
      files: {
        'src/panel.tsx': component("<div style={{ color: 'red' }} />"),
      },
      message: 'Pass the value as a custom property',
    },
    {
      condition: 'a class list narrows with a max-* breakpoint',
      files: {
        'src/panel.tsx': component("<main className='flex max-md:hidden' />"),
      },
      message: 'Widen from the small screen',
    },
    {
      condition: 'a variant map narrows with a max-* breakpoint',
      files: {
        'src/panel.variants.ts':
          "import { cva } from 'class-variance-authority';\n\nexport const panelVariants = cva('flex max-md:hidden');\n",
      },
      message: 'Widen from the small screen',
    },
  ])('should report a plugin finding when $condition', ({ files, message }) => {
    // Arrange
    const project = {
      files: {
        'package.json': MANIFEST,
        ...files,
      },
      parts: WEB_PARTS,
    };

    // Act
    const { plugins } = lintFindings(project);

    // Assert
    expect(plugins.some((finding) => finding.startsWith(message))).toBe(true);
  });

  it.each([
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
        'src/panel.tsx':
          'export function Panel(): React.ReactNode {\n  return null;\n}\n',
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
        'src/panel.tsx': component(
          "<div className='ms-4 text-start items-center' />",
        ),
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
  ])('should report no plugin finding when $condition', ({ files }) => {
    // Arrange
    const project = {
      files: {
        'package.json': MANIFEST,
        ...files,
      },
      parts: WEB_PARTS,
    };

    // Act
    const { plugins } = lintFindings(project);

    // Assert
    expect(plugins).toStrictEqual([]);
  });

  it('should report no missing dependency when an effect calls an effect event', () => {
    // Arrange
    const project = {
      files: {
        'package.json': MANIFEST,
        'src/room.hooks.ts': ROOM_HOOK,
      },
      parts: WEB_PARTS,
    };

    // Act
    const { rules } = lintFindings(project);

    // Assert
    expect(rules).not.toContain('useExhaustiveDependencies');
  });

  it('should report a missing dependency when an effect calls a plain function', () => {
    // Arrange
    const project = {
      files: {
        'package.json': MANIFEST,
        'src/room.hooks.ts': ROOM_HOOK.replace(
          'useEffectEvent((): void => {',
          '((): void => {',
        ).replace(', useEffectEvent', ''),
      },
      parts: WEB_PARTS,
    };

    // Act
    const { rules } = lintFindings(project);

    // Assert
    expect(rules).toContain('useExhaustiveDependencies');
  });
});

describe('the Biome architecture parts', () => {
  it.each([
    {
      condition: 'a surface re-exports everything',
      files: {
        'src/features/orders/index.ts': "export * from './app';\n",
      },
      parts: [
        ...FOUNDATION_PARTS,
        'typescript/architecture/core',
      ],
      rule: 'noReExportAll',
    },
    {
      condition: 'a React Native module is imported by its internal path',
      files: {
        'src/panel.ts':
          "export { default as Pressable } from 'react-native/Libraries/Components/Pressable/Pressable';\n",
      },
      parts: [
        ...FOUNDATION_PARTS,
        'typescript/architecture/react-native',
      ],
      rule: 'noReactNativeDeepImports',
    },
  ])(
    'should report $rule when $condition and a project extends $parts',
    ({ files, parts, rule }) => {
      // Arrange
      const project = {
        files: {
          'package.json': JSON.stringify({
            name: 'fixture',
            dependencies: {
              react: '19.2.0',
              'react-native': '0.81.0',
            },
          }),
          ...files,
        },
        parts,
      };

      // Act
      const { rules } = lintFindings(project);

      // Assert
      expect(rules).toContain(rule);
    },
  );

  it.each([
    {
      isReported: false,
      parts: [
        ...FOUNDATION_PARTS,
        'typescript/architecture/core',
      ],
    },
    {
      isReported: true,
      parts: [
        ...FOUNDATION_PARTS,
        'typescript/architecture/typescript',
      ],
    },
  ])(
    'should report a declaring surface $isReported when a project extends $parts',
    ({ isReported, parts }) => {
      // Arrange
      const project = {
        files: {
          'src/features/orders/index.ts': "export const ORDERS = 'orders';\n",
        },
        parts,
      };

      // Act
      const { plugins } = lintFindings(project);

      // Assert
      expect(
        plugins.some((finding) =>
          finding.startsWith('A surface only re-exports by name'),
        ),
      ).toBe(isReported);
    },
  );

  it.each([
    {
      isReported: true,
      parts: FOUNDATION_PARTS,
    },
    {
      isReported: false,
      parts: [
        ...FOUNDATION_PARTS,
        'typescript/foundation/nestjs',
      ],
    },
  ])(
    'should report noParameterProperties $isReported when a provider takes its dependencies through its constructor and a project extends $parts',
    ({ isReported, parts }) => {
      // Arrange
      const project = {
        files: {
          'src/orders.service.ts':
            'export class OrdersService {\n  public constructor(private readonly clock: Date) {}\n}\n',
        },
        parts,
      };

      // Act
      const { rules } = lintFindings(project);

      // Assert
      expect(rules.includes('noParameterProperties')).toBe(isReported);
    },
  );
});
