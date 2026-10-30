import { describe, expect, it } from 'bun:test';

import { failureOf } from '#/__tests__/failure.fixtures.ts';
import { ProgramError } from '#/kernel/errors';
import { AbsolutePath, UnitRelativePath } from '#/kernel/value-objects';

import { fakeBranchReader } from '../../../../../__tests__/branch-reader.fake.ts';
import { fakeCodeComparer } from '../../../../../__tests__/code-comparer.fake.ts';
import { fakeMutationRunner } from '../../../../../__tests__/mutation-runner.fake.ts';
import { CheckScope, CheckStatus } from '../../../../../domain/entities';
import {
  BranchError,
  BranchFailure,
  ConfigurationError,
  ConfigurationFailure,
  MutationRunError,
  MutationRunFailure,
} from '../../../../../domain/errors';
import { LineRange } from '../../../../../domain/value-objects';
import type { CodeComparer } from '../../../../contracts';
import { createCheckMutations } from '../check-mutations.use-case.ts';

const orderPath = UnitRelativePath.create('src/order.utils.ts');
const ratePath = UnitRelativePath.create('src/rate.utils.ts');
const pricePath = UnitRelativePath.create('src/price.utils.ts');
const linePath = UnitRelativePath.create('src/line.utils.ts');
const specPath = UnitRelativePath.create('src/__tests__/order.utils.test.ts');

const firstLines = LineRange.create({
  endLine: 2,
  startLine: 1,
});
const fifthLine = LineRange.create({
  endLine: 5,
  startLine: 5,
});

const branchReader = fakeBranchReader({
  baseTexts: new Map([
    [
      orderPath,
      'export const total = 1;\n',
    ],
    [
      pricePath,
      'export const price = 1;\n',
    ],
  ]),
  changedFiles: [
    {
      filePath: orderPath,
      lineRanges: [
        firstLines,
        fifthLine,
      ],
    },
    {
      filePath: pricePath,
      lineRanges: [
        fifthLine,
      ],
    },
    {
      filePath: ratePath,
      lineRanges: [
        fifthLine,
      ],
    },
    {
      filePath: specPath,
      lineRanges: [
        firstLines,
      ],
    },
  ],
  newFilePaths: [
    linePath,
    specPath,
  ],
});

const codeComparer = fakeCodeComparer(
  new Map([
    [
      orderPath,
      'export const total = 2;\n',
    ],
    [
      pricePath,
      'export const price = 1;\n',
    ],
    [
      ratePath,
      'export const rate = 1;\n',
    ],
    [
      specPath,
      'test();\n',
    ],
  ]),
);

const branchFailure = new BranchError({
  code: BranchFailure.ToolTimedOut,
  command: {
    args: [],
    folderPath: AbsolutePath.create('/work'),
    toolName: 'git',
  },
});

describe('createCheckMutations', () => {
  it('should mutate the lines the branch wrote in mutated files whose code changed, and every new file it mutates', async () => {
    // Arrange
    const runner = fakeMutationRunner({
      exitCode: 1,
      unmutatedPaths: [
        specPath,
      ],
    });

    // Act
    await createCheckMutations({
      branchReader,
      codeComparer,
      runner,
    })(CheckScope.Branch);

    // Assert
    expect(runner.targetsRun).toStrictEqual([
      [
        {
          filePath: linePath,
        },
        {
          filePath: orderPath,
          lineRange: firstLines,
        },
        {
          filePath: orderPath,
          lineRange: fifthLine,
        },
        {
          filePath: ratePath,
          lineRange: fifthLine,
        },
      ],
    ]);
  });

  it('should compare the code of only the changed files the runner mutates', async () => {
    // Arrange
    const compared: UnitRelativePath[] = [];
    const recordingComparer: CodeComparer = {
      hasCodeChanged: (filePath, baseText) => {
        compared.push(filePath);

        return codeComparer.hasCodeChanged(filePath, baseText);
      },
    };

    // Act
    await createCheckMutations({
      branchReader,
      codeComparer: recordingComparer,
      runner: fakeMutationRunner({
        exitCode: 0,
        unmutatedPaths: [
          specPath,
        ],
      }),
    })(CheckScope.Branch);

    // Assert
    expect(compared).toStrictEqual([
      orderPath,
      pricePath,
      ratePath,
    ]);
  });

  it.each([
    {
      exitCode: 1,
      scope: CheckScope.Branch,
    },
    {
      exitCode: 3,
      scope: CheckScope.Everything,
    },
  ])(
    'should end with the exit code of the run when the scope is $scope',
    async ({ exitCode, scope }) => {
      // Arrange
      const runner = fakeMutationRunner({
        exitCode,
      });

      // Act
      const outcome = await createCheckMutations({
        branchReader,
        codeComparer,
        runner,
      })(scope);

      // Assert
      expect(outcome).toStrictEqual({
        exitCode,
        status: CheckStatus.Ran,
      });
    },
  );

  it('should run nothing when the branch changed no line to mutate', async () => {
    // Arrange
    const runner = fakeMutationRunner({
      exitCode: 0,
    });

    // Act
    const outcome = await createCheckMutations({
      branchReader: fakeBranchReader({
        baseTexts: new Map([
          [
            pricePath,
            'export const price = 1;\n',
          ],
        ]),
        changedFiles: [
          {
            filePath: pricePath,
            lineRanges: [
              firstLines,
            ],
          },
        ],
      }),
      codeComparer,
      runner,
    })(CheckScope.Branch);

    // Assert
    expect({
      outcome,
      targetsRun: runner.targetsRun,
      wholeRunCount: runner.wholeRunCount(),
    }).toStrictEqual({
      outcome: {
        status: CheckStatus.NothingChanged,
      },
      targetsRun: [],
      wholeRunCount: 0,
    });
  });

  it('should mutate everything without reading the branch when the scope is everything', async () => {
    // Arrange
    const runner = fakeMutationRunner({
      exitCode: 3,
    });

    // Act
    await createCheckMutations({
      branchReader: fakeBranchReader({
        readFailure: branchFailure,
      }),
      codeComparer,
      runner,
    })(CheckScope.Everything);

    // Assert
    expect({
      targetsRun: runner.targetsRun,
      wholeRunCount: runner.wholeRunCount(),
    }).toStrictEqual({
      targetsRun: [],
      wholeRunCount: 1,
    });
  });

  it.each([
    {
      branchReader: fakeBranchReader({
        readFailure: branchFailure,
      }),
      failure: BranchFailure.ToolTimedOut,
      runner: fakeMutationRunner({
        exitCode: 0,
      }),
    },
    {
      branchReader,
      failure: ConfigurationFailure.Missing,
      runner: fakeMutationRunner({
        exitCode: 0,
        mutatedOfRejection: new ConfigurationError({
          code: ConfigurationFailure.Missing,
          fileNames: [
            'stryker.config.json',
          ],
        }),
      }),
    },
    {
      branchReader,
      failure: MutationRunFailure.ToolStopped,
      runner: fakeMutationRunner({
        runFailure: new MutationRunError({
          code: MutationRunFailure.ToolStopped,
          toolName: 'stryker',
        }),
      }),
    },
  ])(
    'should fail as its port does when it fails with $failure',
    async ({ branchReader: reader, failure, runner }) => {
      // Act
      const thrown = await failureOf({
        call: () =>
          createCheckMutations({
            branchReader: reader,
            codeComparer,
            runner,
          })(CheckScope.Branch),
        kind: ProgramError,
      });

      // Assert
      expect(thrown?.code).toBe(failure);
    },
  );
});
