import type { UnitRelativePath } from '#/kernel/value-objects';

import type { LineRange } from '../value-objects';

/** A file the branch changed, by the lines it now holds that the change added or rewrote. */
interface ChangedFile {
  readonly filePath: UnitRelativePath;
  readonly lineRanges: readonly LineRange[];
}

export type { ChangedFile };
