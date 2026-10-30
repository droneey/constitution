import type { UnitRelativePath } from '#/kernel/value-objects';

import type {
  Branch,
  BranchReader,
  CodeComparer,
  MutationRunner,
  ToolExitCode,
} from '../../../contracts';
import type { MutationTarget } from '../../../../domain/entities';

enum CheckScope {
  Branch = 'branch',
  Everything = 'everything',
}

enum CheckStatus {
  NothingChanged = 'nothing-changed',
  Ran = 'ran',
}

type CheckOutcome =
  | {
      readonly status: CheckStatus.NothingChanged;
    }
  | {
      readonly exitCode: ToolExitCode;
      readonly status: CheckStatus.Ran;
    };

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
const codeChangedTargetsOf = (input: {
  branch: Branch;
  codeComparer: CodeComparer;
  mutatedPaths: ReadonlySet<UnitRelativePath>;
}): readonly MutationTarget[] => {
  const changedFiles = input.branch.changedFiles.filter(({ filePath }) =>
    input.mutatedPaths.has(filePath),
  );
  const baseTexts = input.branch.baseTextsOf(changedFiles.map(({ filePath }) => filePath));

  return [
    ...input.branch.newFilePaths
      .filter((filePath) => input.mutatedPaths.has(filePath))
      .map((filePath) => ({
        filePath,
      })),
    ...changedFiles
      .filter(({ filePath }) =>
        input.codeComparer.hasCodeChanged(filePath, baseTexts.get(filePath)),
      )
      .flatMap(({ filePath, lineRanges }) =>
        lineRanges.map((lineRange) => ({
          filePath,
          lineRange,
        })),
      ),
  ];
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
  const targets = codeChangedTargetsOf({
    branch,
    codeComparer: ports.codeComparer,
    mutatedPaths,
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

export type { CheckMutations, CheckOutcome };
export { CheckScope, CheckStatus, createCheckMutations };
