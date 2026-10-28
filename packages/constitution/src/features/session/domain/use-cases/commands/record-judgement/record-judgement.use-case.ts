import type { SessionCommandRepository } from '../../../contracts/repositories/commands';
import type { StopJudgement } from '../../../entities';
import { SessionMark, StopVerdict } from '../../../entities';
import type { SessionId } from '../../../value-objects';

interface RecordJudgementInput {
  readonly judgement: StopJudgement;
  readonly session: SessionId;
  readonly sessions: SessionCommandRepository;
}

/**
 * Records the tree the gate judged: as reviewed when the reviewer finished, as blocked when the
 * agent was sent to run the check; records why git failed to report the tree, so the gate tells a
 * reason once a session; records nothing for a review asked for.
 */
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
