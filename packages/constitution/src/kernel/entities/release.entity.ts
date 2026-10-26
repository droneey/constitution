import type { Version } from '../value-objects';

enum ReleaseStatus {
  Installed = 'installed',
  Missing = 'missing',
  /** its block format is older than the oldest this program reads */
  Older = 'older',
  /** its block format is newer than the newest this program reads */
  Newer = 'newer',
}

type Release =
  | {
      readonly status: ReleaseStatus.Installed;
      readonly version: Version;
    }
  | {
      readonly status: ReleaseStatus.Missing;
    }
  | {
      readonly status: ReleaseStatus.Older;
    }
  | {
      readonly format: number;
      readonly status: ReleaseStatus.Newer;
    };

const NEWEST_FORMAT = 4;
const OLDEST_FORMAT = 4;

export type { Release };
export { NEWEST_FORMAT, OLDEST_FORMAT, ReleaseStatus };
