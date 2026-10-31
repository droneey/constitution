import type { SessionCommandRepository } from '../../../contracts/repositories/commands';
import type { AgentInSession, StopJudgement } from '../../../entities';
import { SessionMark, StopVerdict } from '../../../entities';

interface RecordJudgementInput extends AgentInSession {
  readonly judgement: StopJudgement;
  readonly sessions: SessionCommandRepository;
}

const recordJudgement = (input: RecordJudgementInput): undefined => {
  const { judgement, session } = input;

  switch (judgement.verdict) {
    // Stryker disable next-line ConditionalExpression: a blocked stop records nothing, as the default does
    case StopVerdict.Blocked:
      return;
    case StopVerdict.Covered:
      input.sessions.clearOwnChanges(input);
      input.sessions.settleReviewDebt({
        debts: judgement.subagentChanges,
        session,
      });

      return;
    case StopVerdict.Unjudged:
      input.sessions.recordUnjudged({
        reason: judgement.reason,
        session,
      });

      return;
    case StopVerdict.Reviewed:
      input.sessions.recordFingerprint({
        fingerprint: judgement.fingerprint,
        mark: SessionMark.Reviewed,
        session,
      });

      return;
    // Stryker disable next-line ConditionalExpression: no verdict reaches the default, which only the compiler reads
    default:
      return judgement satisfies never;
  }
};

export { recordJudgement };
