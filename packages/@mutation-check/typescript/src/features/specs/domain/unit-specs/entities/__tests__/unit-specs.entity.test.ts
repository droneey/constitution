import { describe, expect, it } from 'bun:test';

import { UnitRelativePath } from '#/kernel/value-objects';

import { UnitSpecs } from '../unit-specs.entity.ts';

const cartSpecPath = UnitRelativePath.create('src/__tests__/cart.test.ts');
const checkoutSpecPath = UnitRelativePath.create('src/__tests__/checkout.test.ts');
const cartPath = UnitRelativePath.create('src/cart.ts');
const checkoutPath = UnitRelativePath.create('src/checkout.ts');
const taxPath = UnitRelativePath.create('src/tax.ts');

describe('UnitSpecs.create', () => {
  it('should give each file the specs whose imports reach it, the nearest first', () => {
    // Act
    const specs = UnitSpecs.create({
      edges: new Map([
        [
          cartSpecPath,
          [
            cartPath,
          ],
        ],
        [
          cartPath,
          [
            taxPath,
          ],
        ],
        [
          checkoutSpecPath,
          [
            taxPath,
            checkoutPath,
          ],
        ],
        [
          checkoutPath,
          [
            cartPath,
          ],
        ],
        [
          taxPath,
          [
            cartPath,
          ],
        ],
      ]),
      specPaths: [
        cartSpecPath,
        checkoutSpecPath,
      ],
    });

    // Assert
    expect(specs).toStrictEqual({
      specPaths: [
        cartSpecPath,
        checkoutSpecPath,
      ],
      specPathsByFilePath: new Map([
        [
          cartPath,
          [
            cartSpecPath,
            checkoutSpecPath,
          ],
        ],
        [
          taxPath,
          [
            checkoutSpecPath,
            cartSpecPath,
          ],
        ],
        [
          checkoutPath,
          [
            checkoutSpecPath,
          ],
        ],
      ]),
    });
  });

  it('should give no file a spec when the specs import nothing', () => {
    // Act
    const specs = UnitSpecs.create({
      edges: new Map(),
      specPaths: [
        cartSpecPath,
      ],
    });

    // Assert
    expect(specs.specPathsByFilePath).toStrictEqual(new Map());
  });
});

describe('UnitSpecs.specPathsFor', () => {
  const unitSpecs: UnitSpecs = {
    specPaths: [
      cartSpecPath,
      checkoutSpecPath,
    ],
    specPathsByFilePath: new Map([
      [
        cartPath,
        [
          cartSpecPath,
          checkoutSpecPath,
        ],
      ],
      [
        taxPath,
        [
          checkoutSpecPath,
          cartSpecPath,
        ],
      ],
    ]),
  };

  it.each([
    {
      condition: 'no file is named',
      filePaths: undefined,
      specPaths: [
        cartSpecPath,
        checkoutSpecPath,
      ],
    },
    {
      condition: 'specs load the files',
      filePaths: [
        cartPath,
        taxPath,
      ],
      specPaths: [
        cartSpecPath,
        checkoutSpecPath,
      ],
    },
    {
      condition: 'a file is nearer to the later spec',
      filePaths: [
        taxPath,
      ],
      specPaths: [
        checkoutSpecPath,
        cartSpecPath,
      ],
    },
    {
      condition: 'no spec loads the files',
      filePaths: [
        checkoutPath,
      ],
      specPaths: [],
    },
  ])(
    'should choose the specs once each, the nearest first, when $condition',
    ({ filePaths, specPaths }) => {
      // Act
      const chosen = UnitSpecs.specPathsFor(unitSpecs, filePaths);

      // Assert
      expect(chosen).toStrictEqual(specPaths);
    },
  );
});
