import { beforeAll, describe, expect, it } from 'bun:test';

import type { PluginRow } from './biome-plugins.fixtures';
import { createPluginBatch, pluginsWithNoRow } from './biome-plugins.fixtures';

const { allowedCases, lintRegistered, pluginsOf, reportedCases } = createPluginBatch();

const LINT_TIMEOUT = 120_000;

const pluginRows: readonly PluginRow[] = [
  {
    language: 'css',
    slug: 'selector-never-targets-an-id',
    unit: {
      axes: [],
      blocks: [
        'css',
      ],
    },
    reported: [
      {
        condition: 'a stylesheet styles an element by its id',
        files: {
          'src/theme.css':
            '@layer base, components;\n\n@layer base {\n  :root {\n    --color-text: oklch(20% 0 0);\n  }\n}\n\n@layer components {\n  #main {\n    color: var(--color-text);\n  }\n}\n',
        },
      },
    ],
  },
  {
    language: 'css',
    slug: 'theme-aliases-the-token-properties',
    unit: {
      axes: [],
      blocks: [
        'css',
        'design-system',
        'tailwind',
      ],
    },
    reported: [
      {
        condition: 'the theme keeps the default scales',
        files: {
          'src/libs/ui/theme/theme.css': '@theme {\n  --color-text: oklch(20% 0 0);\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the theme resets the default scales',
        files: {
          'src/libs/ui/theme/theme.css':
            '@theme {\n  --*: initial;\n  --color-text: oklch(20% 0 0);\n}\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'biome-refuses-empty-names',
    reported: [
      {
        condition: 'a variable is named by an empty word',
        files: {
          'src/features/orders/order.ts': 'export const data = 1;\n',
        },
      },
      {
        condition: 'generic code in libs names a value by an empty word',
        files: {
          'src/libs/list/list.utils.ts':
            'export const firstOf = (items: readonly string[]): string | undefined => {\n  const value = items.at(0);\n\n  return value;\n};\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'biome-refuses-empty-verbs',
    unit: {
      axes: [],
      blocks: [
        'bun-test',
      ],
    },
    reported: [
      {
        condition: 'a function is named by an empty verb',
        files: {
          'src/features/orders/order.ts': 'export const process = (): number => 1;\n',
        },
      },
    ],
    allowed: [
      {
        condition: "a proxy's handler names its trap",
        files: {
          'src/settings.ts':
            'export const settings = new Proxy(\n  {},\n  {\n    get(target, property) {\n      return Reflect.get(target, property);\n    },\n  },\n);\n',
        },
        unit: {
          axes: [],
          blocks: [
            'react-dom',
          ],
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'case-holds-no-logic',
    unit: {
      axes: [],
      blocks: [
        'bun-test',
      ],
    },
    reported: [
      {
        condition: 'a case branches',
        files: {
          'src/order.test.ts':
            "import { expect, it, test } from 'bun:test';\n\ntest('should add totals when both are set', () => {\n  if (Date.now() > 0) {\n    expect(1).toBe(1);\n  }\n});\n",
        },
      },
    ],
    allowed: [
      {
        condition: "a table's case takes every input from its row",
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest.each([1])('should keep %p', (count) => {\n  // Act\n  const kept = String(count);\n\n  // Assert\n  expect(kept).toBe('1');\n});\n",
        },
        unit: {
          blocks: [
            'bun-test',
            'react-dom',
          ],
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'case-named-should-when',
    reported: [
      {
        condition: 'a case does not read should …',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('adds totals', () => {\n  expect(1).toBe(1);\n});\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a case reads should without a condition',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  // Act\n  const total = 1 + 1;\n\n  // Assert\n  expect(total).toBe(2);\n});\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'case-pins-meaning-never-wording',
    reported: [
      {
        condition: 'toBe expects a sentence',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should check when it runs', () => {\n  // Arrange\n  const given = 1;\n\n  // Act\n  const outcome = String(given);\n\n  // Assert\n  expect(outcome).toBe('the order is not paid');\n});\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'the expected value is a code',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should check when it runs', () => {\n  // Arrange\n  const given = 1;\n\n  // Act\n  const outcome = String(given);\n\n  // Assert\n  expect(outcome).toBe('order-unpaid');\n});\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'case-split-by-arrange-act-assert-comments',
    reported: [
      {
        condition: 'a case opens no section',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  expect(1 + 1).toBe(2);\n});\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a case arranges, acts and asserts',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  // Arrange\n  const count = 2;\n\n  // Act\n  const total = count * 3;\n\n  // Assert\n  expect(total).toBe(6);\n});\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'catch-handles-only-what-it-recognises',
    reported: [
      {
        condition: 'a catch holds only a comment',
        files: {
          'src/features/orders/presentation/load.ts':
            'export const load = (): void => {\n  try {\n    globalThis.focus();\n  } catch {\n    // ignore\n  }\n};\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'closed-name-set-is-a-string-enum',
    reported: [
      {
        condition: 'a type is taken from an as-const array',
        files: {
          'src/features/orders/domain/order-status.ts':
            "const STATUSES = ['open', 'closed'] as const;\n\nexport type OrderStatus = (typeof STATUSES)[number];\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a union mixes a string literal with another type',
        files: {
          'src/features/orders/domain/limit.ts': "export type Limit = 'none' | number;\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'effects-held-only-by-the-edge',
    unit: {
      blocks: [],
    },
    reported: [
      {
        condition: 'an entity draws a random value and reads the clock',
        files: {
          'src/features/orders/domain/entities/order.entity.ts':
            'export const orderId = (): string => crypto.randomUUID();\nexport const placedAt = (): number => Date.now();\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'an adapter draws a random value and reads the clock',
        files: {
          'src/infrastructure/ids/ids.adapter.ts':
            'export const orderId = (): string => crypto.randomUUID();\nexport const placedAt = (): number => Date.now();\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'failed-test-never-retried',
    unit: {
      axes: [],
      blocks: [
        'bun-test',
      ],
    },
    reported: [
      {
        condition: 'a case is retried',
        files: {
          'src/order.test.ts':
            "import { expect, it, test } from 'bun:test';\n\ntest('should add totals when both are set', () => {\n  expect(1).toBe(1);\n}, { retry: 3 });\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a case configures a client that retries nothing',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should load orders when the cache is fresh', () => {\n  // Act\n  const options = { queries: { retry: false } };\n\n  // Assert\n  expect(options).toStrictEqual({ queries: { retry: false } });\n});\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'field-declares-its-autocomplete',
    unit: {
      axes: [],
      blocks: [
        'react-dom',
        'browser',
        'tailwind',
        'testing-library',
      ],
    },
    reported: [
      {
        condition: 'an email field declares no autocomplete',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <input aria-label='Email' type='email' />\n  );\n}\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a field declares its autocomplete',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <input aria-label='Email' autoComplete='email' type='email' />\n  );\n}\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'file-is-one-semantic-unit',
    reported: [
      {
        condition: 'a module exports a value beside its component',
        files: {
          'src/Panel.tsx':
            "export const PANEL_WIDTH = 4;\n\nexport function Panel(): string {\n  return 'panel';\n}\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'focus-shown-by-focusable-utility',
    unit: {
      axes: [],
      blocks: [
        'react-dom',
        'browser',
        'tailwind',
        'testing-library',
      ],
    },
    reported: [
      {
        condition: 'a class list removes the outline',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <button className='outline-none' />\n  );\n}\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'identifier-case-by-kind',
    reported: [
      {
        condition: 'a module-level constant holding a literal is camelCase',
        files: {
          'src/features/orders/order.ts': 'export const maxItems = 5;\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'important-modifier-never-in-a-class-list',
    unit: {
      axes: [],
      blocks: [
        'react-dom',
        'browser',
        'tailwind',
        'testing-library',
      ],
    },
    reported: [
      {
        condition: 'a class list marks a utility important after it',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <div className='px-0! text-sm' />\n  );\n}\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a class list negates a condition',
        files: {
          'src/panel.tsx':
            "export const classes = (isOpen: boolean): string => cn('px-2', !isOpen && 'hidden');\n",
        },
        unit: {
          axes: [],
          blocks: [
            'tailwind',
          ],
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'inline-style-only-custom-properties-and-geometry',
    unit: {
      axes: [],
      blocks: [
        'react-dom',
        'browser',
        'tailwind',
        'testing-library',
      ],
    },
    reported: [
      {
        condition: 'an inline style comes from a variable',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "const look = { color: 'red' };\n\nexport function Panel(): React.ReactElement {\n  return <div style={look} />;\n}\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'an inline style sets only a custom property',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <div style={{ '--progress': '50%' }} />\n  );\n}\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'ky-body-parsed-by-schema',
    unit: {
      axes: [],
      blocks: [
        'ky',
      ],
    },
    reported: [
      {
        condition: 'a response body is cast with .json<T>()',
        files: {
          'src/features/orders/order.ts':
            'interface Order {\n  id: string;\n}\n\nexport const read = (response: Response): Promise<Order> =>\n  response.json<Order>();\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'labels-bound-with-use-id',
    unit: {
      axes: [],
      blocks: [
        'react-dom',
        'browser',
        'tailwind',
        'testing-library',
      ],
    },
    reported: [
      {
        condition: 'an id is random',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            'export function Panel(): React.ReactElement {\n  return (\n    <input id={crypto.randomUUID()} />\n  );\n}\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'links-name-typed-targets',
    unit: {
      axes: [],
      blocks: [
        'tanstack-router',
      ],
    },
    reported: [
      {
        condition: 'a link target is concatenated',
        files: {
          'src/features/orders/ui/widgets/order-link.ts':
            "export const target = (id: string): { to: string } => ({ to: '/orders/' + id });\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a link names its route by path and params',
        files: {
          'src/features/orders/ui/widgets/order-link.ts':
            "export const target = { to: '/orders/$orderId' };\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'locale-passed-to-every-intl-call',
    unit: {
      axes: [],
      blocks: [
        'i18n',
      ],
    },
    reported: [
      {
        condition: 'a date is formatted without a locale',
        files: {
          'src/panel.tsx': 'export const label = (at: Date): string => at.toLocaleDateString();\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'formatting takes a locale',
        files: {
          'src/panel.tsx':
            "export const label = (at: Date): string => at.toLocaleDateString('uk');\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'logical-utilities-for-direction',
    unit: {
      axes: [],
      blocks: [
        'react-dom',
        'browser',
        'tailwind',
        'testing-library',
        'i18n',
      ],
    },
    reported: [
      {
        condition: 'a class list sets a physical margin',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <div className='ml-4' />\n  );\n}\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a class list uses logical sides',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <div className='ms-4 text-start items-center' />\n  );\n}\n",
        },
        unit: {
          axes: [],
          blocks: [
            'react-dom',
            'browser',
            'tailwind',
            'testing-library',
          ],
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'mobile-first-breakpoints',
    unit: {
      axes: [],
      blocks: [
        'react-dom',
        'browser',
        'tailwind',
        'testing-library',
      ],
    },
    reported: [
      {
        condition: 'a class list narrows with a max-* breakpoint',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <main className='flex max-md:hidden' />\n  );\n}\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a max-* breakpoint bounds a range after a minimum',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <main className='md:max-lg:hidden' />\n  );\n}\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'modern-react-api-only',
    unit: {
      axes: [],
      blocks: [
        'react-dom',
        'browser',
        'tailwind',
        'testing-library',
      ],
    },
    reported: [
      {
        condition: 'a context is read with useContext',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "import { createContext, useContext } from 'react';\n\nconst ThemeContext = createContext('light');\n\nexport function Panel(): string {\n  return useContext(ThemeContext);\n}\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a component holds a ref object',
        files: {
          'src/panel.tsx':
            "import { useRef } from 'react';\n\nexport function Panel(): React.ReactElement {\n  const box = useRef<HTMLDivElement>(null);\n\n  return <div ref={box} />;\n}\n",
        },
        unit: {
          axes: [],
          blocks: [
            'react-dom',
          ],
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'module-level-text-holds-the-message',
    unit: {
      axes: [],
      blocks: [
        'lingui',
      ],
    },
    reported: [
      {
        condition: 'a message is translated at the top level of a module',
        files: {
          'src/features/chat/ui/status.ts':
            "import { t } from '@lingui/core/macro';\n\nexport const online = t`Online`;\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a module declares its message and a component translates it',
        files: {
          'src/features/chat/ui/status.ts':
            "import { msg, t } from '@lingui/core/macro';\n\nexport const online = msg`Online`;\nexport const label = (): string => t`Away`;\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'module-level-value-never-changed',
    unit: {
      axes: [],
      blocks: [
        'bun-test',
      ],
    },
    reported: [
      {
        condition: 'a module exports a binding it can reassign',
        files: {
          'src/session.ts': 'export let current = 0;\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'module-never-mocked-in-a-spec',
    reported: [
      {
        condition: 'a spec replaces a module',
        files: {
          'src/__tests__/order.test.ts':
            "import { mock } from 'bun:test';\n\nmock.module('./order', () => ({}));\n",
        },
      },
    ],
    allowed: [
      {
        condition: "a spec builds a fake function through vi's object",
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test, vi } from 'bun:test';\n\ntest('should call the loader when asked', () => {\n  // Arrange\n  const load = vi.fn();\n\n  // Act\n  load();\n\n  // Assert\n  expect(load).toHaveBeenCalledTimes(1);\n});\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'nothing-rendered-as-null',
    unit: {
      axes: [],
      blocks: [
        'react-dom',
      ],
    },
    reported: [
      {
        condition: 'a conditional returns null beside a value that is no markup',
        files: {
          'src/panel.tsx':
            'export const countOf = (isShown: boolean): number | undefined => (isShown ? 1 : null) ?? undefined;\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a component renders the null branch of a conditional',
        files: {
          'src/panel.tsx':
            'interface PanelProps {\n  readonly isOpen: boolean;\n}\n\nexport function Panel({ isOpen }: PanelProps): React.ReactElement | null {\n  return isOpen ? <div /> : null;\n}\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'parameter-object-has-a-named-type',
    reported: [
      {
        condition: 'an exported function takes an object typed inline',
        files: {
          'src/features/orders/order.ts':
            'export const totalOf = (input: { count: number; price: number }): number =>\n  input.count * input.price;\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a function inside its module takes an object typed inline',
        files: {
          'src/features/orders/order.ts':
            'const totalOf = (input: { count: number; price: number }): number =>\n  input.count * input.price;\n\nexport const priceOf = (count: number): number => totalOf({ count, price: 3 });\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'query-client-built-by-the-root',
    unit: {
      blocks: [
        'tanstack-query',
      ],
    },
    reported: [
      {
        condition: 'a module builds the query client at its top level',
        files: {
          'src/shared/query/client.ts':
            "import { QueryClient } from '@tanstack/react-query';\n\nexport const client = new QueryClient();\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'the cache utilities declare a read and the root builds the client',
        files: {
          'src/features/orders/presentation/utils/cache.utils.ts':
            "export const listOptions = { queryKey: ['orders'], queryFn: (): number => 1 };\n",
          'src/root/query-client.ts':
            "import { QueryClient } from '@tanstack/react-query';\n\nexport const client = new QueryClient();\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'raw-html-never-reaches-the-dom',
    unit: {
      axes: [],
      blocks: [
        'browser',
      ],
    },
    reported: [
      {
        condition: 'markup is assigned to innerHTML',
        files: {
          'src/features/orders/ui/show.ts':
            'export const show = (panel: Element, markup: string): void => {\n  panel.innerHTML = markup;\n};\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'text is set through the element interfaces',
        files: {
          'src/features/orders/ui/show.ts':
            'export const show = (panel: Element, label: string): void => {\n  panel.textContent = label;\n};\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'react-compiler-on',
    reported: [
      {
        condition: 'a component memoises a value by hand',
        files: {
          'src/Panel.tsx':
            "import { useMemo } from 'react';\n\nexport function Panel({ label }: { label: string }): string {\n  return useMemo(() => label.trim(), [label]);\n}\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'read-declared-once-as-query-options',
    unit: {
      blocks: [
        'tanstack-query',
      ],
    },
    reported: [
      {
        condition: 'a hook writes its read inline',
        files: {
          'src/features/orders/presentation/bindings/queries/list/list.hooks.ts':
            "export const options = { queryKey: ['orders'], queryFn: (): number => 1 };\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'the cache utilities declare a read and the root builds the client',
        files: {
          'src/features/orders/presentation/utils/cache.utils.ts':
            "export const listOptions = { queryKey: ['orders'], queryFn: (): number => 1 };\n",
          'src/root/query-client.ts':
            "import { QueryClient } from '@tanstack/react-query';\n\nexport const client = new QueryClient();\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'schema-builds-values-through-the-domain',
    unit: {
      axes: [],
      blocks: [
        'zod',
      ],
    },
    reported: [
      {
        condition: 'a type argument',
        files: {
          'src/features/accounts/infrastructure/api/models/account.model.ts':
            "import { z } from 'zod';\n\nexport const emailModel = z.string().brand<'Email'>();\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'screen-sized-classes-never-used',
    unit: {
      axes: [],
      blocks: [
        'react-dom',
        'browser',
        'tailwind',
        'testing-library',
      ],
    },
    reported: [
      {
        condition: 'a class list sizes with h-screen',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <main className='min-h-screen' />\n  );\n}\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a class list sizes to the dynamic viewport',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <main className='h-dvh' />\n  );\n}\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'spec-never-selects-from-the-document',
    unit: {
      axes: [],
      blocks: [
        'react-dom',
        'browser',
        'tailwind',
        'testing-library',
      ],
    },
    reported: [
      {
        condition: 'a spec finds an element by a selector',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/__tests__/panel.test.tsx':
            "export const panel = (container: HTMLElement): Element | null =>\n  container.querySelector('.panel');\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a spec finds an element by its role',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/__tests__/panel.test.tsx':
            "import { screen } from '@testing-library/react';\n\nexport const panel = (): HTMLElement => screen.getByRole('region');\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'spec-never-sleeps',
    unit: {
      axes: [],
      blocks: [
        'bun-test',
      ],
    },
    reported: [
      {
        condition: 'a spec sleeps through Bun',
        files: {
          'src/order.test.ts':
            "import { expect, it, test } from 'bun:test';\n\ntest('should save when the user stops typing', async () => {\n  await Bun.sleep(50);\n  expect(1).toBe(1);\n});\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'strict-matcher-only',
    unit: {
      axes: [],
      blocks: [
        'bun-test',
      ],
    },
    reported: [
      {
        condition: 'a spec compares with toEqual',
        files: {
          'src/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('adds totals', () => {\n  expect(1).toEqual(1);\n});\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'surface-only-re-exports',
    unit: {
      blocks: [],
    },
    reported: [
      {
        condition: "a feature's surface declares a value",
        files: {
          'src/features/orders/index.ts': "export const ORDERS = 'orders';\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a route of the root declares itself in an index',
        files: {
          'src/root/routes/index.ts': 'export const Route = 1;\n',
        },
        unit: {
          blocks: [
            'react-dom',
            'tanstack-router',
          ],
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'test-never-skipped-or-empty',
    reported: [
      {
        condition: 'a concurrent case is left to do',
        files: {
          'src/__tests__/order.test.ts':
            "import { test } from 'bun:test';\n\ntest.concurrent.todo('should add totals when both are set');\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'timer-set-only-by-the-edge-and-binding-units',
    unit: {
      blocks: [],
    },
    reported: [
      {
        condition: 'an entity sets a timer',
        files: {
          'src/features/orders/domain/entities/order.entity.ts':
            'export const later = (run: () => void): void => {\n  setTimeout(run, 10);\n};\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a use case of the application layer sets a timer',
        files: {
          'src/features/orders/presentation/bindings/poll-orders.use-case.ts':
            'export const later = (run: () => void): void => {\n  setTimeout(run, 10);\n};\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'type-names-undecorated',
    unit: {
      axes: [],
      blocks: [
        'bun-test',
      ],
    },
    reported: [
      {
        condition: 'a type alias carries the Type suffix',
        files: {
          'src/features/orders/order.ts': 'export type OrderType = {\n  id: string;\n};\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'undefined-is-the-only-absence',
    reported: [
      {
        condition: 'null is assigned outside an adapter',
        files: {
          'src/features/orders/domain/order.ts':
            'export const cancelledAt: Date | undefined = null;\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'an adapter maps null from the wire',
        files: {
          'src/features/orders/infrastructure/api/order.adapter.ts':
            'export const toCancelledAt = (raw: string | null): string | undefined =>\n  raw === null ? undefined : raw;\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'zod-four-forms-only',
    unit: {
      axes: [],
      blocks: [
        'zod',
      ],
    },
    reported: [
      {
        condition: 'a schema chains a format on z.string()',
        files: {
          'src/features/chat/infrastructure/api/models/user.model.ts':
            "import { z } from 'zod';\n\nexport const userModel = z.strictObject({ email: z.string().email() });\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a schema takes a format on its own and merges by extend',
        files: {
          'src/features/chat/infrastructure/api/models/user.model.ts':
            "import { z } from 'zod';\n\nconst baseSchema = z.strictObject({ id: z.string() });\n\nexport const userModel = baseSchema.extend({ email: z.email() });\n",
        },
      },
    ],
  },
  {
    language: 'css',
    slug: 'transition-all-never-used',
    unit: {
      axes: [],
      blocks: [
        'css',
        'tailwind',
      ],
    },
    reported: [
      {
        condition: 'a stylesheet applies the transition of every property',
        files: {
          'src/styles/button.css': '.button {\n  @apply transition-all;\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a stylesheet applies the transition of the colours',
        files: {
          'src/styles/button.css': '.button {\n  @apply transition-colors;\n}\n',
        },
      },
    ],
  },
  {
    language: 'css',
    slug: 'transition-names-its-properties',
    unit: {
      axes: [],
      blocks: [
        'css',
      ],
    },
    reported: [
      {
        condition: 'a transition moves all properties',
        files: {
          'src/styles/button.css': '.button {\n  transition: all 150ms ease-out;\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a transition names the property it moves',
        files: {
          'src/styles/button.css': '.button {\n  transition: opacity 150ms ease-out;\n}\n',
        },
      },
    ],
  },
  {
    language: 'css',
    slug: 'web-font-served-as-woff2',
    unit: {
      axes: [],
      blocks: [
        'browser',
        'css',
      ],
    },
    reported: [
      {
        condition: 'a font face serves a TrueType file',
        files: {
          'src/styles/fonts.css':
            '@font-face {\n  font-family: "Body";\n  src: url("/fonts/body.ttf") format("truetype");\n  font-display: swap;\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a font face serves WOFF2 and swaps it in',
        files: {
          'src/styles/fonts.css':
            '@font-face {\n  font-family: "Body";\n  src: url("/fonts/body.woff2") format("woff2");\n  font-display: swap;\n}\n',
        },
      },
    ],
  },
  {
    language: 'css',
    slug: 'viewport-size-in-small-viewport-units',
    unit: {
      axes: [],
      blocks: [
        'browser',
        'css',
      ],
    },
    reported: [
      {
        condition: "a page's height is taken in vh",
        files: {
          'src/styles/page.css': '.page {\n  min-height: 100vh;\n}\n',
        },
      },
      {
        condition: "a page's height is taken in lvh",
        files: {
          'src/styles/page.css': '.page {\n  min-height: 100lvh;\n}\n',
        },
      },
      {
        condition: "a page's width is taken as 100vw",
        files: {
          'src/styles/page.css': '.page {\n  inline-size: calc(100vw - 2rem);\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: "a page's height is taken in svh",
        files: {
          'src/styles/page.css': '.page {\n  min-height: 100svh;\n}\n',
        },
      },
      {
        condition: "a page's height follows the toolbars in dvh",
        files: {
          'src/styles/page.css': '.page {\n  min-height: 100dvh;\n}\n',
        },
      },
      {
        condition: "a page's width is 100% of its block",
        files: {
          'src/styles/page.css': '.page {\n  inline-size: 100%;\n}\n',
        },
      },
      {
        condition: "a media query measures the viewport's height in vh",
        files: {
          'src/styles/page.css':
            '@media (min-height: 40vh) {\n  .page {\n    min-height: 50svh;\n  }\n}\n',
        },
      },
    ],
  },
  {
    language: 'css',
    slug: 'type-sized-in-rem',
    unit: {
      axes: [],
      blocks: [
        'css',
        'ui',
      ],
    },
    reported: [
      {
        condition: 'a font size is set in pixels',
        files: {
          'src/styles/label.css': '.label {\n  font-size: 14px;\n}\n',
        },
      },
      {
        condition: 'a font size is set in points',
        files: {
          'src/styles/label.css': '.label {\n  font-size: 12pt;\n}\n',
        },
      },
      {
        condition: 'the font shorthand sets its size in pixels',
        files: {
          'src/styles/label.css': '.label {\n  font: italic 16px/1.5 sans-serif;\n}\n',
        },
      },
      {
        condition: 'a clamp adds a term in pixels',
        files: {
          'src/styles/label.css': '.label {\n  font-size: clamp(1rem, 2vw + 14px, 2rem);\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a font size is set in rem',
        files: {
          'src/styles/label.css': '.label {\n  font-size: 0.875rem;\n}\n',
        },
      },
      {
        condition: 'a font size is set in em',
        files: {
          'src/styles/label.css': '.label {\n  font-size: 1.25em;\n}\n',
        },
      },
      {
        condition: 'a clamp has bounds in rem and adds a rem term',
        files: {
          'src/styles/label.css': '.label {\n  font-size: clamp(1rem, 0.5rem + 2vw, 2rem);\n}\n',
        },
      },
      {
        condition: 'a font size is held in a custom property named in pixels',
        files: {
          'src/styles/label.css': '.label {\n  font-size: var(--text-16px);\n}\n',
        },
      },
      {
        condition: 'the font shorthand sets its line height after the slash in pixels',
        files: {
          'src/styles/label.css': '.label {\n  font: 1rem/24px sans-serif;\n}\n',
        },
      },
    ],
  },
  {
    language: 'css',
    slug: 'line-height-set-as-a-number',
    unit: {
      axes: [],
      blocks: [
        'css',
      ],
    },
    reported: [
      {
        condition: 'a line height is set in pixels',
        files: {
          'src/styles/label.css': '.label {\n  line-height: 24px;\n}\n',
        },
      },
      {
        condition: 'a line height is a percentage',
        files: {
          'src/styles/label.css': '.label {\n  line-height: 150%;\n}\n',
        },
      },
      {
        condition: 'the font shorthand sets its line height in pixels',
        files: {
          'src/styles/label.css': '.label {\n  font: 1rem/24px sans-serif;\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a line height is a unitless number',
        files: {
          'src/styles/label.css': '.label {\n  line-height: 1.5;\n}\n',
        },
      },
      {
        condition: 'a line height is held in a custom property named in pixels',
        files: {
          'src/styles/label.css': '.label {\n  line-height: var(--leading-24px);\n}\n',
        },
      },
      {
        condition: 'the font shorthand sets its size in rem and its line height as a number',
        files: {
          'src/styles/label.css': '.label {\n  font: 1rem/1.5 sans-serif;\n}\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'business-types-readonly',
    reported: [
      {
        condition: "an entity's field can be written in place",
        files: {
          'src/features/orders/domain/entities/order.entity.ts':
            'export interface Order {\n  id: string;\n}\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'compound-parts-share-the-root-context',
    unit: {
      axes: [],
      blocks: [
        'react-dom',
      ],
    },
    reported: [
      {
        condition: 'an object outside a compound has a PascalCase key',
        files: {
          'src/ui/theme.tsx': "export const theme = { Primary: 'blue' };\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a compound attaches its part to its root by Object.assign',
        files: {
          'src/ui/menu.tsx':
            'const MenuRoot = (): React.ReactElement => <ul />;\nconst MenuItem = (): React.ReactElement => <li />;\n\nexport const Menu = Object.assign(MenuRoot, { Item: MenuItem });\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'cache-key-built-by-its-features-factory',
    unit: {
      blocks: [
        'tanstack-query',
      ],
    },
    reported: [
      {
        condition: 'a read writes its key inline',
        files: {
          'src/features/orders/presentation/bindings/queries/list-orders/list-orders.hooks.ts':
            "export const listOrdersOptions = { queryKey: ['orders'] };\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a read takes its key from the key factory',
        files: {
          'src/features/orders/presentation/bindings/queries/list-orders/list-orders.hooks.ts':
            "import { orderKeys } from '../../../../../shared/cache';\n\nexport const listOrdersOptions = { queryKey: orderKeys.all };\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'statements-grouped-by-blank-lines',
    unit: {
      axes: [],
      blocks: [],
    },
    reported: [
      {
        condition: 'a branch follows a declaration with no blank line',
        files: {
          'src/order.ts':
            'export const total = (price: number): number => {\n  const tax = price * 2;\n  if (tax > 1) {\n    return tax;\n  }\n\n  return price;\n};\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a blank line sets the branch apart from the declaration',
        files: {
          'src/order.ts':
            'export const total = (price: number): number => {\n  const tax = price * 2;\n\n  if (tax > 1) {\n    return tax;\n  }\n\n  return price;\n};\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'transition-all-never-used',
    unit: {
      axes: [],
      blocks: [
        'react-dom',
        'tailwind',
      ],
    },
    reported: [
      {
        condition: 'a class list transitions every property',
        files: {
          'src/ui/button.tsx':
            'export function Button(): React.ReactElement {\n  return <button className="transition-all" type="button" />;\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a class list transitions the colours',
        files: {
          'src/ui/button.tsx':
            'export function Button(): React.ReactElement {\n  return <button className="transition-colors" type="button" />;\n}\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'tsx-only-where-markup-is-written',
    reported: [
      {
        condition: 'a .tsx file writes no markup',
        files: {
          'src/ui/order-total.tsx': 'export const orderTotal = 1;\n',
        },
      },
      {
        condition: 'a .tsx file opens with a statement and writes no markup',
        files: {
          'src/ui/order-total.tsx':
            'for (const total of [\n  1,\n]) {\n  console.info(total);\n}\n\nexport const orderTotal = 1;\n',
        },
      },
      {
        condition: 'a .tsx file writes only a generic arrow function',
        files: {
          'src/ui/identity.tsx':
            'export const identity = <TValue,>(value: TValue): TValue => value;\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a .tsx file renders an element',
        files: {
          'src/ui/order-total.tsx':
            'export function OrderTotal(): React.ReactElement {\n  return <p>1</p>;\n}\n',
        },
      },
      {
        condition: 'a .tsx file renders a fragment',
        files: {
          'src/ui/order-total.tsx':
            'export function OrderTotal(): React.ReactElement {\n  return <>1</>;\n}\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'child-process-started-without-a-shell',
    reported: [
      {
        condition: 'a process is started through exec',
        files: {
          'src/listing.ts':
            "import { exec } from 'node:child_process';\n\nexport const list = (): void => {\n  exec('ls');\n};\n",
        },
      },
      {
        condition: "a process is started through execSync of the module's namespace",
        files: {
          'src/listing.ts':
            "import * as childProcess from 'node:child_process';\n\nexport const list = (): void => {\n  childProcess.execSync('ls');\n};\n",
        },
      },
      {
        condition: 'a process is started with shell: true',
        files: {
          'src/listing.ts':
            "import { spawnSync } from 'node:child_process';\n\nexport const list = (): void => {\n  spawnSync('ls', [], { env: {}, shell: true });\n};\n",
        },
      },
      {
        condition: 'a process is started with a shell named by its path',
        files: {
          'src/listing.ts':
            "import { spawnSync } from 'node:child_process';\n\nexport const list = (): void => {\n  spawnSync('ls', [], { env: {}, shell: '/bin/sh' });\n};\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a process is started with its arguments as an array',
        files: {
          'src/listing.ts':
            "import { execFile } from 'node:child_process';\n\nexport const list = (): void => {\n  execFile('ls', ['-l']);\n};\n",
        },
      },
      {
        condition: 'a process is started with shell: false',
        files: {
          'src/listing.ts':
            "import { spawnSync } from 'node:child_process';\n\nexport const list = (): void => {\n  spawnSync('ls', [], { env: {}, shell: false });\n};\n",
        },
      },
      {
        condition: 'a regular expression is executed',
        files: {
          'src/listing.ts':
            "import { execFile } from 'node:child_process';\n\nexport const firstOf = (text: string): string | undefined => /a/.exec(text)?.[0];\n\nexport { execFile };\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'child-process-given-an-env-of-its-own',
    reported: [
      {
        condition: 'a process is left to inherit process.env',
        files: {
          'src/listing.ts':
            "import { spawnSync } from 'node:child_process';\n\nexport const list = (): void => {\n  spawnSync('ls', []);\n};\n",
        },
      },
      {
        condition: 'options name no env',
        files: {
          'src/listing.ts':
            "import { execFileSync } from 'node:child_process';\n\nexport const list = (): void => {\n  execFileSync('ls', [], { cwd: '/' });\n};\n",
        },
      },
      {
        condition:
          "a process started through the module's namespace is left to inherit process.env",
        files: {
          'src/listing.ts':
            "import * as childProcess from 'node:child_process';\n\nexport const list = (): void => {\n  childProcess.spawnSync('ls', []);\n};\n",
        },
      },
      {
        condition: "Bun's own start is left to inherit its env",
        files: {
          'src/listing.ts': "export const list = (): void => {\n  Bun.spawnSync(['ls']);\n};\n",
        },
      },
      {
        condition: 'a process is given process.env',
        files: {
          'src/listing.ts':
            "import { spawnSync } from 'node:child_process';\n\nexport const list = (): void => {\n  spawnSync('ls', [], { env: process.env });\n};\n",
        },
      },
      {
        condition: 'a process is given a copy of process.env',
        files: {
          'src/listing.ts':
            "import { spawnSync } from 'node:child_process';\n\nexport const list = (): void => {\n  spawnSync('ls', [], { env: { ...process.env, CI: '1' } });\n};\n",
        },
      },
      {
        condition: "a process is given process.env's entries",
        files: {
          'src/listing.ts':
            "import { spawnSync } from 'node:child_process';\n\nexport const list = (): void => {\n  spawnSync('ls', [], { env: Object.fromEntries(Object.entries(process.env)) });\n};\n",
        },
      },
      {
        condition: "Bun's own start is given a copy of Bun.env after a variable of its own",
        files: {
          'src/listing.ts':
            "export const list = (): void => {\n  Bun.spawnSync(['ls'], { env: { CI: '1', ...Bun.env } });\n};\n",
        },
      },
      {
        condition: "Bun's own start is given Bun.env",
        files: {
          'src/listing.ts':
            "export const list = (): void => {\n  Bun.spawnSync({ cmd: ['ls'], env: Bun.env });\n};\n",
        },
      },
      {
        condition: 'a process is given process.env assigned onto an object',
        files: {
          'src/listing.ts':
            "import { spawnSync } from 'node:child_process';\n\nexport const list = (): void => {\n  spawnSync('ls', [], { env: Object.assign({ CI: '1' }, process.env) });\n};\n",
        },
      },
      {
        condition: 'a process is given a clone of process.env under a quoted key',
        files: {
          'src/listing.ts':
            "import { spawnSync } from 'node:child_process';\n\nexport const list = (): void => {\n  spawnSync('ls', [], { 'env': structuredClone(process.env) });\n};\n",
        },
      },
      {
        condition: "a start imported from Bun's module is left to inherit its env",
        files: {
          'src/listing.ts':
            "import { spawn } from 'bun';\n\nexport const list = (): void => {\n  spawn(['ls']);\n};\n",
        },
      },
      {
        condition: 'a start imported under a name of its own is left to inherit process.env',
        files: {
          'src/listing.ts':
            "import { exec as run } from 'node:child_process';\n\nexport const list = (): void => {\n  run('ls');\n};\n",
        },
      },
      {
        condition: "a command of Bun's shell is given no env",
        files: {
          'src/listing.ts':
            'export const list = async (): Promise<void> => {\n  await Bun.$`ls`;\n};\n',
        },
      },
      {
        condition: "a command of Bun's shell is given Bun.env",
        files: {
          'src/listing.ts':
            'export const list = async (): Promise<void> => {\n  await Bun.$`ls`.env(Bun.env);\n};\n',
        },
      },
      {
        condition: "Bun's shell is given process.env for every command",
        files: {
          'src/listing.ts':
            "import { $ } from 'bun';\n\n$.env(process.env);\n\nexport const list = async (): Promise<void> => {\n  await $`ls`;\n};\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a process is given an env built for it',
        files: {
          'src/listing.ts':
            "import { spawnSync } from 'node:child_process';\n\nexport const list = (): void => {\n  spawnSync('ls', [], { env: { CI: '1' } });\n};\n",
        },
      },
      {
        condition: 'a process is given a variable read from process.env',
        files: {
          'src/listing.ts':
            "import { spawnSync } from 'node:child_process';\n\nexport const list = (): void => {\n  spawnSync('ls', [], { env: { PATH: process.env['PATH'] ?? '' } });\n};\n",
        },
      },
      {
        condition: 'an object that starts no process holds process.env',
        files: {
          'src/settings.ts': 'export const settings = { env: process.env };\n',
        },
      },
      {
        condition: 'a process is given the variables picked from process.env',
        files: {
          'src/listing.ts':
            "import { spawnSync } from 'node:child_process';\n\ndeclare const pick: (from: object, names: readonly string[]) => Record<string, string>;\n\nexport const list = (): void => {\n  spawnSync('ls', [], { env: pick(process.env, ['PATH']) });\n};\n",
        },
      },
      {
        condition: 'a function of the module of its own is named like a start of a process',
        files: {
          'src/listing.ts':
            "import { execFileSync } from 'node:child_process';\n\nconst spawnWorker = (name: string): void => {\n  console.info(name);\n};\n\nexport const list = (): void => {\n  spawnWorker('ls');\n  execFileSync('ls', [], { env: { CI: '1' } });\n};\n",
        },
      },
      {
        condition: 'a process is given an env built for it under a quoted key',
        files: {
          'src/listing.ts':
            "import { spawnSync } from 'node:child_process';\n\nexport const list = (): void => {\n  spawnSync('ls', [], { 'env': { CI: '1' } });\n};\n",
        },
      },
      {
        condition: "a command of Bun's shell is given an env built for it",
        files: {
          'src/listing.ts':
            "export const list = async (): Promise<void> => {\n  await Bun.$`ls`.env({ CI: '1' });\n};\n",
        },
      },
      {
        condition: "Bun's shell is given an env built for it for every command",
        files: {
          'src/listing.ts':
            "import { $ } from 'bun';\n\n$.env({ PATH: process.env['PATH'] ?? '' });\n\nexport const list = async (): Promise<void> => {\n  await $`ls`;\n};\n",
        },
      },
      {
        condition: "a function of the module of its own bears a start's name beside child_process",
        files: {
          'src/listing.ts':
            "import { execFileSync } from 'node:child_process';\n\nconst exec = (command: string): void => {\n  console.info(command);\n};\n\nexport const list = (): void => {\n  exec('ls');\n  execFileSync('ls', [], { env: { CI: '1' } });\n};\n",
        },
      },
      {
        condition: "a tag of the module of its own is named like Bun's shell beside child_process",
        files: {
          'src/listing.ts':
            "import { execFileSync } from 'node:child_process';\n\nconst $ = (parts: TemplateStringsArray): string => parts.join('');\n\nexport const list = (): string => {\n  execFileSync('ls', [], { env: { CI: '1' } });\n\n  return $`ls`;\n};\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'boundary-values-unknown-until-parsed',
    reported: [
      {
        condition: 'parsed JSON is cast to a type',
        files: {
          'src/order.ts':
            'interface Order {\n  readonly id: string;\n}\n\nexport const orderOf = (text: string): Order => JSON.parse(text) as Order;\n',
        },
      },
      {
        condition: 'parsed JSON is cast to a type through unknown',
        files: {
          'src/order.ts':
            'interface Order {\n  readonly id: string;\n}\n\nexport const orderOf = (text: string): Order => JSON.parse(text) as unknown as Order;\n',
        },
      },
      {
        condition: 'parsed JSON is given a type by its declaration',
        files: {
          'src/order.ts':
            'interface Order {\n  readonly id: string;\n}\n\nexport const orderOf = (text: string): Order => {\n  const order: Order = JSON.parse(text);\n\n  return order;\n};\n',
        },
      },
      {
        condition: "a response's body is cast to a type",
        files: {
          'src/order.ts':
            'interface Order {\n  readonly id: string;\n}\n\nexport const orderOf = async (response: Response): Promise<Order> =>\n  (await response.json()) as Order;\n',
        },
      },
      {
        condition: "a response's body is cast as a promise of a type",
        files: {
          'src/order.ts':
            'interface Order {\n  readonly id: string;\n}\n\nexport const orderOf = (response: Response): Promise<Order> =>\n  response.json() as Promise<Order>;\n',
        },
      },
      {
        condition: "a client's body is read with a type argument",
        files: {
          'src/order.ts':
            'interface Order {\n  readonly id: string;\n}\n\ninterface Client {\n  readonly json: <TBody>() => Promise<TBody>;\n}\n\nexport const orderOf = (client: Client): Promise<Order> => client.json<Order>();\n',
        },
      },
      {
        condition: 'parsed JSON is asserted to a type by angle brackets',
        files: {
          'src/order.ts':
            'interface Order {\n  readonly id: string;\n}\n\nexport const orderOf = (text: string): Order => <Order>JSON.parse(text);\n',
        },
      },
      {
        condition: 'parsed JSON is said to satisfy a type',
        files: {
          'src/order.ts':
            'interface Order {\n  readonly id: string;\n}\n\nexport const orderOf = (text: string): Order => JSON.parse(text) satisfies Order;\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'parsed JSON is typed unknown',
        files: {
          'src/order.ts':
            'export const parsedOf = (text: string): unknown => {\n  const parsed: unknown = JSON.parse(text);\n\n  return parsed;\n};\n',
        },
      },
      {
        condition: "a client's body is read as unknown",
        files: {
          'src/order.ts':
            'interface Client {\n  readonly json: <TBody>() => Promise<TBody>;\n}\n\nexport const bodyOf = (client: Client): Promise<unknown> => client.json<unknown>();\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'duration-measured-by-performance-now',
    reported: [
      {
        condition: 'a duration is the difference of two Date.now() readings',
        files: {
          'src/timing.ts':
            'const startedAt = Date.now();\n\nexport const elapsed = (): number => Date.now() - startedAt;\n',
        },
      },
      {
        condition: 'a duration is the difference of two Date readings',
        files: {
          'src/timing.ts':
            'const startedAt = new Date().getTime();\n\nexport const elapsed = (): number => new Date().getTime() - startedAt;\n',
        },
      },
      {
        condition: "a duration is taken from a class's field that holds a Date.now() reading",
        files: {
          'src/timing.ts':
            'export class Job {\n  readonly startedAt = Date.now();\n\n  elapsed(): number {\n    return Date.now() - this.startedAt;\n  }\n}\n',
        },
      },
      {
        condition: 'a duration is the difference of two Temporal.Now readings',
        files: {
          'src/timing.ts':
            'const startedAt = Temporal.Now.instant();\n\nexport const elapsed = (): Temporal.Duration => Temporal.Now.instant().since(startedAt);\n',
        },
      },
      {
        condition: 'a function times its work by a Date.now() reading it assigns',
        files: {
          'src/timing.ts':
            'export const time = (work: () => void): number => {\n  let start = 0;\n\n  start = Date.now();\n  work();\n\n  return Date.now() - start;\n};\n',
        },
      },
      {
        condition: 'a loop times each job by a Date.now() reading of its own',
        files: {
          'src/timing.ts':
            'export const timesOf = (jobs: readonly (() => void)[]): readonly number[] => {\n  const times: number[] = [];\n\n  for (const job of jobs) {\n    const start = Date.now();\n\n    job();\n    times.push(Date.now() - start);\n  }\n\n  return times;\n};\n',
        },
      },
      {
        condition: 'a try block times its work by a Date.now() reading of its own',
        files: {
          'src/timing.ts':
            "export const time = (work: () => void): number => {\n  try {\n    const start = Date.now();\n\n    work();\n\n    return Date.now() - start;\n  } finally {\n    console.info('timed');\n  }\n};\n",
        },
      },
      {
        condition: 'a duration is taken from a field a method sets to a Date.now() reading',
        files: {
          'src/timing.ts':
            'export class Job {\n  private startedAt = 0;\n\n  begin(): void {\n    this.startedAt = Date.now();\n  }\n\n  elapsed(): number {\n    return Date.now() - this.startedAt;\n  }\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the age of a stored wall-clock time is taken from the wall clock',
        files: {
          'src/timing.ts':
            'export const ageOf = (modifiedAt: number): number => Date.now() - modifiedAt;\n',
        },
      },
      {
        condition: 'the age of a stored instant is taken from Temporal.Now',
        files: {
          'src/timing.ts':
            'export const ageOf = (modifiedAt: Temporal.Instant): Temporal.Duration =>\n  Temporal.Now.instant().since(modifiedAt);\n',
        },
      },
      {
        condition: 'a duration is the difference of two performance.now() readings',
        files: {
          'src/timing.ts':
            'const startedAt = performance.now();\n\nexport const elapsed = (): number => performance.now() - startedAt;\n',
        },
      },
      {
        condition:
          'the age of a parameter is taken from the wall clock beside a function that names its own reading alike',
        files: {
          'src/timing.ts':
            'export const stamp = (): number => {\n  const start = Date.now();\n\n  return start;\n};\n\nexport const ageOf = (start: number): number => Date.now() - start;\n',
        },
      },
      {
        condition:
          "the age of a class's field is taken from the wall clock beside another class whose field alike holds a reading",
        files: {
          'src/timing.ts':
            'export class Clock {\n  readonly started = Date.now();\n}\n\nexport class Job {\n  constructor(private readonly started: number) {}\n\n  age(): number {\n    return Date.now() - this.started;\n  }\n}\n',
        },
      },
    ],
  },
];

beforeAll(lintRegistered, LINT_TIMEOUT);

describe("the GritQL plugins of Biome's presets", () => {
  it('should hold a row for each plugin file when the presets give a plugin', () => {
    // Act
    const unnamed = pluginsWithNoRow(pluginRows);

    // Assert
    expect(unnamed).toStrictEqual([]);
  });

  it.each(reportedCases(pluginRows))('should report $slug when $condition', ({ project, slug }) => {
    // Act
    const plugins = pluginsOf(project);

    // Assert
    expect(plugins).toContain(slug);
  });

  it.each(allowedCases(pluginRows))(
    'should report no $slug finding when $condition',
    ({ project, slug }) => {
      // Act
      const plugins = pluginsOf(project);

      // Assert
      expect(plugins).not.toContain(slug);
    },
  );
});
