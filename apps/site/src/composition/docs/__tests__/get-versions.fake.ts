import type { GetVersions, Versions } from '#/features/versions';

/** releases read at once */
export const loadedVersions =
  (versions: Versions): GetVersions =>
  (): Promise<Versions> =>
    Promise.resolve(versions);

/** releases that never arrive */
export const pendingVersions: GetVersions = () => new Promise<Versions>(() => undefined);

/** releases that cannot be read */
export const failedVersions: GetVersions = () =>
  Promise.reject(new Error('versions.json is unreachable'));
