import type { GetVersions, Versions } from '#/features/versions';

export const loadedVersions =
  (versions: Versions): GetVersions =>
  (): Promise<Versions> =>
    Promise.resolve(versions);

/** releases that never arrive */
export const pendingVersions: GetVersions = () => new Promise<Versions>(() => undefined);

export const failedVersions: GetVersions = () =>
  Promise.reject(new Error('versions.json is unreachable'));
