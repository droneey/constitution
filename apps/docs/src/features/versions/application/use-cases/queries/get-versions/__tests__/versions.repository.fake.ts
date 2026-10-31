import type { Versions } from '../../../../../domain/versions/entities';
import type { VersionsQueryRepository } from '../../../../contracts';

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
