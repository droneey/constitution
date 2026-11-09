import type { AbsolutePath, BlockId } from '#/kernel/value-objects';

import type { SessionQueries } from '../application/contracts/repositories/queries';
import type { SessionState } from '../domain/session/entities';
import { SessionMark } from '../domain/session/entities';
import type { SessionId } from '../domain/session/value-objects';
import type { ReviewDebt } from '../domain/stop-judgement/entities';
import { TreeFingerprint } from '../domain/tree-state/value-objects';
import type { HeldSessions } from './session.fixtures';
import { heldSessionsOf, ownChangesIn, reviewDebtIn } from './session.fixtures';

const createFakeSessionQueries = (sessions: HeldSessions = heldSessionsOf()): SessionQueries => ({
  fingerprint: (asked): TreeFingerprint | undefined => {
    const text = sessions.get(asked.session)?.marks.get(asked.mark);

    return TreeFingerprint.is(text) ? text : undefined;
  },
  isStarted: (session: SessionId): boolean =>
    sessions.get(session)?.marks.has(SessionMark.Started) === true,
  ownChanges: (asked): readonly AbsolutePath[] => ownChangesIn(sessions, asked),
  reviewDebt: (session: SessionId): readonly ReviewDebt[] => reviewDebtIn(sessions, session),
  reminded: (asked): ReadonlySet<BlockId> =>
    new Set(sessions.get(asked.session)?.reminded.get(asked.agent)),
  state: (session: SessionId): SessionState | undefined => sessions.get(session)?.state,
  unjudged: (session: SessionId): string | undefined =>
    sessions.get(session)?.marks.get(SessionMark.Unjudged),
});

export { createFakeSessionQueries };
