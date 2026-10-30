import type { Versions } from '../../../../domain/entities';
import type { VersionsQueryRepository } from '../../../contracts';

/** @throws {VersionsError} when the site answers no list of releases, in time or at all */
export type GetVersions = (signal: AbortSignal) => Promise<Versions>;

export const createGetVersions =
  (repository: VersionsQueryRepository): GetVersions =>
  (signal: AbortSignal): Promise<Versions> =>
    repository.read(signal);
