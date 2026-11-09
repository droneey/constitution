import type { AgentInSession } from '../../../../domain/session/entities';
import { SessionAgent } from '../../../../domain/session/entities';
import type { SessionRepository } from '../../../contracts/repositories/commands';

interface HandOverChangesInput extends AgentInSession {
  readonly sessionRepository: SessionRepository;
}

const handOverChanges = (input: HandOverChangesInput): void => {
  const { agent, session, sessionRepository } = input;

  if (agent === SessionAgent.main) {
    return;
  }

  const own = sessionRepository.ownChanges({
    agent,
    session,
  });

  if (own.length === 0) {
    return;
  }

  sessionRepository.addReviewDebt({
    paths: own,
    session,
    subagent: agent,
  });
  sessionRepository.clearOwnChanges({
    agent,
    session,
  });
};

export { handOverChanges };
