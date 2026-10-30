import type { AgentId } from '../../value-objects';

const mainAgent = Symbol('the session’s own agent');

type SessionAgent = AgentId | typeof mainAgent;

const SessionAgent = {
  main: mainAgent,
} as const;

export { SessionAgent };
