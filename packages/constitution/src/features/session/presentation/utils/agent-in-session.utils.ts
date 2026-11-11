import type { AgentInSession } from '../../domain/session/entities';
import { SessionAgent } from '../../domain/session/entities';
import type { SessionId } from '../../domain/session/value-objects';
import { AgentId } from '../../domain/session/value-objects';

interface NamedAgent {
  readonly agentId: string | undefined;
  readonly session: SessionId | undefined;
}

const agentInSessionOf = (input: NamedAgent): AgentInSession | undefined => {
  const { agentId, session } = input;

  if (session === undefined) {
    return;
  }

  if (agentId === undefined) {
    return {
      agent: SessionAgent.main,
      session,
    };
  }

  return AgentId.is(agentId)
    ? {
        agent: agentId,
        session,
      }
    : undefined;
};

export { agentInSessionOf };
