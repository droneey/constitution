import type { UnitRelativePath } from '#/kernel/value-objects';

import type { LineRange } from '../../value-objects';
import type { ChangedFile } from '../changed-file/changed-file.entity.ts';

interface MutationTarget {
  readonly filePath: UnitRelativePath;
  readonly lineRange?: LineRange;
}

interface TargetsInput {
  readonly changedFiles: readonly ChangedFile[];
  // Why: a change that only reformats a file leaves nothing new to mutate.
  readonly codeChangedPaths: ReadonlySet<UnitRelativePath>;
  readonly mutatedPaths: ReadonlySet<UnitRelativePath>;
  readonly newFilePaths: readonly UnitRelativePath[];
}

const targetsOf = (input: TargetsInput): readonly MutationTarget[] => [
  ...input.newFilePaths
    .filter((filePath) => input.mutatedPaths.has(filePath))
    .map((filePath) => ({
      filePath,
    })),
  ...input.changedFiles
    .filter(
      ({ filePath }) => input.mutatedPaths.has(filePath) && input.codeChangedPaths.has(filePath),
    )
    .flatMap(({ filePath, lineRanges }) =>
      lineRanges.map((lineRange) => ({
        filePath,
        lineRange,
      })),
    ),
];

const MutationTarget = {
  targetsOf,
} as const;

export { MutationTarget };
