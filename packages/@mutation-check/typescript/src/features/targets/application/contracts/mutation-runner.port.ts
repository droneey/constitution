import type { UnitRelativePath } from '#/kernel/value-objects';

import type { MutationTarget, ToolExitCode } from '../../domain/entities';

interface MutationRunner {
  /**
   * @throws {ConfigurationError} when the configuration cannot tell which files it mutates
   */
  readonly mutatedOf: (
    filePaths: readonly UnitRelativePath[],
  ) => Promise<readonly UnitRelativePath[]>;
  /** @throws {MutationRunError} when the tool does not run to its end */
  readonly runAll: () => ToolExitCode;
  /** @throws {MutationRunError} when the tool does not run to its end */
  readonly runTargets: (targets: readonly MutationTarget[]) => ToolExitCode;
}

export type { MutationRunner };
