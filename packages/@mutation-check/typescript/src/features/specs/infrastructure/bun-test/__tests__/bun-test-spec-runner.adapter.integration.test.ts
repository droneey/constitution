import { existsSync, mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterAll, describe, expect, it } from 'bun:test';

import { failureOf } from '#/__tests__/failure.fixtures.ts';
import { AbsolutePath, UnitRelativePath } from '#/kernel/value-objects';

import { SPEC_SCENARIO, specRunnerSuite } from '../../../__tests__/spec-runner.suite.ts';
import { SpecRunStatus } from '../../../domain/entities';
import { SpecSettingsError, SpecSettingsFailure } from '../../../domain/errors';
import { bunTestSpecRunner } from '../bun-test-spec-runner.adapter.ts';

type Files = Readonly<Record<string, string>>;

const outerFolderPath = realpathSync(mkdtempSync(join(tmpdir(), 'mutation-check-bun-test-')));

afterAll(() => {
  rmSync(outerFolderPath, {
    force: true,
    recursive: true,
  });
});

const UNIT: Files = {
  'bunfig.mutation.toml': '[test]\npathIgnorePatterns = ["tests/**"]\n',
  'node_modules/shop/__tests__/shop.test.ts': '',
  [SPEC_SCENARIO.failingPath]: `import { test } from 'bun:test';\n\ntest('${SPEC_SCENARIO.caseTitle}', () => {\n  if (process.env['spare'] !== '1') {\n    throw new Error('broken');\n  }\n});\n`,
  [SPEC_SCENARIO.passingPath]: `import { test } from 'bun:test';\n\ntest('${SPEC_SCENARIO.caseTitle}', () => {});\n`,
  [SPEC_SCENARIO.timingOutPath]: `import { test } from 'bun:test';\n\ntest('${SPEC_SCENARIO.caseTitle}', () => Bun.sleep(60_000), 60_000);\n`,
  'tests/e2e/order.e2e.test.ts': '',
} as const;

const runnerIn = (files: Files) => {
  const unitFolderPath = mkdtempSync(join(outerFolderPath, 'unit-'));

  for (const [filePath, text] of Object.entries(files)) {
    mkdirSync(dirname(join(unitFolderPath, filePath)), {
      recursive: true,
    });
    writeFileSync(join(unitFolderPath, filePath), text);
  }

  return {
    runner: bunTestSpecRunner({
      env: Object.fromEntries([
        [
          'PATH',
          process.env['PATH'] ?? '',
        ],
      ]),
      outputLimitBytes: 1_048_576,
      unitFolderPath: AbsolutePath.create(unitFolderPath),
    }),
    unitFolderPath,
  };
};

const scenario = runnerIn(UNIT);

specRunnerSuite({
  implementationName: 'bunTestSpecRunner',
  runnerOfScenario: () => scenario.runner,
});

describe('bunTestSpecRunner', () => {
  it('should find the specs under the root the configuration names', () => {
    // Arrange
    const { runner } = runnerIn({
      ...UNIT,
      'bunfig.mutation.toml': '[test]\nroot = "tests"\n',
    });

    // Act
    const specPaths = runner.findSpecPaths();

    // Assert
    expect(specPaths).toStrictEqual([
      UnitRelativePath.create('tests/e2e/order.e2e.test.ts'),
    ]);
  });

  it('should fail with its own code when the unit holds no configuration of its mutation specs', async () => {
    // Arrange
    const { ['bunfig.mutation.toml']: _configText, ...filesWithoutConfig } = UNIT;
    const { runner } = runnerIn(filesWithoutConfig);

    // Act
    const failure = await failureOf({
      call: () => runner.findSpecPaths(),
      kind: SpecSettingsError,
    });

    // Assert
    expect(failure?.details).toStrictEqual({
      code: SpecSettingsFailure.Missing,
      fileName: 'bunfig.mutation.toml',
    });
  });

  it.each([
    {
      cause: expect.any(SyntaxError),
      condition: 'is no TOML',
      configText: '[test\n',
      details: {
        code: SpecSettingsFailure.Unparsable,
        fileName: 'bunfig.mutation.toml',
      },
    },
    {
      cause: undefined,
      condition: 'holds a test that is no table',
      configText: 'test = 1\n',
      details: {
        code: SpecSettingsFailure.Malformed,
        fileName: 'bunfig.mutation.toml',
        problemPaths: [
          'test',
        ],
      },
    },
    {
      cause: undefined,
      condition: 'leaves out specs by a pattern that is no text and roots them outside the unit',
      configText: '[test]\npathIgnorePatterns = [1]\nroot = "../specs"\n',
      details: {
        code: SpecSettingsFailure.Malformed,
        fileName: 'bunfig.mutation.toml',
        problemPaths: [
          'test.pathIgnorePatterns.0',
          'test.root',
        ],
      },
    },
  ])(
    'should fail with its own code and what it found when the configuration of its mutation specs $condition',
    async ({ cause, configText, details }) => {
      // Arrange
      const { runner } = runnerIn({
        ...UNIT,
        'bunfig.mutation.toml': configText,
      });

      // Act
      const failure = await failureOf({
        call: () => runner.findSpecPaths(),
        kind: SpecSettingsError,
      });

      // Assert
      expect({
        cause: failure?.cause,
        details: failure?.details,
      }).toStrictEqual({
        cause,
        details,
      });
    },
  );

  it('should hand the specs the variables of the run', async () => {
    // Act
    const run = await scenario.runner.run({
      signal: new AbortController().signal,
      specPaths: [
        SPEC_SCENARIO.failingPath,
      ],
      timeoutMs: 30_000,
      addedVariables: {
        spare: '1',
      },
    });

    // Assert
    expect(run.status).toBe(SpecRunStatus.Passed);
  });

  it('should run no spec past the first failure', async () => {
    // Arrange
    const { runner, unitFolderPath } = runnerIn({
      ...UNIT,
      'src/__tests__/later.test.ts':
        "import { writeFileSync } from 'node:fs';\nimport { test } from 'bun:test';\n\ntest('should hold', () => {\n  writeFileSync('ran', '');\n});\n",
    });

    // Act
    await runner.run({
      signal: new AbortController().signal,
      specPaths: [
        SPEC_SCENARIO.failingPath,
        UnitRelativePath.create('src/__tests__/later.test.ts'),
      ],
      timeoutMs: 30_000,
      addedVariables: {},
    });

    // Assert
    expect(existsSync(join(unitFolderPath, 'ran'))).toBe(false);
  });
});
