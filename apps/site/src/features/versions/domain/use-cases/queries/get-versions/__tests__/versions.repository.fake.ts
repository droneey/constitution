import type { VersionsRepository } from '../../../../contracts';
import type { Versions } from '../../../../entities';

interface FakeVersionsRepository extends VersionsRepository {
  signals: AbortSignal[];
}

export const createFakeVersionsRepository = (answer: Versions | Error): FakeVersionsRepository => {
  const signals: AbortSignal[] = [];

  return {
    read: (signal: AbortSignal): Promise<Versions> => {
      signals.push(signal);

      return answer instanceof Error ? Promise.reject(answer) : Promise.resolve(answer);
    },
    signals,
  };
};
