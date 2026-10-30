import type { FindingOf } from '#/kernel/types';

import type { FieldIssue } from '../document-read/document-read.entity';
import { ReadStatus } from '../document-read/document-read.entity';

interface PluginManifest {
  readonly name: string;
  readonly repository?: string;
  readonly skills: readonly string[];
}

interface MarketplacePlugin {
  readonly name: string;
  readonly path: string;
  readonly ref?: string;
  readonly repo?: string;
}

interface MarketplaceManifest {
  readonly plugins: readonly MarketplacePlugin[];
}

interface HooksManifest {
  readonly commands: readonly string[];
}

type ManifestRead<T> =
  | {
      readonly status: ReadStatus.Parsed;
      readonly value: T;
    }
  | {
      readonly reason: string;
      readonly status: ReadStatus.NotJson;
    }
  | {
      readonly issues: readonly FieldIssue[];
      readonly status: ReadStatus.Mismatched;
    };

enum ManifestReadCode {
  NotJson = 'manifest-not-json',
  OffSchema = 'manifest-off-schema',
}

interface ManifestReadDetails {
  readonly [ManifestReadCode.NotJson]: {
    readonly reason: string;
  };
  readonly [ManifestReadCode.OffSchema]: {
    readonly field: string;
    readonly reason: string;
  };
}

type Unread = Exclude<
  ManifestRead<unknown>,
  {
    readonly status: ReadStatus.Parsed;
  }
>;

interface UnreadInput {
  readonly path: string;
  readonly read: Unread;
}

const unreadFindings = (input: UnreadInput): readonly FindingOf<ManifestReadDetails>[] => {
  if (input.read.status === ReadStatus.NotJson) {
    return [
      {
        code: ManifestReadCode.NotJson,
        details: {
          reason: input.read.reason,
        },
        path: input.path,
      },
    ];
  }

  return input.read.issues.map(
    (issue): FindingOf<ManifestReadDetails> => ({
      code: ManifestReadCode.OffSchema,
      details: {
        field: issue.field,
        reason: issue.message,
      },
      path: input.path,
    }),
  );
};

const ManifestRead = {
  unreadFindings,
} as const;

export type {
  HooksManifest,
  ManifestReadDetails,
  MarketplaceManifest,
  MarketplacePlugin,
  PluginManifest,
};
export { ManifestRead, ManifestReadCode };
