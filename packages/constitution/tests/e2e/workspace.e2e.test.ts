import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it } from 'bun:test';

import { configFromTemplate } from './dependency-cruiser-preset.fixtures';
import { isFoundIn } from './python-template.fixtures';
import { uvBinary } from './uv.fixtures';
import {
  commitBase,
  createWorkspace,
  cruiserOf,
  inAxis,
  manifestOf,
  PRESETS,
  PYTHON_PACKAGES,
  REPOSITORY,
  removeWorkspace,
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

const DEPENDENCY_CRUISER = configFromTemplate(
  [
    'self',
    'core',
    'typescript',
    'architecture/workspace',
  ].map((part) => `./${PRESETS}/dependency-cruiser/${inAxis(part)}.mjs`),
);

// Each TypeScript package's own parts, from its folder, in the order ratify computes them.
const CRUISER_PARTS = [
  'self',
  'core',
  'typescript',
  'bun',
  'architecture/core',
];

const depthOf = (folder: string): number => folder.split('/').length;

const cruisers = Object.fromEntries(
  Object.values(UNITS).map((folder) => [
    `${folder}/.dependency-cruiser.mjs`,
    cruiserOf({
      depth: depthOf(folder),
      parts: CRUISER_PARTS,
    }),
  ]),
);

const STRYKER = `import bunTest from '../../${PRESETS}/stryker/foundation/bun-test.mjs';
import core from '../../${PRESETS}/stryker/foundation/core.mjs';
import self from '../../${PRESETS}/stryker/foundation/self.mjs';

export default {
  ...self,
  ...bunTest,
  ...core,
  plugins: [
    '${fileURLToPath(import.meta.resolve('@droneey/mutation-check/runner'))}',
    '${fileURLToPath(import.meta.resolve('@droneey/mutation-check/ignorers'))}',
  ],
};
`;

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

  it('should hold the coverage gate when a unit calls only part of a unit it imports', () => {
    // Arrange
    const folder = workspace();

    // Act
    const { passed } = runTool(folder, {
      args: [
        '--config=./bunfig.integration.toml',
        'test',
      ],
      folder: 'apps/web',
      program: 'bun',
    });

    // Assert
    expect(passed).toBe(true);
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
        '--config',
        'knip.config.mjs',
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
        '--config',
        'knip.config.mjs',
        '--strict',
        '--no-config-hints',
      ],
      folder: 'packages/eros/languages/typescript',
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

  it("should check a unit by its own configuration, its compiler's declarations left out, when Biome runs from the root", () => {
    // Arrange
    const folder = workspace();

    runTool(folder, {
      args: [
        '-b',
      ],
      program: 'tsc',
    });

    // Act
    const { passed } = runTool(folder, {
      args: [
        'check',
        'apps/api',
      ],
      program: 'biome',
    });

    // Assert
    expect(passed).toBe(true);
  });

  it('should report units-imported-by-name when a package imports another by a path into its folder', () => {
    // Arrange
    const folder = workspace({
      '.dependency-cruiser.mjs': DEPENDENCY_CRUISER,
      'packages/money/src/kernel/constants/index.ts': 'export const ZERO = 0;\n',
      'packages/orders/src/kernel/constants/price.constants.ts':
        "import { ZERO } from '../../../../../packages/money/src/kernel/constants/index.ts';\n\nexport const price = ZERO;\n",
    });

    // Act
    const { output } = runTool(folder, {
      args: [
        'apps',
        'packages',
        '--config',
        '.dependency-cruiser.mjs',
      ],
      program: 'depcruise',
    });

    // Assert
    expect(output).toContain('units-imported-by-name');
  });

  it('should report no violation when each package is cruised from its folder by its own parts', () => {
    // Arrange
    const folder = workspace(cruisers);

    // Act
    const runs = Object.values(UNITS).map((unit) => ({
      unit,
      ...runTool(folder, {
        args: [
          'src',
          '--config',
          '.dependency-cruiser.mjs',
        ],
        folder: unit,
        program: 'depcruise',
      }),
    }));

    // Assert
    expect(runs.filter(({ passed }) => !passed)).toStrictEqual([]);
  });

  it('should report not-in-allowed when a binding unit imports a package built into its dist/ and cruised from its folder', () => {
    // Arrange
    const folder = workspace({
      ...cruisers,
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
        '.dependency-cruiser.mjs',
      ],
      folder: 'apps/web',
      program: 'depcruise',
    });

    // Assert
    expect(output).toContain('not-in-allowed: src/features/labels/app/fetch-label.ts');
  });

  it('should find nothing when python-check reads each Python package from its folder', () => {
    // Arrange
    const folder = workspace();

    // Act
    const runs = PYTHON_PACKAGES.map((unit) => ({
      unit,
      ...runTool(folder, {
        args: [
          'src',
        ],
        folder: unit,
        program: uvBinary('python-check'),
      }),
    }));

    // Assert
    expect(runs.filter(({ passed }) => !passed)).toStrictEqual([]);
  });

  it('should report the home a part gives when an adapter of a Python package imports structlog', () => {
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
    const folder = workspace({
      'apps/web/bunfig.mutation.toml':
        '[test]\nroot = "./src"\npathIgnorePatterns = ["**/main.test.*"]\ncoverage = false\n',
      'apps/web/stryker.config.mjs': STRYKER,
    });

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
        join(REPOSITORY, 'node_modules', '.bin', 'mutation-check'),
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
