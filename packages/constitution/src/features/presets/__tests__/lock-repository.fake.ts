import type { LockRead } from '../domain/entities';
import { LockReadStatus } from '../domain/entities';

interface FakeLockRepository {
  readonly read: (folder: string) => LockRead;
}

/** The units' locks by their folders; a folder the map does not name keeps none. */
const createFakeLockRepository = (
  locks: Readonly<Record<string, LockRead>> = {},
): FakeLockRepository => ({
  read: (folder: string): LockRead =>
    locks[folder] ?? {
      lock: {},
      status: LockReadStatus.Read,
    },
});

export { createFakeLockRepository };
