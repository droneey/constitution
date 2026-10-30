import { tmpdir } from 'node:os';

import type { ChosenSpecsRun, SpecsRequest } from '#/features/specs';
import { runSpecs, unitSpecs } from '#/features/specs';
import { bunTestSpecRunner } from '#/features/specs/infrastructure/bun-test';
import { transpilerImportGraph } from '#/features/specs/infrastructure/transpiler';
import { createCheckMutations, runCheckMutations } from '#/features/targets';
import { gitBranchReader } from '#/features/targets/infrastructure/git';
import { strykerRunner } from '#/features/targets/infrastructure/stryker';
import { workingCopyCodeComparer } from '#/features/targets/infrastructure/working-copy';
import { AbsolutePath } from '#/kernel/value-objects';
import { variablesNamed } from '#/libs/environment';

const PASSED_ON_VARIABLE_NAMES = [
  'HOME',
  'PATH',
  'TMPDIR',
] as const;

const GIT_TIMEOUT_MS = 60_000;

const MILLISECONDS_PER_HOUR = 3_600_000;

// Why: one run is one command, so the bound is the longest run a project may take.
const STRYKER_TIMEOUT_HOURS = 3;

// Why: far past the 1 MiB that spawnSync keeps by default: a branch that rewrites many files has a
// diff that long, and only a runaway run of the specs writes that much error output.
const OUTPUT_LIMIT_BYTES = 268_435_456;

type Environment = Readonly<Record<string, string | undefined>>;

interface MutationCheckInput {
  readonly args: readonly string[];
  readonly environment: Environment;
  readonly unitFolderPath: AbsolutePath;
  readonly writeError: (text: string) => void;
  readonly writeOutput: (text: string) => void;
}

interface SpecsInput {
  readonly environment: Environment;
  readonly unitFolderPath: AbsolutePath;
}

/**
 * @throws {BranchError} when git does not give the change
 * @throws {ConfigurationError} when the Stryker configuration cannot tell which files it
 * mutates
 * @throws {MutationRunError} when Stryker does not run to its end
 */
const runMutationCheck = (input: MutationCheckInput): Promise<number> => {
  const env = variablesNamed({
    environment: input.environment,
    names: PASSED_ON_VARIABLE_NAMES,
  });

  return runCheckMutations({
    args: input.args,
    checkMutations: createCheckMutations({
      branchReader: gitBranchReader({
        env,
        outputLimitBytes: OUTPUT_LIMIT_BYTES,
        scratchFolderPath: AbsolutePath.create(tmpdir()),
        timeoutMs: GIT_TIMEOUT_MS,
        unitFolderPath: input.unitFolderPath,
      }),
      codeComparer: workingCopyCodeComparer({
        unitFolderPath: input.unitFolderPath,
      }),
      runner: strykerRunner({
        env,
        output: 'inherit',
        timeoutMs: STRYKER_TIMEOUT_HOURS * MILLISECONDS_PER_HOUR,
        unitFolderPath: input.unitFolderPath,
      }),
    }),
    writeError: input.writeError,
    writeOutput: input.writeOutput,
  });
};

/**
 * @throws {SpecSettingsError} when the unit's configuration of the specs is not of the shape
 * `bun test` reads
 */
const runSpecsIn = (input: SpecsInput): ((request: SpecsRequest) => Promise<ChosenSpecsRun>) => {
  const specRunner = bunTestSpecRunner({
    env: variablesNamed({
      environment: input.environment,
      names: PASSED_ON_VARIABLE_NAMES,
    }),
    outputLimitBytes: OUTPUT_LIMIT_BYTES,
    unitFolderPath: input.unitFolderPath,
  });
  const specsOfUnit = unitSpecs({
    importGraph: transpilerImportGraph(input.unitFolderPath),
    specRunner,
  });

  return (request) =>
    runSpecs({
      ...request,
      specRunner,
      unitSpecs: specsOfUnit,
    });
};

export { runMutationCheck, runSpecsIn };
