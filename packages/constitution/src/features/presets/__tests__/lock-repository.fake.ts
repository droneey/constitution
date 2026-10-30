import type { AbsolutePath } from '#/kernel/value-objects';

import type { LockRead } from '../domain/lock/entities';
import { LockReadStatus } from '../domain/lock/entities';

interface FakeLockRepository {
  readonly read: (unitFolderPath: AbsolutePath) => LockRead;
}

const createFakeLockRepository = (
  locks: Readonly<Record<string, LockRead>> = {},
): FakeLockRepository => ({
  read: (unitFolderPath: AbsolutePath): LockRead =>
    locks[unitFolderPath] ?? {
      lock: {},
      status: LockReadStatus.Read,
    },
});

export { createFakeLockRepository };
