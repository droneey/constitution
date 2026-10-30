import { describe, expect, it } from 'bun:test';

import { UnitRelativePath } from '#/kernel/value-objects';

import { fakeSpecRunner } from '../../../../../__tests__/spec-runner.fake.ts';
import { SpecRunStatus } from '../../../../../domain/spec-run/entities';
import { runSpecs } from '../run-specs.use-case.ts';

const orderSpecPath = UnitRelativePath.create('src/__tests__/order.test.ts');
const shopSpecPath = UnitRelativePath.create('src/__tests__/shop.test.ts');
const orderPath = UnitRelativePath.create('src/order.ts');
const pricePath = UnitRelativePath.create('src/price.ts');

const REQUEST = {
  signal: new AbortController().signal,
  timeoutMs: 1000,
  addedVariables: {
    mutant: '1',
  },
} as const;

const runOf = (specPaths: readonly UnitRelativePath[]) => ({
  ...REQUEST,
  specPaths,
});

describe('runSpecs', () => {
  it.each([
    {
      condition: 'it names no file',
      request: REQUEST,
      runs: [
        runOf([
          orderSpecPath,
          shopSpecPath,
        ]),
      ],
      specsRun: {
        specPaths: [
          orderSpecPath,
          shopSpecPath,
        ],
        status: SpecRunStatus.Failed,
        stderrText: shopSpecPath,
      },
    },
    {
      condition: 'specs load the files',
      request: {
        ...REQUEST,
        filePaths: [
          orderPath,
          pricePath,
        ],
      },
      runs: [
        runOf([
          orderSpecPath,
        ]),
      ],
      specsRun: {
        specPaths: [
          orderSpecPath,
        ],
        status: SpecRunStatus.Passed,
      },
    },
    {
      condition: 'no spec loads the files',
      request: {
        ...REQUEST,
        filePaths: [
          UnitRelativePath.create('src/lonely.ts'),
        ],
      },
      runs: [],
      specsRun: {
        status: SpecRunStatus.Unrun,
      },
    },
  ])(
    'should run the specs the request chooses when $condition',
    async ({ request, runs, specsRun }) => {
      // Arrange
      const specRunner = fakeSpecRunner({
        failingPaths: [
          shopSpecPath,
        ],
        specPaths: [],
      });

      // Act
      const run = await runSpecs({
        ...request,
        specRunner,
        unitSpecs: {
          specPaths: [
            orderSpecPath,
            shopSpecPath,
          ],
          specPathsByFilePath: new Map([
            [
              orderPath,
              [
                orderSpecPath,
              ],
            ],
            [
              pricePath,
              [
                orderSpecPath,
              ],
            ],
          ]),
        },
      });

      // Assert
      expect({
        run,
        runs: specRunner.runs,
      }).toStrictEqual({
        run: specsRun,
        runs,
      });
    },
  );
});
