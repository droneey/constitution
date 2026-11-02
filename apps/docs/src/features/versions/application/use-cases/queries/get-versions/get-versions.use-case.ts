import type { Versions } from '../../../../domain/versions/entities';
import type { VersionQueries } from '../../../contracts';

/** @throws {VersionsError} when the site answers no list of releases, in time or at all */
export type GetVersions = (signal: AbortSignal) => Promise<Versions>;

export const createGetVersions =
  (versionQueries: VersionQueries): GetVersions =>
  (signal: AbortSignal): Promise<Versions> =>
    versionQueries.read(signal);
