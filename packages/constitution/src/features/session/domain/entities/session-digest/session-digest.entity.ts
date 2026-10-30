import type { ProjectWarning } from '#/kernel/entities';
import { WarningKind } from '#/kernel/entities';
import type { AbsolutePath, Version } from '#/kernel/value-objects';

import type { ConfigurationsReport } from '../configurations-report';
import { ConfigurationsCheckStatus } from '../configurations-report';
import type { DigestListing } from '../digest-listing';
import type { SessionState } from '../session-state';
import type { TreeState } from '../tree-state';
import { TreeStateStatus } from '../tree-state';

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
      readonly count: number;
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

const configurationsWarningsOf = (report: ConfigurationsReport): readonly ProjectWarning[] =>
  report.status === ConfigurationsCheckStatus.Checked
    ? report.warnings
    : [
        {
          details:
            report.reason === undefined
              ? {}
              : {
                  reason: report.reason,
                },
          kind: WarningKind.ConfigurationsUnchecked,
        },
      ];

const repositoryWarningsOf = (tree: TreeState): readonly ProjectWarning[] =>
  tree.status === TreeStateStatus.NoRepository
    ? [
        {
          details: {},
          kind: WarningKind.NoRepository,
        },
      ]
    : [];

/** The rules' own warnings, then the working tree's, then the configurations'. */
const warningsOf = (input: {
  configurations: ConfigurationsReport;
  rules: readonly ProjectWarning[];
  tree: TreeState;
}): readonly ProjectWarning[] => [
  ...input.rules,
  ...repositoryWarningsOf(input.tree),
  ...configurationsWarningsOf(input.configurations),
];

const SessionDigest = {
  warningsOf,
} as const;

export type { DigestContents, DigestRelease };
export { DigestKind, SessionDigest };
