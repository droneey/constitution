import type { Version } from '#/kernel/value-objects';

enum ReleaseLookup {
  Found = 'found',
  /** the call failed: the network is down, a proxy refused it, or GitHub did not answer in time */
  Unanswered = 'unanswered',
  /** GitHub answered with a status of failure */
  Refused = 'refused',
  /** the answer runs past the size or the depth read, is no JSON, or names no release version */
  Unreadable = 'unreadable',
}

type LatestRelease =
  | {
      readonly lookup: ReleaseLookup.Found;
      readonly version: Version;
    }
  | {
      readonly lookup: ReleaseLookup.Unanswered;
      /** what the failed call said, as the system words it */
      readonly reason: string;
    }
  | {
      readonly lookup: ReleaseLookup.Refused;
      /** the HTTP status GitHub answered with */
      readonly status: number;
    }
  | {
      readonly lookup: ReleaseLookup.Unreadable;
    };

export type { LatestRelease };
export { ReleaseLookup };
