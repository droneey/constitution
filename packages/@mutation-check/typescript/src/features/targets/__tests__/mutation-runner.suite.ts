import { describe, expect, it } from 'bun:test';

import { failureOf } from '#/__tests__/failure.fixtures.ts';
import { UnitRelativePath } from '#/kernel/value-objects';

import type { MutationRunner } from '../domain/contracts';
import { MutationRunError, MutationRunFailure } from '../domain/errors';

type ToolEnd =
  | {
      readonly exitCode: number;
    }
  | {
      readonly failure: MutationRunFailure;
    };

const MUTATE_SCENARIO = {
  mutateGlobs: [
    'src/**/*.ts',
    '!src/**/__tests__/**',
  ],
  mutatedPath: UnitRelativePath.create('src/order.ts'),
  unmutatedPaths: [
    UnitRelativePath.create('README.md'),
    UnitRelativePath.create('src/__tests__/order.test.ts'),
  ],
} as const;

interface MutationRunnerSuiteInput {
  readonly implementationName: string;
  readonly runnerEndingWith: (toolEnd: ToolEnd) => MutationRunner;
}

const mutationRunnerSuite = (input: MutationRunnerSuiteInput): void => {
  describe(`the MutationRunner contract, kept by ${input.implementationName}`, () => {
    it.each([
      {
        run: (runner: MutationRunner) => runner.runAll(),
        scope: 'every file',
      },
      {
        run: (runner: MutationRunner) =>
          runner.runTargets([
            {
              filePath: MUTATE_SCENARIO.mutatedPath,
            },
          ]),
        scope: 'the targets',
      },
    ])('should end with the exit code the tool ended with on $scope', ({ run }) => {
      // Arrange
      const runner = input.runnerEndingWith({
        exitCode: 3,
      });

      // Act
      const exitCode = run(runner);

      // Assert
      expect(exitCode).toBe(3);
    });

    it('should keep of the files those the configuration mutates', async () => {
      // Arrange
      const runner = input.runnerEndingWith({
        exitCode: 0,
      });

      // Act
      const mutatedPaths = await runner.mutatedOf([
        MUTATE_SCENARIO.mutatedPath,
        ...MUTATE_SCENARIO.unmutatedPaths,
      ]);

      // Assert
      expect(mutatedPaths).toStrictEqual([
        MUTATE_SCENARIO.mutatedPath,
      ]);
    });

    it.each([
      {
        condition: 'the tool cannot start',
        failure: MutationRunFailure.ToolNotRun,
      },
      {
        condition: 'the tool runs past its time',
        failure: MutationRunFailure.ToolTimedOut,
      },
      {
        condition: 'the tool is stopped before its end',
        failure: MutationRunFailure.ToolStopped,
      },
    ])('should fail with its own code when $condition', async ({ failure }) => {
      // Arrange
      const runner = input.runnerEndingWith({
        failure,
      });

      // Act
      const runFailure = await failureOf({
        call: () => runner.runAll(),
        kind: MutationRunError,
      });

      // Assert
      expect(runFailure?.code).toBe(failure);
    });
  });
};

export type { ToolEnd };
export { MUTATE_SCENARIO, mutationRunnerSuite };
