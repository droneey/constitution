import type { UnitRelativePath } from '#/kernel/value-objects';

import type { MutationRunner } from '../domain/contracts';
import type { MutationTarget } from '../domain/entities';
import type { ConfigurationError, MutationRunError } from '../domain/errors';

interface FakeMutationRunner extends MutationRunner {
  /** the targets of each run, undefined for a run of everything */
  readonly runs: readonly (readonly MutationTarget[] | undefined)[];
}

type FakeRunEnd =
  | {
      readonly exitCode: number;
      /** the failure of reading which files the configuration mutates */
      readonly mutatedFailure?: ConfigurationError;
      /** the files the configuration leaves out */
      readonly unmutatedPaths?: readonly UnitRelativePath[];
    }
  | {
      readonly runFailure: MutationRunError;
    };

const fakeMutationRunner = (runEnd: FakeRunEnd): FakeMutationRunner => {
  const runs: (readonly MutationTarget[] | undefined)[] = [];

  return {
    mutatedOf: (filePaths) => {
      if ('mutatedFailure' in runEnd && runEnd.mutatedFailure !== undefined) {
        return Promise.reject(runEnd.mutatedFailure);
      }

      return Promise.resolve(
        filePaths.filter(
          (filePath) => !('unmutatedPaths' in runEnd && runEnd.unmutatedPaths?.includes(filePath)),
        ),
      );
    },
    run: (targets) => {
      runs.push(targets);

      if ('runFailure' in runEnd) {
        throw runEnd.runFailure;
      }

      return runEnd.exitCode;
    },
    runs,
  };
};

export { fakeMutationRunner };
