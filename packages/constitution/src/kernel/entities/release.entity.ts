import type { AbsolutePath, Version } from '../value-objects';

enum ReleaseStatus {
  Installed = 'installed',
  Missing = 'missing',
  /** its block format is older than the oldest this program reads */
  Older = 'older',
  /** its block format is newer than the newest this program reads */
  Newer = 'newer',
  /** its manifest is missing or cannot be read */
  ManifestUnreadable = 'manifest-unreadable',
  /** its manifest is no JSON object */
  ManifestNotObject = 'manifest-not-object',
  /** its manifest gives fields of another form */
  ManifestMalformed = 'manifest-malformed',
  /** its manifest names a block format this program reads, and no version */
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
      /** the fields of another form, each by its path, at least one */
      readonly fields: readonly string[];
      readonly manifest: AbsolutePath;
      readonly status: ReleaseStatus.ManifestMalformed;
    };

const NEWEST_FORMAT = 4;
const OLDEST_FORMAT = 4;

export type { Release };
export { NEWEST_FORMAT, OLDEST_FORMAT, ReleaseStatus };
