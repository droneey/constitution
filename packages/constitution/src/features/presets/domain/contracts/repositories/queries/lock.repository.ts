import type { AbsolutePath } from '#/kernel/value-objects';

import type { LockRead } from '../../../entities';

interface LockQueryRepository {
  /** an empty lock where none is */
  readonly read: (unitFolderPath: AbsolutePath) => LockRead;
}

export type { LockQueryRepository };
