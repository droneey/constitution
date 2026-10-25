import type { Versions } from '../../../entities';

export interface VersionsQueryRepository {
  /** @throws {@link VersionsError} when the site answers no list of releases, in time or at all */
  readonly read: (signal: AbortSignal) => Promise<Versions>;
}
