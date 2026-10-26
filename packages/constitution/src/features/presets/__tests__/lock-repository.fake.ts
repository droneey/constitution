import type { LockCommandRepository } from '../domain/contracts/repositories/commands';
import type { LockRead } from '../domain/entities';
import { LockReadStatus } from '../domain/entities';

/** The units' locks by their folders; a folder the map does not name keeps none. */
const createFakeLockRepository = (
  locks: Readonly<Record<string, LockRead>> = {},
): LockCommandRepository => ({
  read: (folder: string): LockRead =>
    locks[folder] ?? {
      lock: {},
      status: LockReadStatus.Read,
    },
});

export { createFakeLockRepository };
