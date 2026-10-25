import type { SessionCommandRepository } from '../../../contracts/repositories/commands';
import type { StopJudgement } from '../../../entities';
import { SessionMark, StopVerdict } from '../../../entities';
import type { SessionId } from '../../../value-objects';

/**
 * Records the tree the gate judged: as reviewed when the reviewer finished, as blocked when the
 * agent was sent to run the check; records nothing for a review asked for.
 */
const recordJudgement = (input: {
  judgement: StopJudgement;
  session: SessionId;
  sessions: SessionCommandRepository;
}): void => {
  const { judgement } = input;

  if (judgement.verdict === StopVerdict.Review) {
    return;
  }

  input.sessions.recordMark({
    mark: judgement.verdict === StopVerdict.Reviewed ? SessionMark.Reviewed : SessionMark.Blocked,
    session: input.session,
    value: judgement.fingerprint,
  });
};

export { recordJudgement };
