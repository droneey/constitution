import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, describe, expect, it } from 'bun:test';

import { causeCodeOf, failureOf } from '#/__tests__/failure.fixtures.ts';
import { AbsolutePath, UnitRelativePath } from '#/kernel/value-objects';

import type { ToolEnd } from '../../../__tests__/mutation-runner.suite.ts';
import { MUTATE_SCENARIO, mutationRunnerSuite } from '../../../__tests__/mutation-runner.suite.ts';
import type { MutationRunner } from '../../../application/contracts';
import {
  ConfigurationError,
  ConfigurationFailure,
  MutationRunError,
  MutationRunFailure,
} from '../../../domain/errors';
import { LineRange } from '../../../domain/value-objects';
import { strykerRunner } from '../stryker-runner.adapter.ts';

const outerFolderPath = realpathSync(mkdtempSync(join(tmpdir(), 'mutation-check-stryker-')));

afterAll(() => {
  rmSync(outerFolderPath, {
    force: true,
    recursive: true,
  });
});

const TIMEOUT_MS = 60_000;
const ARGUMENTS_FILE_NAME = '.stryker-arguments';

const SCENARIO_CONFIG_FILES = {
  'stryker.config.json': JSON.stringify({
    mutate: MUTATE_SCENARIO.mutateGlobs,
  }),
} as const;

interface Tool {
  readonly configFiles?: Readonly<Record<string, string>>;
  readonly timeoutMs?: number;
  readonly toolScript?: string;
}

const argumentsScript = `#!/bin/sh\nprintf "%s " "$@" > "$PWD/${ARGUMENTS_FILE_NAME}"\nexit 1\n`;

const unitWith = (tool: Tool) => {
  const unitFolderPath = mkdtempSync(join(outerFolderPath, 'unit-'));
  const toolFolderPath = join(unitFolderPath, '.bin');

  mkdirSync(toolFolderPath);

  for (const [fileName, text] of Object.entries(tool.configFiles ?? SCENARIO_CONFIG_FILES)) {
    writeFileSync(join(unitFolderPath, fileName), text);
  }

  if (tool.toolScript !== undefined) {
    writeFileSync(join(toolFolderPath, 'stryker'), tool.toolScript);
    chmodSync(join(toolFolderPath, 'stryker'), 0o755);
  }

  return {
    runner: strykerRunner({
      env: Object.fromEntries([
        [
          'PATH',
          toolFolderPath,
        ],
      ]),
      output: 'ignore',
      timeoutMs: tool.timeoutMs ?? TIMEOUT_MS,
      unitFolderPath: AbsolutePath.create(unitFolderPath),
    }),
    strykerArguments: () => readFileSync(join(unitFolderPath, ARGUMENTS_FILE_NAME), 'utf8').trim(),
  };
};

const toolOf = (toolEnd: ToolEnd): Tool => {
  if ('exitCode' in toolEnd) {
    return {
      toolScript: `#!/bin/sh\nexit ${toolEnd.exitCode}\n`,
    };
  }

  switch (toolEnd.failure) {
    case MutationRunFailure.ToolNotRun:
      return {};
    case MutationRunFailure.ToolTimedOut:
      return {
        timeoutMs: 100,
        // Why: by its path, since the runner's PATH holds only the fake's folder.
        toolScript: '#!/bin/sh\nexec /bin/sleep 10\n',
      };
    case MutationRunFailure.ToolStopped:
      return {
        toolScript: '#!/bin/sh\nkill -KILL $$\n',
      };
    default:
      return toolEnd.failure satisfies never;
  }
};

mutationRunnerSuite({
  implementationName: 'strykerRunner',
  runnerEndingWith: (toolEnd) => unitWith(toolOf(toolEnd)).runner,
});

describe('strykerRunner', () => {
  it.each([
    {
      condition: 'everything',
      run: (runner: MutationRunner) => runner.runAll(),
      strykerArguments: 'run',
    },
    {
      condition: 'the lines of one file and the whole of another',
      run: (runner: MutationRunner) =>
        runner.runTargets([
          {
            filePath: UnitRelativePath.create('src/order.utils.ts'),
            lineRange: LineRange.create({
              endLine: 5,
              startLine: 3,
            }),
          },
          {
            filePath: UnitRelativePath.create('src/line.utils.ts'),
          },
        ]),
      strykerArguments: 'run --mutate src/order.utils.ts:3-5,src/line.utils.ts',
    },
  ])('should run Stryker in the unit on $condition', ({ run, strykerArguments }) => {
    // Arrange
    const unit = unitWith({
      toolScript: argumentsScript,
    });

    // Act
    run(unit.runner);

    // Assert
    expect(unit.strykerArguments()).toStrictEqual(strykerArguments);
  });

  it('should fail with its own code and the reason beneath when Stryker cannot run', async () => {
    // Arrange
    const { runner } = unitWith({});

    // Act
    const failure = await failureOf({
      call: () => runner.runAll(),
      kind: MutationRunError,
    });

    // Assert
    expect({
      cause: causeCodeOf(failure?.cause),
      details: failure?.details,
    }).toStrictEqual({
      cause: 'ENOENT',
      details: {
        code: MutationRunFailure.ToolNotRun,
        toolName: 'stryker',
      },
    });
  });

  it.each([
    {
      cause: undefined,
      condition: 'names patterns that are not text',
      details: {
        code: ConfigurationFailure.MutateMalformed,
        fileName: 'stryker.config.mjs',
        problemPaths: [
          'default.mutate.1',
          'default.mutate.2',
        ],
      },
      text: "export default { mutate: ['src/**/*.ts', 1, 2] };\n",
    },
    {
      cause: 'ERR_MODULE_NOT_FOUND',
      condition: 'is a module importing a file that is not there',
      details: {
        code: ConfigurationFailure.Unreadable,
        fileName: 'stryker.config.mjs',
      },
      text: "import base from './missing.mjs';\n\nexport default base;\n",
    },
  ])(
    'should fail with its own code, naming the file, when the configuration $condition',
    async ({ cause, details, text }) => {
      // Arrange
      const { runner } = unitWith({
        configFiles: {
          'stryker.config.mjs': text,
        },
      });

      // Act
      const failure = await failureOf({
        call: () => runner.mutatedOf([]),
        kind: ConfigurationError,
      });

      // Assert
      expect({
        cause: causeCodeOf(failure?.cause),
        details: failure?.details,
      }).toStrictEqual({
        cause,
        details,
      });
    },
  );

  it('should fail with its own code, naming the files it looked for, when the unit holds no configuration', async () => {
    // Arrange
    const { runner } = unitWith({
      configFiles: {},
    });

    // Act
    const failure = await failureOf({
      call: () => runner.mutatedOf([]),
      kind: ConfigurationError,
    });

    // Assert
    expect(failure?.details).toStrictEqual({
      code: ConfigurationFailure.Missing,
      fileNames: [
        'stryker.config.mjs',
        'stryker.config.js',
        'stryker.config.json',
      ],
    });
  });

  it("should let a failure of the configuration's own code through", async () => {
    // Arrange
    const { runner } = unitWith({
      configFiles: {
        'stryker.config.mjs': "throw new RangeError('no config');\n\nexport default {};\n",
      },
    });

    // Act
    const reading = runner.mutatedOf([]);

    // Assert
    await expect(reading).rejects.toThrow(RangeError);
  });
});
