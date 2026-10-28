import type { VersionsQueryRepository } from '../../../../contracts';
import type { Versions } from '../../../../entities';

interface FakeVersionsRepository extends VersionsQueryRepository {
  signals: AbortSignal[];
}

export const createFakeVersionsRepository = (versions: Versions): FakeVersionsRepository => {
  const signals: AbortSignal[] = [];

  return {
    read: (signal: AbortSignal): Promise<Versions> => {
      signals.push(signal);

      return Promise.resolve(versions);
    },
    signals,
  };
};
