import type { LockRead } from '../../../entities';

interface LockQueryRepository {
  /** folder is absolute; an empty lock where none is */
  readonly read: (folder: string) => LockRead;
}

export type { LockQueryRepository };
