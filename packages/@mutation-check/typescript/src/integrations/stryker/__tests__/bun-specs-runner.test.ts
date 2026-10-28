import { describe, expect, it } from 'bun:test';

import type {
  DryRunOptions,
  DryRunResult,
  MutantRunOptions,
  MutantRunResult,
  TestResult,
} from '@stryker-mutator/api/test-runner';
import { DryRunStatus, MutantRunStatus, TestStatus } from '@stryker-mutator/api/test-runner';

import type { ChosenSpecsRun, SpecsRequest } from '#/features/specs';
import { SpecRunStatus } from '#/features/specs';
import { AbsolutePath, UnitRelativePath } from '#/kernel/value-objects';

import { bunSpecsRunner } from '../bun-specs-runner.ts';

const orderSpecPath = UnitRelativePath.create('src/__tests__/order.test.ts');
const shopSpecPath = UnitRelativePath.create('src/__tests__/shop.test.ts');

const RUNS = {
  failed: {
    specPaths: [
      orderSpecPath,
      shopSpecPath,
    ],
    status: SpecRunStatus.Failed,
    stderrText: 'expected 3',
  },
  passed: {
    specPaths: [
      orderSpecPath,
      shopSpecPath,
    ],
    status: SpecRunStatus.Passed,
  },
  timedOut: {
    specPaths: [
      orderSpecPath,
    ],
    status: SpecRunStatus.TimedOut,
  },
  unrun: {
    status: SpecRunStatus.Unrun,
  },
} as const satisfies Readonly<Record<string, ChosenSpecsRun>>;

const DRY_RUN_OPTIONS = {
  coverageAnalysis: 'off',
  disableBail: false,
  timeout: 1000,
} as const satisfies DryRunOptions;

const MUTANT_RUN_OPTIONS = {
  activeMutant: {
    fileName: '/work/src/order.ts',
    id: '7',
    location: {
      end: {
        column: 1,
        line: 1,
      },
      start: {
        column: 0,
        line: 1,
      },
    },
    mutatorName: 'ConditionalExpression',
    replacement: 'true',
  },
  disableBail: false,
  mutantActivation: 'runtime',
  reloadEnvironment: true,
  sandboxFileName: '/work/src/order.ts',
  timeout: 1000,
} as const satisfies MutantRunOptions;

const MUTANT_REQUEST = {
  filePaths: [
    UnitRelativePath.create('src/order.ts'),
  ],
  timeoutMs: 1000,
  addedVariables: Object.fromEntries([
    [
      '__STRYKER_ACTIVE_MUTANT__',
      '7',
    ],
  ]),
} as const;

const runnerAnswering = (run: ChosenSpecsRun) => {
  const requests: Omit<SpecsRequest, 'signal'>[] = [];
  const signals: AbortSignal[] = [];

  return {
    requests,
    runner: bunSpecsRunner({
      runSpecs: ({ signal, ...request }) => {
        requests.push(request);
        signals.push(signal);

        return Promise.resolve(run);
      },
      unitFolderPath: AbsolutePath.create('/work'),
    }),
    signals,
  };
};

const testOf = (specPath: UnitRelativePath): TestResult => ({
  fileName: `/work/${specPath}`,
  id: specPath,
  name: specPath,
  status: TestStatus.Success,
  timeSpentMs: 0,
});

const dryRunCases: readonly {
  readonly condition: string;
  readonly dryRunResult: DryRunResult;
  readonly run: ChosenSpecsRun;
}[] = [
  {
    condition: 'every spec passes',
    dryRunResult: {
      status: DryRunStatus.Complete,
      tests: [
        testOf(orderSpecPath),
        testOf(shopSpecPath),
      ],
    },
    run: RUNS.passed,
  },
  {
    condition: 'a spec fails',
    dryRunResult: {
      errorMessage: 'expected 3',
      status: DryRunStatus.Error,
    },
    run: RUNS.failed,
  },
  {
    condition: 'the specs outlast its time',
    dryRunResult: {
      status: DryRunStatus.Timeout,
    },
    run: RUNS.timedOut,
  },
  {
    condition: 'the unit has no spec',
    dryRunResult: {
      status: DryRunStatus.Complete,
      tests: [],
    },
    run: RUNS.unrun,
  },
];

const mutantRunCases: readonly {
  readonly condition: string;
  readonly mutantRunResult: MutantRunResult;
  readonly run: ChosenSpecsRun;
}[] = [
  {
    condition: 'a spec that loads its file fails',
    mutantRunResult: {
      failureMessage: 'expected 3',
      killedBy: [
        orderSpecPath,
        shopSpecPath,
      ],
      nrOfTests: 2,
      status: MutantRunStatus.Killed,
    },
    run: RUNS.failed,
  },
  {
    condition: 'the specs that load its file pass',
    mutantRunResult: {
      nrOfTests: 2,
      status: MutantRunStatus.Survived,
    },
    run: RUNS.passed,
  },
  {
    condition: 'the specs outlast its time',
    mutantRunResult: {
      status: MutantRunStatus.Timeout,
    },
    run: RUNS.timedOut,
  },
  {
    condition: 'no spec loads its file',
    mutantRunResult: {
      nrOfTests: 0,
      status: MutantRunStatus.Survived,
    },
    run: RUNS.unrun,
  },
];

describe('bunSpecsRunner', () => {
  it('should ask Stryker for a new process for each run', () => {
    // Arrange
    const { runner } = runnerAnswering(RUNS.passed);

    // Act
    const capabilities = runner.capabilities();

    // Assert
    expect(capabilities).toStrictEqual({
      reloadEnvironment: true,
    });
  });

  it.each(dryRunCases)(
    'should run the specs of the dry run and report when $condition',
    async ({ dryRunResult, run }) => {
      // Arrange
      const answering = runnerAnswering(run);

      // Act
      const dryRun = await answering.runner.dryRun(DRY_RUN_OPTIONS);

      // Assert
      expect({
        dryRun,
        requests: answering.requests,
      }).toStrictEqual({
        dryRun: dryRunResult,
        requests: [
          {
            timeoutMs: 1000,
            addedVariables: {},
          },
        ],
      });
    },
  );

  it.each(mutantRunCases)(
    'should run the specs that load the mutant’s file with the mutant active and report when $condition',
    async ({ mutantRunResult, run }) => {
      // Arrange
      const answering = runnerAnswering(run);

      // Act
      const mutantRun = await answering.runner.mutantRun(MUTANT_RUN_OPTIONS);

      // Assert
      expect({
        mutantRun,
        requests: answering.requests,
      }).toStrictEqual({
        mutantRun: mutantRunResult,
        requests: [
          MUTANT_REQUEST,
        ],
      });
    },
  );

  it('should call off the running specs when Stryker disposes of it', async () => {
    // Arrange
    const answering = runnerAnswering(RUNS.passed);

    await answering.runner.mutantRun(MUTANT_RUN_OPTIONS);

    // Act
    await answering.runner.dispose?.();

    // Assert
    expect(answering.signals.map(({ aborted }) => aborted)).toStrictEqual([
      true,
    ]);
  });
});
