import { describe, expect, test } from 'bun:test';

import { codeChanged } from '../code-changed.ts';

const BEFORE = 'export const total = 1;\nexport const count = 2;\n';

describe('codeChanged', () => {
  test.each([
    {
      after: 'export const total = 1;\nexport const count = 3;\n',
      before: BEFORE,
      changed: true,
      condition: 'a line of code changes',
      path: 'src/order.ts',
    },
    {
      after: 'export const total = 1;\n\nexport const count = 2;\n',
      before: BEFORE,
      changed: false,
      condition: 'the change only reformats',
      path: 'src/order.ts',
    },
    {
      after: 'export const rate = <number>value;\n\n',
      before: 'export const rate = <number>value;\n',
      changed: false,
      condition: 'the change only reformats a cast only TypeScript reads',
      path: 'src/rate.ts',
    },
    {
      after: 'export const total = 1;\n\nexport const count = 2;\n',
      before: BEFORE,
      changed: true,
      condition: 'Bun cannot transpile the file',
      path: 'src/order.json',
    },
  ])('should tell whether the code changed when $condition', ({ after, before, changed, path }) => {
    // Act
    const told = codeChanged({
      after,
      before,
      path,
    });

    // Assert
    expect(told).toBe(changed);
  });
});
