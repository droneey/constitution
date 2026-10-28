import type { Version } from '#/kernel/value-objects';

enum ReleaseLookup {
  Found = 'found',
  Unanswered = 'unanswered',
  Refused = 'refused',
  Unreadable = 'unreadable',
}

type LatestRelease =
  | {
      readonly lookup: ReleaseLookup.Found;
      readonly version: Version;
    }
  | {
      readonly lookup: ReleaseLookup.Unanswered;
      readonly reason: string;
    }
  | {
      readonly lookup: ReleaseLookup.Refused;
      readonly status: number;
    }
  | {
      readonly lookup: ReleaseLookup.Unreadable;
    };

export type { LatestRelease };
export { ReleaseLookup };
