import type { UnitRelativePath } from '#/kernel/value-objects';

import type { MutationRunner } from '../application/contracts';
import type { MutationTarget, ToolExitCode } from '../domain/entities';
import type { ConfigurationError, MutationRunError } from '../domain/errors';

interface FakeMutationRunner extends MutationRunner {
  readonly targetsRun: readonly (readonly MutationTarget[])[];
  readonly wholeRunCount: () => number;
}

type FakeRunEnd =
  | {
      readonly exitCode: ToolExitCode;
      readonly mutatedOfRejection?: ConfigurationError;
      readonly unmutatedPaths?: readonly UnitRelativePath[];
    }
  | {
      readonly runFailure: MutationRunError;
    };

const fakeMutationRunner = (runEnd: FakeRunEnd): FakeMutationRunner => {
  const targetsRun: (readonly MutationTarget[])[] = [];
  let wholeRunCount = 0;

  const ended = (): ToolExitCode => {
    if ('runFailure' in runEnd) {
      throw runEnd.runFailure;
    }

    return runEnd.exitCode;
  };

  return {
    mutatedOf: (filePaths) => {
      if ('mutatedOfRejection' in runEnd && runEnd.mutatedOfRejection !== undefined) {
        return Promise.reject(runEnd.mutatedOfRejection);
      }

      return Promise.resolve(
        filePaths.filter(
          (filePath) => !('unmutatedPaths' in runEnd && runEnd.unmutatedPaths?.includes(filePath)),
        ),
      );
    },
    runAll: () => {
      wholeRunCount += 1;

      return ended();
    },
    runTargets: (targets) => {
      targetsRun.push(targets);

      return ended();
    },
    targetsRun,
    wholeRunCount: () => wholeRunCount,
  };
};

export { fakeMutationRunner };
