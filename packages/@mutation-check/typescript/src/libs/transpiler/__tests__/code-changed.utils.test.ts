import { describe, expect, it } from 'bun:test';

import { hasCodeChanged } from '../code-changed.utils.ts';

describe('hasCodeChanged', () => {
  it.each([
    {
      after: 'export const total = 1;\n\nexport const count = 2;\n',
      condition: 'transpile the file by its extension',
      filePath: 'src/order.json',
    },
    {
      after: 'export const total = ;\n',
      condition: 'parse the new text',
      filePath: 'src/order.ts',
    },
  ])('should count the code as changed when Bun cannot $condition', ({ after, filePath }) => {
    // Act
    const isChanged = hasCodeChanged({
      after,
      before: 'export const total = 1;\nexport const count = 2;\n',
      filePath,
    });

    // Assert
    expect(isChanged).toBe(true);
  });

  it.each([
    {
      after: 'export const total = 1;\n\n\nexport const count   =   2;\n',
      condition: 'only the layout differs',
      expected: false,
    },
    {
      after: 'export const total = 1;\nexport const count = 3;\n',
      condition: 'the code differs',
      expected: true,
    },
  ])('should tell whether the code changed when $condition', ({ after, expected }) => {
    // Act
    const isChanged = hasCodeChanged({
      after,
      before: 'export const total = 1;\nexport const count = 2;\n',
      filePath: 'src/order.ts',
    });

    // Assert
    expect(isChanged).toBe(expected);
  });

  it('should tell a file the base never had, which holds only types, from a change of the code', () => {
    // Act
    const isChanged = hasCodeChanged({
      after: 'export type Total = number;\n',
      filePath: 'src/order.ts',
    });

    // Assert
    expect(isChanged).toBe(false);
  });
});
