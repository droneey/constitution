import type { AbsolutePath } from '#/kernel/value-objects';

import type { LockRead } from '../../../../domain/lock/entities';

interface LockQueries {
  readonly read: (unitFolderPath: AbsolutePath) => LockRead;
}

export type { LockQueries };
