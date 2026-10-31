import { ConfigReadStatus } from '#/kernel/entities';
import type { AbsolutePath, BlockId } from '#/kernel/value-objects';
import { RepositoryRelativePath } from '#/kernel/value-objects';

import type { WorkingTree } from '../../../contracts';
import { TreeStateStatus } from '../../../contracts';
import type { SessionQueryRepository } from '../../../contracts/repositories/queries';
import type {
  FingerprintMark,
  ParsedState,
  ReviewDebt,
  StopEvent,
  StopJudgement,
} from '../../../entities';
import {
  ActiveBlocks,
  HandBackStep,
  HookEventName,
  SessionAgent,
  SessionMark,
  StopVerdict,
} from '../../../entities';
import type { TreeFingerprint } from '../../../value-objects';

const REVIEWER = 'constitution:reviewer';

type JudgeStopInput = StopEvent & {
  readonly sessions: SessionQueryRepository;
  readonly workingTree: WorkingTree;
};

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
const judgementOfOwnChanges = (input: {
  isMainThread: boolean;
  markOf: (mark: FingerprintMark) => TreeFingerprint | undefined;
  now: TreeFingerprint;
  own: readonly AbsolutePath[];
  reviewOwed: readonly ReviewDebt[];
  state: ParsedState;
}): StopJudgement | undefined => {
  const { markOf, now, own, reviewOwed } = input;

  if (now === markOf(SessionMark.Turn) || own.length + reviewOwed.length === 0) {
    return undefined;
  }

  const blocksToReview =
    !input.isMainThread || now === markOf(SessionMark.Reviewed)
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
    isChecked: now === markOf(SessionMark.Checked),
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

const judgeStop = (input: JudgeStopInput): StopJudgement | undefined => {
  const { sessions, session } = input;
  const state = sessions.state(session);

  if (state?.status !== ConfigReadStatus.Parsed) {
    return undefined;
  }

  const tree = input.workingTree.stateOf(state.repositoryFolderPath);

  const markOf = (mark: FingerprintMark): TreeFingerprint | undefined =>
    sessions.fingerprint({
      mark,
      session,
    });

  if (isReviewerStop(input)) {
    return tree.status === TreeStateStatus.Read
      ? {
          fingerprint: tree.fingerprint,
          verdict: StopVerdict.Reviewed,
        }
      : undefined;
  }

  if (input.isHookActive) {
    return undefined;
  }

  switch (tree.status) {
    case TreeStateStatus.NoRepository:
      return undefined;
    case TreeStateStatus.Failed:
      return tree.reason === sessions.unjudged(session)
        ? undefined
        : {
            reason: tree.reason,
            verdict: StopVerdict.Unjudged,
          };
    case TreeStateStatus.Read:
      return judgementOfOwnChanges({
        isMainThread: input.agent === SessionAgent.main,
        markOf,
        now: tree.fingerprint,
        own: sessions.ownChanges(input),
        reviewOwed: sessions.reviewDebt(session),
        state,
      });
    // Stryker disable next-line ConditionalExpression: no status reaches the default, which only the compiler reads
    default:
      return tree satisfies never;
  }
};

export { judgeStop };
