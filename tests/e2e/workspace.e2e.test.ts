import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'bun:test';

import {
  commitBase,
  createWorkspace,
  PRESETS,
  REPOSITORY,
  removeWorkspace,
  runTool,
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
      'foundation/self',
      'foundation/core',
      'foundation/typescript',
      'foundation/workspace',
      'architecture/workspace',
    ].map((part) => `./${PRESETS}/dependency-cruiser/${part}.mjs`),
  )},
};
`;

const STRYKER = `import bunTest from '../../${PRESETS}/stryker/foundation/bun-test.mjs';
import core from '../../${PRESETS}/stryker/foundation/core.mjs';
import self from '../../${PRESETS}/stryker/foundation/self.mjs';

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
      'libs/money/src/zero.ts': 'export const ZERO = 0;\n',
      'shared/src/contracts/price.ts':
        "import { ZERO } from '../../../libs/money/src/zero.ts';\n\nexport const price = ZERO;\n",
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
        'packages/web/src/label.ts':
          "import { describeOrder, type OrderId } from '@shop/shared/contracts';\n\nexport const label = (id: OrderId): string => `Ordered ${describeOrder({ id, total: 0 })}`;\n",
        'packages/web/src/__tests__/label.test.ts':
          "import { expect, it } from 'bun:test';\n\nimport type { OrderId } from '@shop/shared/contracts';\n\nimport { label } from '#/label.ts';\n\nit('should name the order when an order is labelled', () => {\n  // Act\n  const text = label('a' as OrderId);\n\n  // Assert\n  expect(text).toBe('Ordered order:a');\n});\n",
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
