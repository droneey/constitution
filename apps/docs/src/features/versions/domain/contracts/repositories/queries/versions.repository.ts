import type { Versions } from '../../../entities';

export interface VersionsQueryRepository {
  readonly read: (signal: AbortSignal) => Promise<Versions>;
}
