import type { BlockId } from '#/kernel/value-objects';

enum StopVerdict {
  /** the reviewer finished: the tree it reviewed is recorded */
  Reviewed = 'reviewed',
  /** the tree changed since the check last passed: the agent runs it before it hands back */
  Blocked = 'blocked',
  /** the changed files fall under active blocks the reviewer has not reviewed them against */
  Review = 'review',
}

type StopJudgement =
  | {
      readonly check: string;
      readonly fingerprint: string;
      readonly verdict: StopVerdict.Blocked;
    }
  | {
      readonly fingerprint: string;
      readonly verdict: StopVerdict.Reviewed;
    }
  | {
      /** the blocks the changed files fall under, in their order */
      readonly blocks: readonly BlockId[];
      readonly verdict: StopVerdict.Review;
    };

export type { StopJudgement };
export { StopVerdict };
