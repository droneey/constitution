import type { BlockId } from '#/kernel/value-objects';

import type { TreeFingerprint } from '../value-objects';

enum StopVerdict {
  Reviewed = 'reviewed',
  Blocked = 'blocked',
  Review = 'review',
  Unjudged = 'unjudged',
}

type StopJudgement =
  | {
      readonly fingerprint: TreeFingerprint;
      readonly verdict: StopVerdict.Blocked;
    }
  | {
      readonly fingerprint: TreeFingerprint;
      readonly verdict: StopVerdict.Reviewed;
    }
  | {
      readonly blocks: readonly BlockId[];
      readonly verdict: StopVerdict.Review;
    }
  | {
      readonly reason: string;
      readonly verdict: StopVerdict.Unjudged;
    };

export type { StopJudgement };
export { StopVerdict };
