import type { FindingOf } from '#/kernel/types';

import type { ManifestRead } from '../../../../entities';
import { ReadStatus } from '../../../../entities';

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

export type { ManifestReadDetails };
export { ManifestReadCode, unreadFindings };
