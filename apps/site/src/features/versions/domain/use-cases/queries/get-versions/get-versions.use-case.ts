import type { VersionsRepository } from '../../../contracts';
import type { Versions } from '../../../entities';

export type GetVersions = (signal: AbortSignal) => Promise<Versions>;

export const createGetVersions =
  (repository: VersionsRepository): GetVersions =>
  (signal: AbortSignal): Promise<Versions> =>
    repository.read(signal);
