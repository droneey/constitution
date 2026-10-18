import type { Versions } from '../../../entities';

/** where the list of releases is read */
export interface VersionsRepository {
  read: (signal: AbortSignal) => Promise<Versions>;
}
