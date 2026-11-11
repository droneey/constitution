import type { AbsolutePath, BlockId } from '#/kernel/value-objects';
import { RepositoryRelativePath } from '#/kernel/value-objects';

import type { FingerprintMark, ParsedState } from '../../session/entities';
import { ActiveBlocks, SessionMark } from '../../session/entities';
import { AgentKind } from '../../session/value-objects';
import { HookEventName } from '../../shared/entities';
import type { HeldFiles, MainLine, TreeSnapshot, TreeState } from '../../tree-state/entities';
import { TreeStateStatus } from '../../tree-state/entities';
import type { TreeFingerprint } from '../../tree-state/value-objects';
import type { ReviewDebt } from './review-debt.entity';
import type { StopEvent } from './stop-event.entity';

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

interface HeldChanges extends OwnChanges {
  readonly unheldDebts: readonly ReviewDebt[];
}

// Why: a file written outside the tree, or written and deleted before it was ever tracked, leaves
// nothing to check or review, and when git cannot tell what the tree holds every file stays owed.
// A file staged for deletion is gone from the index, though git's status still names it.
const heldChangesOf = (
  input: OwnChanges & {
    held: HeldFiles;
    snapshot: TreeSnapshot;
  },
): HeldChanges => {
  const { held, snapshot } = input;

  if (held.status !== TreeStateStatus.Read) {
    return {
      own: input.own,
      reviewOwed: input.reviewOwed,
      state: input.state,
      unheldDebts: [],
    };
  }

  const isHeld = (path: AbsolutePath): boolean =>
    held.paths.has(path) ||
    (snapshot.status === TreeStateStatus.Read && snapshot.fileSignatures.has(path));

  return {
    own: input.own.filter(isHeld),
    reviewOwed: input.reviewOwed.filter((debt) => isHeld(debt.path)),
    state: input.state,
    unheldDebts: input.reviewOwed.filter((debt) => !isHeld(debt.path)),
  };
};

// Why: a tree with no change whose HEAD the remote's main line holds hands back nothing the main
// line lacks, as a switch to the main line after a merge leaves it.
const isAcceptedTree = (input: { mainLine: MainLine; snapshot: TreeSnapshot }): boolean =>
  input.snapshot.status === TreeStateStatus.Read &&
  input.snapshot.fileSignatures.size === 0 &&
  // Stryker disable next-line ConditionalExpression: the test only narrows the type; an unread main line holds no isHeadHeld
  input.mainLine.status === TreeStateStatus.Read &&
  input.mainLine.isHeadHeld;

const isReviewerStop = (event: StopEvent): boolean =>
  // Stryker disable next-line ConditionalExpression: the test only narrows the type; no other event names an agent
  event.event === HookEventName.SubagentStop &&
  (AgentKind.isReviewer(event.agentType) || AgentKind.isReviewer(event.agentName));

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
  input: HeldChanges & {
    isMainThread: boolean;
    marks: StopMarks;
    now: TreeFingerprint;
  },
): StopJudgement | undefined => {
  const { marks, now, own, reviewOwed, unheldDebts } = input;

  if (now === marks[SessionMark.Turn]) {
    return;
  }

  // Why: a debt on a file the tree no longer holds owes nothing, and the coordinator's stop settles
  // it, so a file written later under its name is never owed for the subagent that wrote the first.
  if (own.length + reviewOwed.length === 0) {
    return input.isMainThread && unheldDebts.length > 0
      ? {
          subagentChanges: unheldDebts,
          verdict: StopVerdict.Covered,
        }
      : undefined;
  }

  // Why: a check started in the background wakes the agent once it ends, and until then neither the
  // check nor the review it comes before can be done again on this tree.
  if (now === marks[SessionMark.CheckStarted] && now !== marks[SessionMark.Checked]) {
    return;
  }

  // Why: the reviewer the agent dispatched runs on in the background until it reviewed the tree,
  // and its stop wakes the agent with what it found, so the agent waiting on it owes the check alone.
  const isReviewRunning =
    input.isMainThread &&
    now === marks[SessionMark.ReviewStarted] &&
    now !== marks[SessionMark.Reviewed];
  const blocksToReview =
    !input.isMainThread || isReviewRunning || now === marks[SessionMark.Reviewed]
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

  if (isReviewRunning) {
    return;
  }

  return input.isMainThread
    ? {
        subagentChanges: [
          ...reviewOwed,
          ...unheldDebts,
        ],
        verdict: StopVerdict.Covered,
      }
    : undefined;
};

/** The stop's judgement: the reviewer's, or what the agent's own changes still owe. */
const judge = (
  input: OwnChanges & {
    event: StopEvent;
    held: HeldFiles;
    isMainThread: boolean;
    mainLine: MainLine;
    marks: StopMarks;
    snapshot: TreeSnapshot;
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
    return;
  }

  switch (tree.status) {
    case TreeStateStatus.NoRepository:
      return;
    case TreeStateStatus.Failed:
      return tree.reason === input.unjudged
        ? undefined
        : {
            reason: tree.reason,
            verdict: StopVerdict.Unjudged,
          };
    case TreeStateStatus.Read:
      return isAcceptedTree(input)
        ? undefined
        : judgementOfOwnChanges({
            ...heldChangesOf(input),
            isMainThread: input.isMainThread,
            marks: input.marks,
            now: tree.fingerprint,
          });
  }
};

const StopJudgement = {
  judge,
} as const;

export type { StopMarks };
export { HandBackStep, StopJudgement, StopVerdict };
