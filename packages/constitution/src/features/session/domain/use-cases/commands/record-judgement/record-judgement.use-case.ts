import type { SessionCommandRepository } from '../../../contracts/repositories/commands';
import type { StopJudgement } from '../../../entities';
import { SessionMark, StopVerdict } from '../../../entities';
import type { SessionId } from '../../../value-objects';

interface RecordJudgementInput {
  readonly judgement: StopJudgement;
  readonly session: SessionId;
  readonly sessions: SessionCommandRepository;
}

const recordJudgement = (input: RecordJudgementInput): void => {
  const { judgement, session } = input;

  if (judgement.verdict === StopVerdict.Review) {
    return;
  }

  if (judgement.verdict === StopVerdict.Unjudged) {
    input.sessions.recordUnjudged({
      reason: judgement.reason,
      session,
    });

    return;
  }

  input.sessions.recordFingerprint({
    fingerprint: judgement.fingerprint,
    mark: judgement.verdict === StopVerdict.Reviewed ? SessionMark.Reviewed : SessionMark.Blocked,
    session,
  });
};

export { recordJudgement };
