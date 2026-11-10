import type { TreeFingerprint } from '../value-objects';
import type { FileSignatures } from './shell-tree.entity';

enum TreeStateStatus {
  Read = 'read',
  NoRepository = 'no-repository',
  Failed = 'failed',
}

type UnreadTree =
  | {
      readonly status: TreeStateStatus.NoRepository;
    }
  | {
      readonly reason: string;
      readonly status: TreeStateStatus.Failed;
    };

type TreeState =
  | {
      readonly fingerprint: TreeFingerprint;
      readonly status: TreeStateStatus.Read;
    }
  | UnreadTree;

type MainLine =
  | {
      readonly isHeadHeld: boolean;
      readonly status: TreeStateStatus.Read;
    }
  | UnreadTree;

type TreeSnapshot =
  | {
      readonly fileSignatures: FileSignatures;
      readonly status: TreeStateStatus.Read;
    }
  | UnreadTree;

export type { MainLine, TreeSnapshot, TreeState, UnreadTree };
export { TreeStateStatus };
