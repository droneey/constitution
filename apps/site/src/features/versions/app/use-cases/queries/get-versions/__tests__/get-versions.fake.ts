import type { Versions } from '../../../../../domain/entities';
import type { GetVersions } from '../../../../../domain/use-cases';

/** the use case in memory, with the signal of every read it was asked for */
interface FakeGetVersions {
  getVersions: GetVersions;
  signals: AbortSignal[];
}

/**
 * Answers its versions, fails with its error, or waits when given neither; a read rejects once its
 * signal aborts, as `fetch` does.
 */
export const createFakeGetVersions = (answer?: Versions | Error): FakeGetVersions => {
  const signals: AbortSignal[] = [];

  return {
    getVersions: (signal: AbortSignal): Promise<Versions> =>
      new Promise((resolve, reject) => {
        signals.push(signal);
        signal.addEventListener('abort', () => reject(signal.reason));
        if (answer instanceof Error) {
          reject(answer);
        } else if (answer !== undefined) {
          resolve(answer);
        }
      }),
    signals,
  };
};
