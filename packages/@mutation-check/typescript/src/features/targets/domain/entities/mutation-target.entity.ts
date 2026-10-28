import type { UnitRelativePath } from '#/kernel/value-objects';

import type { LineRange } from '../value-objects';

/** A file to mutate: the lines a change touches, or, with no range, the whole of a new file. */
interface MutationTarget {
  readonly filePath: UnitRelativePath;
  readonly lineRange?: LineRange;
}

export type { MutationTarget };
