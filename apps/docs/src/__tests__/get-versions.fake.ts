import type { GetVersions, Versions } from '#/features/versions';

interface FakeGetVersions {
  getVersions: GetVersions;
  signals: AbortSignal[];
}

/** waits when given no answer; a read rejects once its signal aborts, as `fetch` does */
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
