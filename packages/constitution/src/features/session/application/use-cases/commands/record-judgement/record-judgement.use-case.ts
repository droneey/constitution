import type { AgentInSession } from '../../../../domain/session/entities';
import { SessionMark } from '../../../../domain/session/entities';
import type { StopJudgement } from '../../../../domain/stop-judgement/entities';
import { StopVerdict } from '../../../../domain/stop-judgement/entities';
import type { SessionRepository } from '../../../contracts/repositories/commands';

interface RecordJudgementInput extends AgentInSession {
  readonly judgement: StopJudgement;
  readonly sessionRepository: SessionRepository;
}

const recordJudgement = (input: RecordJudgementInput): undefined => {
  const { judgement, session } = input;

  switch (judgement.verdict) {
    // Stryker disable next-line ConditionalExpression: a blocked stop records nothing, as a verdict no case names does
    case StopVerdict.Blocked:
      return;
    case StopVerdict.Covered:
      input.sessionRepository.clearOwnChanges(input);
      input.sessionRepository.settleReviewDebt({
        debts: judgement.subagentChanges,
        session,
      });

      return;
    case StopVerdict.Unjudged:
      input.sessionRepository.recordUnjudged({
        reason: judgement.reason,
        session,
      });

      return;
    case StopVerdict.Reviewed:
      input.sessionRepository.recordFingerprint({
        fingerprint: judgement.fingerprint,
        mark: SessionMark.Reviewed,
        session,
      });

      return;
  }
};

export { recordJudgement };
