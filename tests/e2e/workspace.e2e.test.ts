import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'bun:test';

import { miseBinary } from './mise.fixtures';
import { uvBinary } from './uv.fixtures';
import {
  commitBase,
  createWorkspace,
  cruiserOf,
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

const DEPENDENCY_CRUISER = `export default {
  extends: ${JSON.stringify(
    [
      'self',
      'core',
      'typescript',
      'architecture/workspace',
    ].map((part) => `./${PRESETS}/dependency-cruiser/${part}.mjs`),
  )},
};
`;

// Each TypeScript package's own parts, from its folder, its blocks' parts before the language's and core's.
const CRUISER_PARTS = [
  'self',
  'bun',
  'core',
  'typescript',
  'architecture/core',
];

const LS_LINT = miseBinary('ls-lint');
const LS_LINT_PARTS: Readonly<Record<string, readonly string[]>> = {
  python: [
    'common/ls-lint/self',
    'common/ls-lint/core',
    'common/ls-lint/uv',
    'python/ls-lint/python',
    'python/ls-lint/architecture/core',
  ],
  typescript: [
    'common/ls-lint/self',
    'common/ls-lint/core',
    'common/ls-lint/bun',
    'typescript/ls-lint/typescript',
    'typescript/ls-lint/architecture/core',
  ],
};

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

const lsLintArgs = (input: { folder: string; language: string }): string[] =>
  (LS_LINT_PARTS[input.language] ?? []).flatMap((part) => [
    '--config',
    `${'../'.repeat(depthOf(input.folder))}.droneey/constitution/presets/${part}.yaml`,
  ]);

const STRYKER = `import bunTest from '../../${PRESETS}/stryker/bun-test.mjs';
import core from '../../${PRESETS}/stryker/core.mjs';
import self from '../../${PRESETS}/stryker/self.mjs';

export default {
  ...self,
  ...bunTest,
  ...core,
  plugins: ['${join(REPOSITORY, 'tools', 'mutation-check', 'src', 'runner.ts')}'],
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
        'test',
      ],
      folder: 'packages/web',
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
      folder: 'libs/money',
      program: 'bun',
    });

    // Assert
    expect(passed).toBe(true);
  });

  it("should report no unused file when knip takes the root's parts under its workspace", () => {
    // Arrange
    const folder = workspace();

    // Act
    const { output, passed } = runTool(folder, {
      args: [
        '--config',
        'knip.config.mjs',
        '--no-config-hints',
      ],
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
    const { passed } = runTool(folder, {
      args: [
        'check',
        '--config-path=biome.packages-api.jsonc',
        'packages/api',
      ],
      program: 'biome',
    });

    // Assert
    expect(passed).toBe(true);
  });

  it('should report units-imported-by-name when shared imports a unit by a path into its folder', () => {
    // Arrange
    const folder = workspace({
      '.dependency-cruiser.mjs': DEPENDENCY_CRUISER,
      'libs/money/src/kernel/index.ts': 'export const ZERO = 0;\n',
      'shared/src/kernel/price.ts':
        "import { ZERO } from '../../../libs/money/src/kernel/index.ts';\n\nexport const price = ZERO;\n",
    });

    // Act
    const { output } = runTool(folder, {
      args: [
        'packages',
        'shared',
        'libs',
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
      'packages/web/package.json': manifestOf({
        dependencies: [
          '@shop/shared',
          'x-api',
        ],
        name: '@shop/web',
      }),
      'packages/web/src/features/labels/app/fetch-label.ts':
        "import { get } from 'x-api';\n\nexport const fetchLabel = get;\n",
    });

    // Act
    const { output } = runTool(folder, {
      args: [
        'src',
        '--config',
        '.dependency-cruiser.mjs',
      ],
      folder: 'packages/web',
      program: 'depcruise',
    });

    // Assert
    expect(output).toContain('not-in-allowed: src/features/labels/app/fetch-label.ts');
  });

  it('should pass names when ls-lint checks each package from its folder by its language parts', () => {
    // Arrange
    const folder = workspace();
    const packages = [
      ...Object.values(UNITS).map((unit) => ({
        folder: unit,
        language: 'typescript',
      })),
      ...PYTHON_PACKAGES.map((unit) => ({
        folder: unit,
        language: 'python',
      })),
    ];

    // Act
    const runs = packages.map((unit) => ({
      unit: unit.folder,
      ...runTool(folder, {
        args: lsLintArgs(unit),
        folder: unit.folder,
        program: LS_LINT,
      }),
    }));

    // Assert
    expect(runs.filter(({ passed }) => !passed)).toStrictEqual([]);
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
      'packages/reports/src/shop_reports/adapters/__init__.py': '',
      'packages/reports/src/shop_reports/adapters/log/__init__.py': '',
      'packages/reports/src/shop_reports/adapters/log/log_adapter.py': 'import structlog\n',
    });

    // Act
    const { output } = runTool(folder, {
      args: [
        'src',
      ],
      folder: 'packages/reports',
      program: uvBinary('python-check'),
    });

    // Assert
    expect(output).toContain('structlog is imported in adapters/log, outside its home: root');
  });

  it('should mutate the changed line of a unit when the mutation check runs from its folder', () => {
    // Arrange
    const folder = workspace({
      'packages/web/bunfig.mutation.toml':
        '[test]\nroot = "./src"\npathIgnorePatterns = ["**/main.test.*"]\ncoverage = false\n',
      'packages/web/stryker.config.mjs': STRYKER,
    });

    commitBase(folder);
    write({
      files: {
        'packages/web/src/features/labels/app/label.ts':
          "import { describeOrder, type OrderId } from '@shop/shared';\n\nexport const label = (id: OrderId): string => `Ordered ${describeOrder({ id, total: 0 })}`;\n",
        'packages/web/src/features/labels/app/__tests__/label.test.ts':
          "import { expect, it } from 'bun:test';\n\nimport type { OrderId } from '@shop/shared';\n\nimport { label } from '../label';\n\nit('should name the order when an order is labelled', () => {\n  // Act\n  const text = label('a' as OrderId);\n\n  // Assert\n  expect(text).toBe('Ordered order:a');\n});\n",
      },
      folder,
    });

    // Act
    const { output, passed } = runTool(folder, {
      args: [
        join(REPOSITORY, 'tools', 'mutation-check', 'src', 'main.ts'),
      ],
      folder: 'packages/web',
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
