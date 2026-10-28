import { join, relative } from 'node:path';

import type {
  DryRunOptions,
  DryRunResult,
  MutantRunOptions,
  MutantRunResult,
  TestResult,
  TestRunner,
  TestRunnerCapabilities,
} from '@stryker-mutator/api/test-runner';
import { DryRunStatus, MutantRunStatus, TestStatus } from '@stryker-mutator/api/test-runner';

import type { ChosenSpecsRun, SpecsRequest } from '#/features/specs';
import { SpecRunStatus } from '#/features/specs';
import type { AbsolutePath } from '#/kernel/value-objects';
import { UnitRelativePath } from '#/kernel/value-objects';

// Why: Stryker's INSTRUMENTER_CONSTANTS.ACTIVE_MUTANT_ENV_VARIABLE; its module reads Stryker's
// schema beside it when imported, and the distribution's bundle of this runner carries no schema.
const ACTIVE_MUTANT_VARIABLE_NAME = '__STRYKER_ACTIVE_MUTANT__';

interface BunSpecsRunnerInput {
  readonly runSpecs: (request: SpecsRequest) => Promise<ChosenSpecsRun>;
  readonly unitFolderPath: AbsolutePath;
}

// Why: a run that stops at its first failure tells no case apart, so each spec counts as one test,
// failed when the run failed.
const dryRunResultOf = (input: {
  run: ChosenSpecsRun;
  unitFolderPath: AbsolutePath;
}): DryRunResult => {
  const { run } = input;

  switch (run.status) {
    case SpecRunStatus.TimedOut:
      return {
        status: DryRunStatus.Timeout,
      };
    case SpecRunStatus.Unrun:
      return {
        status: DryRunStatus.Complete,
        tests: [],
      };
    case SpecRunStatus.Failed:
      return {
        errorMessage: run.stderrText,
        status: DryRunStatus.Error,
      };
    case SpecRunStatus.Passed:
      return {
        status: DryRunStatus.Complete,
        tests: run.specPaths.map(
          (specPath): TestResult => ({
            fileName: join(input.unitFolderPath, specPath),
            id: specPath,
            name: specPath,
            status: TestStatus.Success,
            timeSpentMs: 0,
          }),
        ),
      };
    // Stryker disable next-line ConditionalExpression: no member reaches the default, which only the compiler reads
    default:
      return run satisfies never;
  }
};

const mutantRunResultOf = (run: ChosenSpecsRun): MutantRunResult => {
  switch (run.status) {
    case SpecRunStatus.TimedOut:
      return {
        status: MutantRunStatus.Timeout,
      };
    case SpecRunStatus.Unrun:
      return {
        nrOfTests: 0,
        status: MutantRunStatus.Survived,
      };
    case SpecRunStatus.Failed:
      return {
        failureMessage: run.stderrText,
        killedBy: [
          ...run.specPaths,
        ],
        nrOfTests: run.specPaths.length,
        status: MutantRunStatus.Killed,
      };
    case SpecRunStatus.Passed:
      return {
        nrOfTests: run.specPaths.length,
        status: MutantRunStatus.Survived,
      };
    // Stryker disable next-line ConditionalExpression: no member reaches the default, which only the compiler reads
    default:
      return run satisfies never;
  }
};

const bunSpecsRunner = (input: BunSpecsRunnerInput): TestRunner => {
  const disposal = new AbortController();

  const unitPathOf = (fileName: string): UnitRelativePath =>
    UnitRelativePath.create(relative(input.unitFolderPath, fileName));

  return {
    capabilities: (): TestRunnerCapabilities => ({
      reloadEnvironment: true,
    }),
    dispose: (): Promise<void> => {
      disposal.abort();

      return Promise.resolve();
    },
    dryRun: async (options: DryRunOptions): Promise<DryRunResult> =>
      dryRunResultOf({
        run: await input.runSpecs({
          signal: disposal.signal,
          timeoutMs: options.timeout,
          addedVariables: {},
        }),
        unitFolderPath: input.unitFolderPath,
      }),
    mutantRun: async (options: MutantRunOptions): Promise<MutantRunResult> =>
      mutantRunResultOf(
        await input.runSpecs({
          filePaths: [
            unitPathOf(options.sandboxFileName),
          ],
          signal: disposal.signal,
          timeoutMs: options.timeout,
          addedVariables: {
            [ACTIVE_MUTANT_VARIABLE_NAME]: options.activeMutant.id,
          },
        }),
      ),
  };
};

export { bunSpecsRunner };
