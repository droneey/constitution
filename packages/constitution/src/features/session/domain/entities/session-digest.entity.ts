import type { BlockListing, ProjectWarning } from '#/kernel/entities';
import type { Version } from '#/kernel/value-objects';

import type { SessionState } from './session-state.entity';

interface DigestRelease {
  readonly folder: string;
  readonly version: Version;
}

enum DigestKind {
  // no release is installed, or one this program cannot read
  NoRelease = 'no-release',
  // constitution.yaml does not parse, so only core applies
  Unparsed = 'unparsed',
  Resolved = 'resolved',
}

type DigestContents =
  | {
      readonly kind: DigestKind.NoRelease;
      readonly releaseFolder: string;
    }
  | {
      readonly core: string;
      readonly kind: DigestKind.Unparsed;
      readonly line: number;
      readonly release: DigestRelease;
    }
  | {
      readonly core: string;
      readonly count: number;
      readonly isStartup: boolean;
      readonly kind: DigestKind.Resolved;
      readonly listing: BlockListing;
      readonly release: DigestRelease;
      readonly warnings: readonly ProjectWarning[];
    };

interface SessionDigest {
  readonly contents: DigestContents;
  /** absent when the release gives no rules */
  readonly state?: SessionState;
}

export type { DigestContents, DigestRelease, SessionDigest };
export { DigestKind };
