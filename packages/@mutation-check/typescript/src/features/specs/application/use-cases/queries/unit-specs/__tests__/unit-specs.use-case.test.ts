import { describe, expect, it } from 'bun:test';

import { UnitRelativePath } from '#/kernel/value-objects';

import { fakeImportGraph } from '../../../../../__tests__/import-graph.fake.ts';
import { fakeSpecRunner } from '../../../../../__tests__/spec-runner.fake.ts';
import { unitSpecs } from '../unit-specs.use-case.ts';

const importGraph = fakeImportGraph({
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
});

const specPaths = [
  UnitRelativePath.create('src/__tests__/order.test.ts'),
  UnitRelativePath.create('src/__tests__/shop.test.ts'),
];

describe('unitSpecs', () => {
  it("should list the unit's specs, and for each file the specs whose imports reach it, the nearest first", () => {
    // Act
    const specs = unitSpecs({
      importGraph,
      specRunner: fakeSpecRunner({
        specPaths,
      }),
    });

    // Assert
    expect(specs).toStrictEqual({
      specPaths,
      specPathsByFilePath: new Map([
        [
          UnitRelativePath.create('src/order.ts'),
          [
            UnitRelativePath.create('src/__tests__/order.test.ts'),
            UnitRelativePath.create('src/__tests__/shop.test.ts'),
          ],
        ],
        [
          UnitRelativePath.create('src/price.ts'),
          [
            UnitRelativePath.create('src/__tests__/shop.test.ts'),
            UnitRelativePath.create('src/__tests__/order.test.ts'),
          ],
        ],
        [
          UnitRelativePath.create('src/shop.ts'),
          [
            UnitRelativePath.create('src/__tests__/shop.test.ts'),
          ],
        ],
      ]),
    });
  });
});
