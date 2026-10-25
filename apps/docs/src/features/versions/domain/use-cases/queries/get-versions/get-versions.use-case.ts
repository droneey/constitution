import type { VersionsQueryRepository } from '../../../contracts';
import type { Versions } from '../../../entities';

export type GetVersions = (signal: AbortSignal) => Promise<Versions>;

export const createGetVersions =
  (repository: VersionsQueryRepository): GetVersions =>
  (signal: AbortSignal): Promise<Versions> =>
    repository.read(signal);
