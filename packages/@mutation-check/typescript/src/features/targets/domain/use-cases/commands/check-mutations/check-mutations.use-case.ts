import type { UnitRelativePath } from '#/kernel/value-objects';

import type { Branch, BranchReader, CodeComparer, MutationRunner } from '../../../contracts';
import type { MutationTarget } from '../../../entities';

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
      readonly exitCode: number;
      readonly status: CheckStatus.Ran;
    };

interface CheckMutationsInput {
  readonly branchReader: BranchReader;
  readonly codeComparer: CodeComparer;
  readonly runner: MutationRunner;
  readonly scope: CheckScope;
}

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
    ...input.branch.untrackedPaths
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

const checkBranch = async (input: CheckMutationsInput): Promise<CheckOutcome> => {
  const branch = input.branchReader.read();
  const mutatedPaths = new Set(
    await input.runner.mutatedOf([
      ...branch.changedFiles.map(({ filePath }) => filePath),
      ...branch.untrackedPaths,
    ]),
  );
  const targets = codeChangedTargetsOf({
    branch,
    codeComparer: input.codeComparer,
    mutatedPaths,
  });

  if (targets.length === 0) {
    return {
      status: CheckStatus.NothingChanged,
    };
  }

  return {
    exitCode: input.runner.run(targets),
    status: CheckStatus.Ran,
  };
};

/**
 * @throws BranchError when the branch cannot be read.
 * @throws ConfigurationError when the configuration cannot tell which files it mutates.
 * @throws MutationRunError when the mutation tool does not run to its end.
 */
const checkMutations = async (input: CheckMutationsInput): Promise<CheckOutcome> => {
  switch (input.scope) {
    case CheckScope.Everything:
      return {
        exitCode: input.runner.run(),
        status: CheckStatus.Ran,
      };
    case CheckScope.Branch:
      return await checkBranch(input);
    // Stryker disable next-line ConditionalExpression: no member reaches the default, which only the compiler reads
    default:
      return input.scope satisfies never;
  }
};

export type { CheckMutationsInput, CheckOutcome };
export { CheckScope, CheckStatus, checkMutations };
