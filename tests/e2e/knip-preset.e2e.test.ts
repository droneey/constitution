import { describe, expect, it } from 'bun:test';

import { unusedCode } from './knip-preset.fixtures';

const ENTITIES = 'src/features/orders/domain/entities';

const WIRED = {
  [`${ENTITIES}/index.ts`]: "export { order, draft } from './order.entity';\n",
  [`${ENTITIES}/order.entity.ts`]:
    'export const order = 1;\nexport const draft = 2;\n',
  'src/entrypoints/run/main.ts':
    "import { order } from '../../features/orders';\nconsole.log(order);\n",
  'src/features/orders/index.ts':
    "export { draft, order } from './domain/entities';\n",
};

describe('the knip preset', () => {
  it('should report a file when nothing imports it', () => {
    // Arrange
    const project = {
      files: {
        ...WIRED,
        [`${ENTITIES}/lonely.entity.ts`]: 'export const lonely = 1;\n',
      },
    };

    // Act
    const { files } = unusedCode(project);

    // Assert
    expect(files).toStrictEqual([
      `${ENTITIES}/lonely.entity.ts`,
    ]);
  });

  it('should report only the unoffered export when a file exports more than its surface offers', () => {
    // Arrange
    const project = {
      files: {
        ...WIRED,
        [`${ENTITIES}/order.entity.ts`]:
          'export const order = 1;\nexport const draft = 2;\nexport const hidden = 3;\n',
      },
    };

    // Act
    const { exports } = unusedCode(project);

    // Assert
    expect(exports).toStrictEqual([
      'hidden',
    ]);
  });

  it('should report a file in production when only its specs reach it', () => {
    // Arrange
    const project = {
      files: {
        ...WIRED,
        [`${ENTITIES}/__tests__/order.fixtures.ts`]:
          'export const anOrder = 1;\n',
        [`${ENTITIES}/__tests__/total.utils.test.ts`]:
          "import { expect, test } from 'bun:test';\nimport { anOrder } from './order.fixtures';\nimport { total } from '../total.utils';\ntest('total', () => {\n  expect(total(anOrder)).toBe(1);\n});\n",
        [`${ENTITIES}/total.utils.ts`]:
          'export const total = (value: number): number => value;\n',
      },
      production: true,
    };

    // Act
    const { files } = unusedCode(project);

    // Assert
    expect(files).toStrictEqual([
      `${ENTITIES}/total.utils.ts`,
    ]);
  });

  it('should report nothing when every file and export is used', () => {
    // Arrange
    const project = {
      files: WIRED,
    };

    // Act
    const unused = unusedCode(project);

    // Assert
    expect(unused).toStrictEqual({
      binaries: [],
      exports: [],
      files: [],
    });
  });

  it.each([
    {
      binary: 'betterleaks',
      part: 'typescript/foundation/betterleaks',
    },
    {
      binary: 'ls-lint',
      part: 'typescript/foundation/ls-lint',
    },
    {
      binary: 'mise',
      part: 'typescript/foundation/mise',
    },
    {
      binary: 'osv-scanner',
      part: 'typescript/foundation/osv-scanner',
    },
    {
      binary: 'lefthook',
      part: 'typescript/workflow/lefthook',
    },
  ])(
    'should report no missing binary when a script runs $binary and the project joins $part',
    ({ binary, part }) => {
      // Arrange
      const project = {
        files: WIRED,
        parts: [
          part,
        ],
        scripts: {
          tool: binary,
        },
      };

      // Act
      const { binaries } = unusedCode(project);

      // Assert
      expect(binaries).toStrictEqual([]);
    },
  );

  it('should report a missing binary when a script runs a tool whose part the project does not join', () => {
    // Arrange
    const project = {
      files: WIRED,
      scripts: {
        tool: 'osv-scanner',
      },
    };

    // Act
    const { binaries } = unusedCode(project);

    // Assert
    expect(binaries).toStrictEqual([
      'osv-scanner',
    ]);
  });
});
