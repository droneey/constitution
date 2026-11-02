import type { AbsolutePath, BlockId } from '#/kernel/value-objects';
import { RepositoryRelativePath } from '#/kernel/value-objects';

import type { FingerprintMark, ParsedState } from '../../session/entities';
import { ActiveBlocks, SessionMark } from '../../session/entities';
import { HookEventName } from '../../shared/entities';
import type { TreeState } from '../../tree-state/entities';
import { TreeStateStatus } from '../../tree-state/entities';
import type { TreeFingerprint } from '../../tree-state/value-objects';
import type { ReviewDebt } from './review-debt.entity';
import type { StopEvent } from './stop-event.entity';

const REVIEWER = 'constitution:reviewer';

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

type StopMarks = Readonly<Record<FingerprintMark, TreeFingerprint | undefined>>;

/** What the session holds of the stopping agent's changes when the tree was read. */
interface OwnChanges {
  readonly own: readonly AbsolutePath[];
  readonly reviewOwed: readonly ReviewDebt[];
  readonly state: ParsedState;
}

const isReviewerStop = (event: StopEvent): boolean =>
  // Stryker disable next-line ConditionalExpression: the test only narrows the type; no other event names an agent
  event.event === HookEventName.SubagentStop &&
  (event.agentType === REVIEWER || event.agentName === REVIEWER);

const governingBlocksOf = (input: {
  paths: readonly AbsolutePath[];
  state: ParsedState;
}): readonly BlockId[] => [
  ...new Set(
    input.paths.flatMap((path) => {
      const inner = RepositoryRelativePath.fromAbsolute(input.state.repositoryFolderPath, path);

      return inner === undefined
        ? []
        : ActiveBlocks.governing(input.state, inner).map((block) => block.id);
    }),
  ),
];

const missingStepsOf = (input: {
  blocksToReview: readonly BlockId[];
  isChecked: boolean;
  own: readonly AbsolutePath[];
}): readonly HandBackStep[] => [
  ...(input.isChecked || input.own.length === 0
    ? []
    : [
        HandBackStep.Check,
      ]),
  ...(input.blocksToReview.length === 0
    ? []
    : [
        HandBackStep.Review,
      ]),
];

// Why: a subagent cannot start the reviewer, so it answers for the check of its own changes
// alone, and the main thread reviews them with its own.
const judgementOfOwnChanges = (
  input: OwnChanges & {
    isMainThread: boolean;
    marks: StopMarks;
    now: TreeFingerprint;
  },
): StopJudgement | undefined => {
  const { marks, now, own, reviewOwed } = input;

  if (now === marks[SessionMark.Turn] || own.length + reviewOwed.length === 0) {
    return undefined;
  }

  const blocksToReview =
    !input.isMainThread || now === marks[SessionMark.Reviewed]
      ? []
      : governingBlocksOf({
          paths: [
            ...own,
            ...reviewOwed.map((debt) => debt.path),
          ],
          state: input.state,
        });
  const missing = missingStepsOf({
    blocksToReview,
    isChecked: now === marks[SessionMark.Checked],
    own,
  });

  if (missing.length > 0) {
    return {
      blocks: blocksToReview,
      fingerprint: now,
      missing,
      subagentChanges: missing.includes(HandBackStep.Review) ? reviewOwed : [],
      verdict: StopVerdict.Blocked,
    };
  }

  return input.isMainThread
    ? {
        subagentChanges: reviewOwed,
        verdict: StopVerdict.Covered,
      }
    : undefined;
};

/** The stop's judgement: the reviewer's, or what the agent's own changes still owe. */
const judge = (
  input: OwnChanges & {
    event: StopEvent;
    isMainThread: boolean;
    marks: StopMarks;
    tree: TreeState;
    unjudged: string | undefined;
  },
): StopJudgement | undefined => {
  const { event, tree } = input;

  if (isReviewerStop(event)) {
    return tree.status === TreeStateStatus.Read
      ? {
          fingerprint: tree.fingerprint,
          verdict: StopVerdict.Reviewed,
        }
      : undefined;
  }

  if (event.isHookActive) {
    return undefined;
  }

  switch (tree.status) {
    case TreeStateStatus.NoRepository:
      return undefined;
    case TreeStateStatus.Failed:
      return tree.reason === input.unjudged
        ? undefined
        : {
            reason: tree.reason,
            verdict: StopVerdict.Unjudged,
          };
    case TreeStateStatus.Read:
      return judgementOfOwnChanges({
        ...input,
        now: tree.fingerprint,
      });
  }
};

const StopJudgement = {
  judge,
} as const;

export type { StopMarks };
export { HandBackStep, StopJudgement, StopVerdict };
