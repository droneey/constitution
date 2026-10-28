import type { AbsolutePath, Version } from '../value-objects';

enum ReleaseStatus {
  Installed = 'installed',
  Missing = 'missing',
  Older = 'older',
  Newer = 'newer',
  ManifestUnreadable = 'manifest-unreadable',
  ManifestNotObject = 'manifest-not-object',
  ManifestMalformed = 'manifest-malformed',
  VersionMissing = 'version-missing',
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
    }
  | {
      readonly manifest: AbsolutePath;
      readonly status:
        | ReleaseStatus.ManifestUnreadable
        | ReleaseStatus.ManifestNotObject
        | ReleaseStatus.VersionMissing;
    }
  | {
      readonly fields: readonly string[];
      readonly manifest: AbsolutePath;
      readonly status: ReleaseStatus.ManifestMalformed;
    };

const NEWEST_FORMAT = 4;
const OLDEST_FORMAT = 4;

export type { Release };
export { NEWEST_FORMAT, OLDEST_FORMAT, ReleaseStatus };
