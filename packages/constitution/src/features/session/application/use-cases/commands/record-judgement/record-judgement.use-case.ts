import { SessionMark } from '../../../../domain/session/entities';
import type { SessionId } from '../../../../domain/session/value-objects';
import { StopJudgement } from '../../../../domain/stop-judgement/entities';
import type { SessionCommandRepository } from '../../../contracts/repositories/commands';

interface RecordJudgementInput {
  readonly judgement: StopJudgement;
  readonly session: SessionId;
  readonly sessions: SessionCommandRepository;
}

const recordJudgement = (input: RecordJudgementInput): void => {
  const { session } = input;
  const record = StopJudgement.recordOf(input.judgement);

  if (record === undefined) {
    return;
  }

  if (record.mark === SessionMark.Unjudged) {
    input.sessions.recordUnjudged({
      reason: record.reason,
      session,
    });

    return;
  }

  input.sessions.recordFingerprint({
    fingerprint: record.fingerprint,
    mark: record.mark,
    session,
  });
};

export { recordJudgement };
