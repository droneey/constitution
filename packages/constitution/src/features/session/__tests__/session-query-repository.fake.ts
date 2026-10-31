import type { BlockId } from '#/kernel/value-objects';

import type { SessionQueryRepository } from '../application/contracts/repositories/queries';
import type { SessionState } from '../domain/session/entities';
import { SessionMark } from '../domain/session/entities';
import type { SessionId } from '../domain/session/value-objects';
import { TreeFingerprint } from '../domain/tree-state/value-objects';
import type { HeldSessions } from './session.fixtures';
import { heldSessionsOf } from './session.fixtures';

const createFakeSessionQueryRepository = (
  sessions: HeldSessions = heldSessionsOf(),
): SessionQueryRepository => ({
  fingerprint: (asked): TreeFingerprint | undefined => {
    const text = sessions.get(asked.session)?.marks.get(asked.mark);

    return TreeFingerprint.is(text) ? text : undefined;
  },
  reminded: (asked): ReadonlySet<BlockId> =>
    new Set(sessions.get(asked.session)?.reminded.get(asked.agent)),
  state: (session: SessionId): SessionState | undefined => sessions.get(session)?.state,
  unjudged: (session: SessionId): string | undefined =>
    sessions.get(session)?.marks.get(SessionMark.Unjudged),
});

export { createFakeSessionQueryRepository };
