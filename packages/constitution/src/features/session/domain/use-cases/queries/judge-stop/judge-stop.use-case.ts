import { ConfigReadStatus } from '#/kernel/entities';

import type { WorkingTree } from '../../../contracts';
import { TreeStateStatus } from '../../../contracts';
import type { SessionQueryRepository } from '../../../contracts/repositories/queries';
import type { FingerprintMark, StopEvent, StopJudgement } from '../../../entities';
import { HookEventName, SessionMark, SessionState, StopVerdict } from '../../../entities';
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

  if (input.isHookActive || tree.status === TreeStateStatus.NoRepository) {
    return undefined;
  }

  if (tree.status === TreeStateStatus.Failed) {
    return tree.reason === sessions.unjudged(session)
      ? undefined
      : {
          reason: tree.reason,
          verdict: StopVerdict.Unjudged,
        };
  }

  const now = tree.fingerprint;
  const turn = markOf(SessionMark.Turn);

  if (now !== turn && now !== markOf(SessionMark.Checked) && now !== markOf(SessionMark.Blocked)) {
    return {
      fingerprint: now,
      verdict: StopVerdict.Blocked,
    };
  }

  if (input.event !== HookEventName.Stop || now === turn || now === markOf(SessionMark.Reviewed)) {
    return undefined;
  }

  const blocks = [
    ...new Set(
      input.workingTree
        .changedAndUntrackedFiles(state.repositoryFolderPath)
        .flatMap((path) => SessionState.governing(state, path).map((block) => block.id)),
    ),
  ];

  return blocks.length === 0
    ? undefined
    : {
        blocks,
        verdict: StopVerdict.Review,
      };
};

export { judgeStop };
