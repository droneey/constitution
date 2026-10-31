import type { BlockId } from '#/kernel/value-objects';

import type { TreeFingerprint } from '../value-objects';
import type { ReviewDebt } from './review-debt.entity';

enum StopVerdict {
  Reviewed = 'reviewed',
  Blocked = 'blocked',
  Covered = 'covered',
  Unjudged = 'unjudged',
}

enum HandBackStep {
  Check = 'check',
  Review = 'review',
}

type StopJudgement =
  | {
      readonly blocks: readonly BlockId[];
      readonly fingerprint: TreeFingerprint;
      readonly missing: readonly HandBackStep[];
      readonly subagentChanges: readonly ReviewDebt[];
      readonly verdict: StopVerdict.Blocked;
    }
  | {
      readonly fingerprint: TreeFingerprint;
      readonly verdict: StopVerdict.Reviewed;
    }
  | {
      readonly subagentChanges: readonly ReviewDebt[];
      readonly verdict: StopVerdict.Covered;
    }
  | {
      readonly reason: string;
      readonly verdict: StopVerdict.Unjudged;
    };

export type { StopJudgement };
export { HandBackStep, StopVerdict };
