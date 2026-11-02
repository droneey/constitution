import { createXdgSessionRepository } from '#/features/session/infrastructure/session-store';

import type { Ports } from './registration.types';

type SessionPorts = Pick<Ports, 'sessionQueries' | 'sessionRepository'>;

const createSessionPorts = (
  input: Parameters<typeof createXdgSessionRepository>[0],
): SessionPorts => {
  const xdgSessions = createXdgSessionRepository(input);

  return {
    sessionQueries: xdgSessions,
    sessionRepository: xdgSessions,
  };
};

export { createSessionPorts };
