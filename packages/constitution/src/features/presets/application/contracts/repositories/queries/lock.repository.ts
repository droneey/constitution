import type { AbsolutePath } from '#/kernel/value-objects';

import type { LockRead } from '../../../../domain/entities';

interface LockQueryRepository {
  readonly read: (unitFolderPath: AbsolutePath) => LockRead;
}

export type { LockQueryRepository };
