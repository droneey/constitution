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
    return;
  }

  const markOf = (mark: FingerprintMark): TreeFingerprint | undefined =>
    sessionQueries.fingerprint({
      mark,
      session,
    });

  const own = sessionQueries.ownChanges(input);
  const reviewOwed = sessionQueries.reviewDebt(session);

  return StopJudgement.judge({
    event: input,
    held: input.workingTree.heldAmong({
      paths: [
        ...own,
        ...reviewOwed.map((debt) => debt.path),
      ],
      repositoryFolderPath: state.repositoryFolderPath,
    }),
    isMainThread: input.agent === SessionAgent.main,
    mainLine: input.workingTree.mainLineOf(state.repositoryFolderPath),
    marks: {
      [SessionMark.Checked]: markOf(SessionMark.Checked),
      [SessionMark.CheckStarted]: markOf(SessionMark.CheckStarted),
      [SessionMark.ReviewStarted]: markOf(SessionMark.ReviewStarted),
      [SessionMark.Reviewed]: markOf(SessionMark.Reviewed),
      [SessionMark.Turn]: markOf(SessionMark.Turn),
    },
    own,
    reviewOwed,
    snapshot: input.workingTree.snapshotOf(state.repositoryFolderPath),
    state,
    tree: input.workingTree.stateOf(state.repositoryFolderPath),
    unjudged: sessionQueries.unjudged(session),
  });
};

export { judgeStop };
