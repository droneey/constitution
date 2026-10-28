import type { UnitRelativePath } from '#/kernel/value-objects';

import type { LineRange } from '../value-objects';

interface MutationTarget {
  readonly filePath: UnitRelativePath;
  readonly lineRange?: LineRange;
}

export type { MutationTarget };
