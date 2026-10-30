import type { UnitRelativePath } from '#/kernel/value-objects';

import type { LineRange } from '../../value-objects';

interface ChangedFile {
  readonly filePath: UnitRelativePath;
  readonly lineRanges: readonly LineRange[];
}

export type { ChangedFile };
