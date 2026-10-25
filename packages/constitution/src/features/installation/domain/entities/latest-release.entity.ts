import type { Version } from '#/kernel/value-objects';

enum ReleaseLookup {
  Found = 'found',
  Unreachable = 'unreachable',
}

type LatestRelease =
  | {
      readonly lookup: ReleaseLookup.Found;
      readonly version: Version;
    }
  | {
      /** what kept the release from being read: the failed call, the refusing answer, or the body that names none */
      readonly cause: unknown;
      readonly lookup: ReleaseLookup.Unreachable;
    };

export type { LatestRelease };
export { ReleaseLookup };
