import type { AbsolutePath, Version } from '../../value-objects';

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

interface ReleaseManifestFields {
  readonly blockFormat: number | undefined;
  readonly manifestPath: AbsolutePath;
  readonly version: Version | undefined;
}

const ofManifest = (input: ReleaseManifestFields): Release => {
  const { blockFormat, version } = input;

  if (blockFormat === undefined || blockFormat < OLDEST_FORMAT) {
    return {
      status: ReleaseStatus.Older,
    };
  }

  if (blockFormat > NEWEST_FORMAT) {
    return {
      format: blockFormat,
      status: ReleaseStatus.Newer,
    };
  }

  if (version === undefined) {
    return {
      manifest: input.manifestPath,
      status: ReleaseStatus.VersionMissing,
    };
  }

  return {
    status: ReleaseStatus.Installed,
    version,
  };
};

const Release = {
  ofManifest,
} as const;

export { OLDEST_FORMAT, Release, ReleaseStatus };
