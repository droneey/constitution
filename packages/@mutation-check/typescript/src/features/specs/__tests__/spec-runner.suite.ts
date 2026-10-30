import { describe, expect, it } from 'bun:test';

import { UnitRelativePath } from '#/kernel/value-objects';

import type { SpecRunner } from '../application/contracts';
import { SpecRunStatus } from '../domain/entities';

const SPEC_SCENARIO = {
  caseTitle: 'should hold',
  failingPath: UnitRelativePath.create('src/__tests__/fail.test.ts'),
  passingPath: UnitRelativePath.create('src/__tests__/pass.test.ts'),
  timingOutPath: UnitRelativePath.create('src/__tests__/time-out.test.ts'),
} as const;

const TIMEOUT_MS = 30_000;

interface SpecRunnerSuiteInput {
  readonly implementationName: string;
  readonly runnerOfScenario: () => SpecRunner;
}

const specRunnerSuite = (input: SpecRunnerSuiteInput): void => {
  describe(`the SpecRunner contract, kept by ${input.implementationName}`, () => {
    it('should find every spec of the unit', () => {
      // Arrange
      const runner = input.runnerOfScenario();

      // Act
      const specPaths = runner.findSpecPaths();

      // Assert
      expect(new Set(specPaths)).toStrictEqual(
        new Set([
          SPEC_SCENARIO.failingPath,
          SPEC_SCENARIO.passingPath,
          SPEC_SCENARIO.timingOutPath,
        ]),
      );
    });

    it.each([
      {
        condition: 'its specs pass',
        status: SpecRunStatus.Passed,
        specPaths: [
          SPEC_SCENARIO.passingPath,
        ],
        timeoutMs: TIMEOUT_MS,
      },
      {
        condition: 'a spec fails',
        status: SpecRunStatus.Failed,
        specPaths: [
          SPEC_SCENARIO.passingPath,
          SPEC_SCENARIO.failingPath,
        ],
        timeoutMs: TIMEOUT_MS,
      },
      {
        condition: 'a spec outlasts the time of the run',
        status: SpecRunStatus.TimedOut,
        specPaths: [
          SPEC_SCENARIO.timingOutPath,
        ],
        timeoutMs: 500,
      },
    ])(
      'should end the run as the specs do when $condition',
      async ({ specPaths, status, timeoutMs }) => {
        // Arrange
        const runner = input.runnerOfScenario();

        // Act
        const run = await runner.run({
          signal: new AbortController().signal,
          specPaths,
          timeoutMs,
          addedVariables: {},
        });

        // Assert
        expect(run.status).toBe(status);
      },
    );
  });
};

export { SPEC_SCENARIO, specRunnerSuite };
