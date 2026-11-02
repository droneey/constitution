import type { AgentId, SessionId } from '../value-objects';

const mainAgent = Symbol('the session’s own agent');

type SessionAgent = AgentId | typeof mainAgent;

interface AgentInSession {
  readonly agent: SessionAgent;
  readonly session: SessionId;
}

const SessionAgent = {
  main: mainAgent,
} as const;

export type { AgentInSession };
export { SessionAgent };
