import type { AbsolutePath } from '#/kernel/value-objects';

import type { LockRead } from '../domain/lock/entities';
import { LockReadStatus } from '../domain/lock/entities';

interface FakeLockQueries {
  readonly read: (unitFolderPath: AbsolutePath) => LockRead;
}

const createFakeLockQueries = (
  locks: Readonly<Record<string, LockRead>> = {},
): FakeLockQueries => ({
  read: (unitFolderPath: AbsolutePath): LockRead =>
    locks[unitFolderPath] ?? {
      lock: {},
      status: LockReadStatus.Read,
    },
});

export { createFakeLockQueries };
