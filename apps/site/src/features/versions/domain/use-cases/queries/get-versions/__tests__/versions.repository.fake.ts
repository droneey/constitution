import type { VersionsRepository } from '../../../../contracts';
import type { Versions } from '../../../../entities';

/** the repository in memory, with the signal of every read it was asked for */
interface FakeVersionsRepository extends VersionsRepository {
  signals: AbortSignal[];
}

/** answers its versions, or fails with its error */
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
