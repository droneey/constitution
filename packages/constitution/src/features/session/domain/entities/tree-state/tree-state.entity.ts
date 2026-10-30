import type { TreeFingerprint } from '../../value-objects';

enum TreeStateStatus {
  Read = 'read',
  NoRepository = 'no-repository',
  Failed = 'failed',
}

type TreeState =
  | {
      readonly fingerprint: TreeFingerprint;
      readonly status: TreeStateStatus.Read;
    }
  | {
      readonly status: TreeStateStatus.NoRepository;
    }
  | {
      readonly reason: string;
      readonly status: TreeStateStatus.Failed;
    };

export type { TreeState };
export { TreeStateStatus };
