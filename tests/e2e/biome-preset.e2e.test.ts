import { describe, expect, it } from 'bun:test';

import { blockCode, lintFindings, presetWords } from './biome-preset.fixtures';

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
      condition: 'a function takes a second positional argument',
      files: {
        'src/main.ts':
          'export const join = (head: string, tail: string): string => head + tail;\n',
      },
      message: 'Name every argument past the first',
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
    'should report no plugin finding when $condition and a project extends only the base part',
    ({ files }) => {
      // Arrange
      const project = {
        files,
        parts: [
          'base',
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
