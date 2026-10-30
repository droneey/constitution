import type { BlockId, RepositoryRelativePath } from '#/kernel/value-objects';

import type { TreeFingerprint } from '../../value-objects';
import { HookEventName } from '../hook-event-name';
import type { FingerprintMark } from '../session-mark';
import { SessionMark } from '../session-mark';
import type { ParsedState } from '../session-state';
import { SessionState } from '../session-state';
import type { StopEvent } from '../stop-event';
import type { TreeState } from '../tree-state';
import { TreeStateStatus } from '../tree-state';

const REVIEWER = 'constitution:reviewer';

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

type StopMarks = Readonly<Record<FingerprintMark, TreeFingerprint | undefined>>;

/** A stop is judged at once, or once the files changed in the tree are known. */
type StopCall =
  | {
      readonly isReviewDue: false;
      readonly judgement: StopJudgement | undefined;
    }
  | {
      readonly isReviewDue: true;
    };

type JudgementRecord =
  | {
      readonly fingerprint: TreeFingerprint;
      readonly mark: Exclude<FingerprintMark, SessionMark.Turn | SessionMark.Checked>;
    }
  | {
      readonly mark: SessionMark.Unjudged;
      readonly reason: string;
    };

const isReviewerStop = (event: StopEvent): boolean =>
  // Stryker disable next-line ConditionalExpression: the test only narrows the type; no other event names an agent
  event.event === HookEventName.SubagentStop &&
  (event.agentType === REVIEWER || event.agentName === REVIEWER);

const judged = (judgement: StopJudgement | undefined): StopCall => ({
  isReviewDue: false,
  judgement,
});

const judge = (input: {
  event: StopEvent;
  marks: StopMarks;
  tree: TreeState;
  unjudged: string | undefined;
}): StopCall => {
  const { event, marks, tree } = input;

  if (isReviewerStop(event)) {
    return tree.status === TreeStateStatus.Read
      ? judged({
          fingerprint: tree.fingerprint,
          verdict: StopVerdict.Reviewed,
        })
      : judged(undefined);
  }

  if (event.isHookActive || tree.status === TreeStateStatus.NoRepository) {
    return judged(undefined);
  }

  if (tree.status === TreeStateStatus.Failed) {
    return tree.reason === input.unjudged
      ? judged(undefined)
      : judged({
          reason: tree.reason,
          verdict: StopVerdict.Unjudged,
        });
  }

  const now = tree.fingerprint;
  const turn = marks[SessionMark.Turn];

  if (now !== turn && now !== marks[SessionMark.Checked] && now !== marks[SessionMark.Blocked]) {
    return judged({
      fingerprint: now,
      verdict: StopVerdict.Blocked,
    });
  }

  if (event.event !== HookEventName.Stop || now === turn || now === marks[SessionMark.Reviewed]) {
    return judged(undefined);
  }

  return {
    isReviewDue: true,
  };
};

const reviewOf = (input: {
  changed: readonly RepositoryRelativePath[];
  state: ParsedState;
}): StopJudgement | undefined => {
  const blocks = [
    ...new Set(
      input.changed.flatMap((path) =>
        SessionState.governing(input.state, path).map((block) => block.id),
      ),
    ),
  ];

  return blocks.length === 0
    ? undefined
    : {
        blocks,
        verdict: StopVerdict.Review,
      };
};

const recordOf = (judgement: StopJudgement): JudgementRecord | undefined => {
  switch (judgement.verdict) {
    case StopVerdict.Review:
      return undefined;
    case StopVerdict.Unjudged:
      return {
        mark: SessionMark.Unjudged,
        reason: judgement.reason,
      };
    case StopVerdict.Reviewed:
      return {
        fingerprint: judgement.fingerprint,
        mark: SessionMark.Reviewed,
      };
    case StopVerdict.Blocked:
      return {
        fingerprint: judgement.fingerprint,
        mark: SessionMark.Blocked,
      };
    // Stryker disable next-line ConditionalExpression: no verdict reaches the default, which only the compiler reads
    default:
      return judgement satisfies never;
  }
};

const StopJudgement = {
  judge,
  recordOf,
  reviewOf,
} as const;

export type { StopMarks };
export { StopJudgement, StopVerdict };
