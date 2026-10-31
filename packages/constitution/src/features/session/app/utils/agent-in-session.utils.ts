import type { AgentInSession } from '../../domain/entities';
import { SessionAgent } from '../../domain/entities';
import type { SessionId } from '../../domain/value-objects';
import { AgentId } from '../../domain/value-objects';

interface NamedAgent {
  readonly agentId: string | undefined;
  readonly session: SessionId | undefined;
}

const agentInSessionOf = (input: NamedAgent): AgentInSession | undefined => {
  const { agentId, session } = input;

  if (session === undefined) {
    return undefined;
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
