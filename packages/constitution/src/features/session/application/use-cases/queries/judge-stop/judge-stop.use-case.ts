import { ConfigReadStatus } from '#/kernel/entities';

import type { FingerprintMark } from '../../../../domain/session/entities';
import { SessionMark } from '../../../../domain/session/entities';
import type { StopEvent } from '../../../../domain/stop-judgement/entities';
import { StopJudgement } from '../../../../domain/stop-judgement/entities';
import type { TreeFingerprint } from '../../../../domain/tree-state/value-objects';
import type { WorkingTree } from '../../../contracts';
import type { SessionQueryRepository } from '../../../contracts/repositories/queries';

type JudgeStopInput = StopEvent & {
  readonly sessions: SessionQueryRepository;
  readonly workingTree: WorkingTree;
};

const judgeStop = (input: JudgeStopInput): StopJudgement | undefined => {
  const { sessions, session } = input;
  const state = sessions.state(session);

  if (state?.status !== ConfigReadStatus.Parsed) {
    return undefined;
  }

  const markOf = (mark: FingerprintMark): TreeFingerprint | undefined =>
    sessions.fingerprint({
      mark,
      session,
    });

  const call = StopJudgement.judge({
    event: input,
    marks: {
      [SessionMark.Blocked]: markOf(SessionMark.Blocked),
      [SessionMark.Checked]: markOf(SessionMark.Checked),
      [SessionMark.Reviewed]: markOf(SessionMark.Reviewed),
      [SessionMark.Turn]: markOf(SessionMark.Turn),
    },
    tree: input.workingTree.stateOf(state.repositoryFolderPath),
    unjudged: sessions.unjudged(session),
  });

  if (!call.isReviewDue) {
    return call.judgement;
  }

  return StopJudgement.reviewOf({
    changed: input.workingTree.changedAndUntrackedFiles(state.repositoryFolderPath),
    state,
  });
};

export { judgeStop };
