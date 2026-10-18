import type { Versions } from '../../../entities';

export interface VersionsRepository {
  read: (signal: AbortSignal) => Promise<Versions>;
}
