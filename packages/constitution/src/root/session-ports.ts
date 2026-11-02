import { createXdgSessionRepository } from '#/features/session/infrastructure/session-store';

import type { Ports } from './registration.types';

type SessionPorts = Pick<Ports, 'gateRepository' | 'sessionQueries' | 'sessionRepository'>;

const createSessionPorts = (
  input: Parameters<typeof createXdgSessionRepository>[0],
): SessionPorts => {
  const xdgSessions = createXdgSessionRepository(input);

  return {
    gateRepository: xdgSessions,
    sessionQueries: xdgSessions,
    sessionRepository: xdgSessions,
  };
};

export { createSessionPorts };
