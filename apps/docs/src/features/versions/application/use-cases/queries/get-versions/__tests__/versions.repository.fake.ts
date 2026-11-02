import type { Versions } from '../../../../../domain/versions/entities';
import type { VersionQueries } from '../../../../contracts';

interface FakeVersionQueries extends VersionQueries {
  signals: AbortSignal[];
}

export const createFakeVersionQueries = (versions: Versions): FakeVersionQueries => {
  const signals: AbortSignal[] = [];

  return {
    read: (signal: AbortSignal): Promise<Versions> => {
      signals.push(signal);

      return Promise.resolve(versions);
    },
    signals,
  };
};
