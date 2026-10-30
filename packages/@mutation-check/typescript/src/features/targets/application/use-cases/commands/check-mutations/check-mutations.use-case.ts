import type { UnitRelativePath } from '#/kernel/value-objects';

import type { CheckOutcome } from '../../../../domain/entities';
import { CheckScope, CheckStatus, MutationTarget } from '../../../../domain/entities';
import type { Branch, BranchReader, CodeComparer, MutationRunner } from '../../../contracts';

/**
 * @throws {BranchError} when the branch cannot be read
 * @throws {ConfigurationError} when the configuration cannot tell which files it mutates
 * @throws {MutationRunError} when the mutation tool does not run to its end
 */
type CheckMutations = (scope: CheckScope) => Promise<CheckOutcome>;

interface CheckMutationsPorts {
  readonly branchReader: BranchReader;
  readonly codeComparer: CodeComparer;
  readonly runner: MutationRunner;
}

/** @throws {BranchError} when the base texts cannot be read */
const codeChangedPathsOf = (input: {
  branch: Branch;
  codeComparer: CodeComparer;
  mutatedPaths: ReadonlySet<UnitRelativePath>;
}): ReadonlySet<UnitRelativePath> => {
  const changedPaths = input.branch.changedFiles
    .map(({ filePath }) => filePath)
    .filter((filePath) => input.mutatedPaths.has(filePath));
  const baseTexts = input.branch.baseTextsOf(changedPaths);

  return new Set(
    changedPaths.filter((filePath) =>
      input.codeComparer.hasCodeChanged(filePath, baseTexts.get(filePath)),
    ),
  );
};

/**
 * @throws {BranchError} when the branch cannot be read
 * @throws {ConfigurationError} when the configuration cannot tell which files it mutates
 * @throws {MutationRunError} when the mutation tool does not run to its end
 */
const checkBranch = async (ports: CheckMutationsPorts): Promise<CheckOutcome> => {
  const branch = ports.branchReader.read();
  const mutatedPaths = new Set(
    await ports.runner.mutatedOf([
      ...branch.changedFiles.map(({ filePath }) => filePath),
      ...branch.newFilePaths,
    ]),
  );
  const targets = MutationTarget.targetsOf({
    changedFiles: branch.changedFiles,
    codeChangedPaths: codeChangedPathsOf({
      branch,
      codeComparer: ports.codeComparer,
      mutatedPaths,
    }),
    mutatedPaths,
    newFilePaths: branch.newFilePaths,
  });

  if (targets.length === 0) {
    return {
      status: CheckStatus.NothingChanged,
    };
  }

  return {
    exitCode: ports.runner.runTargets(targets),
    status: CheckStatus.Ran,
  };
};

const createCheckMutations =
  (ports: CheckMutationsPorts): CheckMutations =>
  async (scope: CheckScope): Promise<CheckOutcome> => {
    switch (scope) {
      case CheckScope.Everything:
        return {
          exitCode: ports.runner.runAll(),
          status: CheckStatus.Ran,
        };
      case CheckScope.Branch:
        return await checkBranch(ports);
      // Stryker disable next-line ConditionalExpression: no member reaches the default, which only the compiler reads
      default:
        return scope satisfies never;
    }
  };

export type { CheckMutations };
export { createCheckMutations };
