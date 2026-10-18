import type { VersionsRepository } from '../../../contracts';
import type { Versions } from '../../../entities';

/** the releases this site knows of */
export type GetVersions = (signal: AbortSignal) => Promise<Versions>;

/** the use case over the repository the root chooses */
export const createGetVersions =
  (repository: VersionsRepository): GetVersions =>
  (signal: AbortSignal): Promise<Versions> =>
    repository.read(signal);
