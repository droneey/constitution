import type { UnitRelativePath } from '#/kernel/value-objects';

import type { MutationTarget } from '../entities';

interface MutationRunner {
  /**
   * The files of these the configuration mutates.
   *
   * @throws ConfigurationError when the configuration cannot tell which files it mutates
   */
  readonly mutatedOf: (
    filePaths: readonly UnitRelativePath[],
  ) => Promise<readonly UnitRelativePath[]>;
  /**
   * Mutates the targets, or with none everything the configuration names.
   *
   * @returns the exit code the mutation tool ended with
   * @throws MutationRunError when the tool does not run to its end
   */
  readonly run: (targets?: readonly MutationTarget[]) => number;
}

export type { MutationRunner };
