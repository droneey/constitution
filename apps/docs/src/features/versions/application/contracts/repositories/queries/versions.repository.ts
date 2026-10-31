import type { Versions } from '../../../../domain/versions/entities';

export interface VersionsQueryRepository {
  /** @throws {VersionsError} when the site answers no list of releases, in time or at all */
  readonly read: (signal: AbortSignal) => Promise<Versions>;
}
