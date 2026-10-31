import type { ProjectWarning } from '#/kernel/entities';
import type { AbsolutePath, Version } from '#/kernel/value-objects';

import type { DigestListing } from './digest-listing.entity';
import type { SessionState } from './session-state.entity';

interface DigestRelease {
  readonly folderPath: AbsolutePath;
  readonly version: Version;
}

enum DigestKind {
  NoRelease = 'no-release',
  Unparsed = 'unparsed',
  Resolved = 'resolved',
}

type DigestContents =
  | {
      readonly kind: DigestKind.NoRelease;
      readonly releaseFolderPath: AbsolutePath;
    }
  | {
      readonly core: string;
      readonly kind: DigestKind.Unparsed;
      readonly lines: readonly number[];
      readonly release: DigestRelease;
    }
  | {
      readonly core: string;
      readonly isStartup: boolean;
      readonly kind: DigestKind.Resolved;
      readonly listing: DigestListing;
      readonly release: DigestRelease;
      readonly warnings: readonly ProjectWarning[];
    };

interface SessionDigest {
  readonly contents: DigestContents;
  readonly state?: SessionState;
}

export type { DigestContents, DigestRelease, SessionDigest };
export { DigestKind };
