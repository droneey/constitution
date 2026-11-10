import { ConfigReadStatus } from '#/kernel/entities';

import type { FingerprintMark } from '../../../../domain/session/entities';
import { SessionAgent, SessionMark } from '../../../../domain/session/entities';
import type { StopEvent } from '../../../../domain/stop-judgement/entities';
import { StopJudgement } from '../../../../domain/stop-judgement/entities';
import type { TreeFingerprint } from '../../../../domain/tree-state/value-objects';
import type { WorkingTree } from '../../../contracts';
import type { SessionQueries } from '../../../contracts/repositories/queries';

type JudgeStopInput = StopEvent & {
  readonly sessionQueries: SessionQueries;
  readonly workingTree: WorkingTree;
};

const judgeStop = (input: JudgeStopInput): StopJudgement | undefined => {
  const { sessionQueries, session } = input;
  const state = sessionQueries.state(session);

  if (state?.status !== ConfigReadStatus.Parsed) {
    return undefined;
  }

  const markOf = (mark: FingerprintMark): TreeFingerprint | undefined =>
    sessionQueries.fingerprint({
      mark,
      session,
    });

  return StopJudgement.judge({
    event: input,
    isMainThread: input.agent === SessionAgent.main,
    mainLine: input.workingTree.mainLineOf(state.repositoryFolderPath),
    marks: {
      [SessionMark.Checked]: markOf(SessionMark.Checked),
      [SessionMark.ReviewStarted]: markOf(SessionMark.ReviewStarted),
      [SessionMark.Reviewed]: markOf(SessionMark.Reviewed),
      [SessionMark.Turn]: markOf(SessionMark.Turn),
    },
    own: sessionQueries.ownChanges(input),
    reviewOwed: sessionQueries.reviewDebt(session),
    snapshot: input.workingTree.snapshotOf(state.repositoryFolderPath),
    state,
    tree: input.workingTree.stateOf(state.repositoryFolderPath),
    unjudged: sessionQueries.unjudged(session),
  });
};

export { judgeStop };
