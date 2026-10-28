import { symlinkSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'bun:test';

import { isFoundIn } from './python-template.fixtures';
import { uvBinary } from './uv.fixtures';
import {
  commitBase,
  createWorkspace,
  manifestOf,
  PYTHON_PACKAGES,
  removeWorkspace,
  repository,
  runTool,
  UNITS,
  write,
} from './workspace.fixtures';

const workspaces: string[] = [];

const workspace = (changes?: Parameters<typeof createWorkspace>[0]): string => {
  const folder = createWorkspace(changes);

  workspaces.push(folder);

  return folder;
};

afterEach(() => {
  for (const folder of workspaces.splice(0)) {
    removeWorkspace(folder);
  }
});

const CRUISER = '.dependency-cruiser.jsonc';

describe('a workspace on the presets', () => {
  it('should check the types of every unit when tsc builds the units as projects from the root', () => {
    // Arrange
    const folder = workspace();

    // Act
    const { output, passed } = runTool(folder, {
      args: [
        '-b',
      ],
      program: 'tsc',
    });

    // Assert
    expect({
      output,
      passed,
    }).toStrictEqual({
      output: '',
      passed: true,
    });
  });

  it("should hold the coverage gate when a unit's test script runs and the unit calls only part of a unit it imports", () => {
    // Arrange
    const folder = workspace();

    // Act
    const { passed } = runTool(folder, {
      args: [
        'run',
        'test',
      ],
      folder: 'apps/web',
      program: 'bun',
    });

    // Assert
    expect(passed).toBe(true);
  });

  it("should fail a unit's test script when a file a spec loads holds a function no spec calls", () => {
    // Arrange
    const folder = workspace({
      'apps/web/src/features/labels/app/label.ts': `import { describeOrder, type OrderId } from '@shop/orders';

export const label = (id: OrderId): string => \`Order \${describeOrder({ id, total: 0 })}\`;

export const shortLabel = (id: OrderId): string => \`#\${id}\`;
`,
    });

    // Act
    const { passed } = runTool(folder, {
      args: [
        'run',
        'test',
      ],
      folder: 'apps/web',
      program: 'bun',
    });

    // Assert
    expect(passed).toBe(false);
  });

  it('should pass the specs when a unit holds only types', () => {
    // Arrange
    const folder = workspace();

    // Act
    const { passed } = runTool(folder, {
      args: [
        'test',
        '--pass-with-no-tests',
      ],
      folder: 'packages/money',
      program: 'bun',
    });

    // Assert
    expect(passed).toBe(true);
  });

  it.each([
    '.',
    ...Object.values(UNITS),
  ])('should report no unused file when knip runs in %s by its own configuration', (unit) => {
    // Arrange
    const folder = workspace();

    // Act
    const { output, passed } = runTool(folder, {
      args: [
        '--no-config-hints',
      ],
      folder: unit,
      program: 'knip',
    });

    // Assert
    expect({
      output,
      passed,
    }).toStrictEqual({
      output: '',
      passed: true,
    });
  });

  it('should report no unused dependency in production when an integration imports an optional peer', () => {
    // Arrange
    const folder = workspace();

    // Act
    const { output, passed } = runTool(folder, {
      args: [
        '--strict',
        '--no-config-hints',
      ],
      folder: 'packages/@eros/typescript',
      program: 'knip',
    });

    // Assert
    expect({
      output,
      passed,
    }).toStrictEqual({
      output: '',
      passed: true,
    });
  });

  it("should leave the compiler's declarations out when Biome checks a unit by its own configuration", () => {
    // Arrange
    const folder = workspace();

    runTool(folder, {
      args: [
        '-b',
      ],
      program: 'tsc',
    });

    // Act
    const { output } = runTool(folder, {
      args: [
        'check',
        '--max-diagnostics=none',
        '.',
      ],
      folder: 'apps/api',
      program: 'biome',
    });

    // Assert
    expect({
      isChecked: output.includes('Checked'),
      readsDeclarations: output.includes('.tsc-cache'),
    }).toStrictEqual({
      isChecked: true,
      readsDeclarations: false,
    });
  });

  it('should report other-unit-reached-by-its-name when a package imports another by a path into its folder', () => {
    // Arrange
    const folder = workspace({
      'packages/money/src/kernel/constants/index.ts': 'export const ZERO = 0;\n',
      'packages/orders/src/kernel/constants/price.constants.ts':
        "import { ZERO } from '../../../../../packages/money/src/kernel/constants/index.ts';\n\nexport const price = ZERO;\n",
    });

    // Act
    const { output } = runTool(folder, {
      args: [
        'src',
        '--config',
        CRUISER,
      ],
      folder: 'packages/orders',
      program: 'depcruise',
    });

    // Assert
    expect(output).toContain('other-unit-reached-by-its-name');
  });

  it.each([
    {
      folder: 'apps/web',
      reported: true,
    },
    {
      folder: 'packages/orders',
      reported: false,
    },
  ])(
    'should report apps-blind-to-each-other only in an app when $folder reaches a unit beside it',
    ({ folder: unit, reported }) => {
      // Arrange
      const folder = workspace({
        'apps/web/src/kernel/constants/total.constants.ts':
          "import { totalLine } from '../../../../api/src/features/totals/index.ts';\n\nexport const total = totalLine;\n",
        'packages/money/src/kernel/constants/index.ts': 'export const ZERO = 0;\n',
        'packages/orders/src/kernel/constants/zero.constants.ts':
          "import { ZERO } from '../../../../money/src/kernel/constants/index.ts';\n\nexport const zero = ZERO;\n",
      });

      // Act
      const { output } = runTool(folder, {
        args: [
          'src',
          '--config',
          CRUISER,
        ],
        folder: unit,
        program: 'depcruise',
      });

      // Assert
      expect({
        isApps: output.includes('apps-blind-to-each-other'),
        isOther: output.includes('other-unit-reached-by-its-name'),
      }).toStrictEqual({
        isApps: reported,
        isOther: true,
      });
    },
  );

  it.each([
    {
      condition: 'an app outside its group by its name',
      reached: "import { main } from '@shop/web/src/main.ts';\n\nexport const reached = main;\n",
      reported: true,
    },
    {
      condition: 'an app of its own group by its name',
      reached: "import { main } from '@shop/desk-admin';\n\nexport const reached = main;\n",
      reported: true,
    },
    {
      condition: 'the package of the data its group shares by its name',
      reached:
        "import queues from '@shop/desk-shared/schema/queues.yaml';\n\nexport const reached: unknown = queues;\n",
      reported: false,
    },
  ])(
    'should report apps-blind-to-each-other only when an app of a group imports $condition',
    ({ reached, reported }) => {
      // Arrange
      const folder = workspace({
        'apps/@desk/admin/package.json': manifestOf({
          exports: {
            '.': './src/main.ts',
          },
          name: '@shop/desk-admin',
        }),
        'apps/@desk/admin/src/main.ts': 'export const main = (): number => 1;\n',
        'apps/@desk/web/src/kernel/constants/reached.constants.ts': reached,
      });

      // A second app of the group, linked by its name as an install links it.
      symlinkSync(
        join(folder, 'apps', '@desk', 'admin'),
        join(folder, 'node_modules', '@shop', 'desk-admin'),
      );

      // Act
      const { output } = runTool(folder, {
        args: [
          'src',
          '--config',
          CRUISER,
        ],
        folder: 'apps/@desk/web',
        program: 'depcruise',
      });

      // Assert
      expect(output.includes('apps-blind-to-each-other')).toBe(reported);
    },
  );

  it.each(Object.values(UNITS))(
    'should report no violation when %s is cruised from its folder by its own configuration',
    (unit) => {
      // Arrange
      const folder = workspace();

      // Act
      const { passed } = runTool(folder, {
        args: [
          'src',
          '--config',
          CRUISER,
        ],
        folder: unit,
        program: 'depcruise',
      });

      // Assert
      expect(passed).toBe(true);
    },
  );

  it('should report not-in-allowed when a binding unit imports a package built into its dist/ and cruised from its folder', () => {
    // Arrange
    const folder = workspace({
      'apps/web/package.json': manifestOf({
        dependencies: [
          '@shop/orders',
          'x-api',
        ],
        name: '@shop/web',
      }),
      'apps/web/src/features/labels/app/fetch-label.ts':
        "import { get } from 'x-api';\n\nexport const fetchLabel = get;\n",
    });

    // Act
    const { output } = runTool(folder, {
      args: [
        'src',
        '--config',
        CRUISER,
      ],
      folder: 'apps/web',
      program: 'depcruise',
    });

    // Assert
    expect(output).toContain('not-in-allowed: src/features/labels/app/fetch-label.ts');
  });

  it.each([
    ...PYTHON_PACKAGES,
  ])('should find nothing when python-check reads %s from its folder', (unit) => {
    // Arrange
    const folder = workspace();

    // Act
    const { passed } = runTool(folder, {
      args: [
        'src',
      ],
      folder: unit,
      program: uvBinary('python-check'),
    });

    // Assert
    expect(passed).toBe(true);
  });

  it('should report the home a preset file gives when an adapter of a Python package imports structlog', () => {
    // Arrange
    const folder = workspace({
      'apps/reports/src/shop_reports/adapters/__init__.py': '',
      'apps/reports/src/shop_reports/adapters/log/__init__.py': '',
      'apps/reports/src/shop_reports/adapters/log/log_adapter.py': 'import structlog\n',
    });

    // Act
    const { output } = runTool(folder, {
      args: [
        'src',
      ],
      folder: 'apps/reports',
      program: uvBinary('python-check'),
    });

    // Assert
    expect(
      isFoundIn({
        finding: [
          'structlog',
          'adapters/log',
          'root',
        ],
        output,
      }),
    ).toBe(true);
  });

  it('should mutate the changed line of a unit when the mutation check runs from its folder', () => {
    // Arrange
    const folder = workspace();

    commitBase(folder);
    write({
      files: {
        'apps/web/src/features/labels/app/label.ts':
          "import { describeOrder, type OrderId } from '@shop/orders';\n\nexport const label = (id: OrderId): string => `Ordered ${describeOrder({ id, total: 0 })}`;\n",
        'apps/web/src/features/labels/app/__tests__/label.test.ts':
          "import { expect, it } from 'bun:test';\n\nimport type { OrderId } from '@shop/orders';\n\nimport { label } from '../label';\n\nit('should name the order when an order is labelled', () => {\n  // Act\n  const text = label('a' as OrderId);\n\n  // Assert\n  expect(text).toBe('Ordered order:a');\n});\n",
      },
      folder,
    });

    // Act
    const { output, passed } = runTool(folder, {
      args: [
        join(repository, 'node_modules', '.bin', 'mutation-check'),
      ],
      folder: 'apps/web',
      program: 'bun',
    });

    // Assert
    expect({
      mutated: output.includes(' label.ts '),
      passed,
    }).toStrictEqual({
      mutated: true,
      passed: true,
    });
  });
});
