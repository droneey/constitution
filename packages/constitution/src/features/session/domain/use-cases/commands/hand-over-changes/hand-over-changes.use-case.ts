import type { SessionCommandRepository } from '../../../contracts/repositories/commands';
import type { AgentInSession } from '../../../entities';
import { SessionAgent } from '../../../entities';

interface HandOverChangesInput extends AgentInSession {
  readonly sessions: SessionCommandRepository;
}

const handOverChanges = (input: HandOverChangesInput): void => {
  const { agent, session, sessions } = input;

  if (agent === SessionAgent.main) {
    return;
  }

  const own = sessions.ownChanges({
    agent,
    session,
  });

  if (own.length === 0) {
    return;
  }

  sessions.addReviewDebt({
    paths: own,
    session,
    subagent: agent,
  });
  sessions.clearOwnChanges({
    agent,
    session,
  });
};

export { handOverChanges };
