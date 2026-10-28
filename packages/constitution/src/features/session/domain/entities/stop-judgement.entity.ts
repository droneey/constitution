import type { BlockId } from '#/kernel/value-objects';

import type { TreeFingerprint } from '../value-objects';

enum StopVerdict {
  /** the reviewer finished: the tree it reviewed is recorded */
  Reviewed = 'reviewed',
  /** the tree changed since the check last passed: the agent runs it before it hands back */
  Blocked = 'blocked',
  /** the changed files fall under active blocks the reviewer has not reviewed them against */
  Review = 'review',
  /** git failed to report the tree, so the gate cannot judge it */
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
      /** the blocks the changed files fall under, in their order */
      readonly blocks: readonly BlockId[];
      readonly verdict: StopVerdict.Review;
    }
  | {
      /** what git or the system said of the failure */
      readonly reason: string;
      readonly verdict: StopVerdict.Unjudged;
    };

export type { StopJudgement };
export { StopVerdict };
