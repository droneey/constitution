import { describe, expect, test } from 'bun:test';

import { specsByFile } from '../loaded.ts';

const IMPORTS: Readonly<Record<string, readonly string[]>> = {
  'src/__tests__/order.test.ts': [
    'src/order.ts',
  ],
  'src/__tests__/shop.test.ts': [
    'src/shop.ts',
    'src/price.ts',
  ],
  'src/order.ts': [
    'src/price.ts',
  ],
  'src/price.ts': [
    'src/order.ts',
  ],
  'src/shop.ts': [
    'src/price.ts',
    'src/order.ts',
  ],
};

const importsOf = (path: string): readonly string[] => IMPORTS[path] ?? [];

describe('the specs of each file', () => {
  test('should list every spec whose imports reach the file, the nearest first', () => {
    expect(
      specsByFile({
        importsOf,
        specs: [
          'src/__tests__/order.test.ts',
          'src/__tests__/shop.test.ts',
        ],
      }),
    ).toStrictEqual(
      new Map([
        [
          'src/order.ts',
          [
            'src/__tests__/order.test.ts',
            'src/__tests__/shop.test.ts',
          ],
        ],
        [
          'src/price.ts',
          [
            'src/__tests__/shop.test.ts',
            'src/__tests__/order.test.ts',
          ],
        ],
        [
          'src/shop.ts',
          [
            'src/__tests__/shop.test.ts',
          ],
        ],
      ]),
    );
  });
});
