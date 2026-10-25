import type { BlockId } from '#/kernel/value-objects';

import type { SessionQueryRepository } from '../domain/contracts/repositories/queries';
import type { SessionState } from '../domain/entities';
import type { SessionId } from '../domain/value-objects';
import type { HeldSessions } from './session.fixtures';
import { heldSessionsOf } from './session.fixtures';

const createFakeSessionQueryRepository = (
  sessions: HeldSessions = heldSessionsOf(),
): SessionQueryRepository => ({
  mark: (asked): string | undefined => sessions.get(asked.session)?.marks.get(asked.mark),
  reminded: (asked): ReadonlySet<BlockId> =>
    new Set(sessions.get(asked.session)?.reminded.get(asked.agent)),
  state: (session: SessionId): SessionState | undefined => sessions.get(session)?.state,
});

export { createFakeSessionQueryRepository };
