import type { AbsolutePath, BlockId } from '#/kernel/value-objects';

import type { SessionQueryRepository } from '../domain/contracts/repositories/queries';
import type { ReviewDebt, SessionState } from '../domain/entities';
import { SessionMark } from '../domain/entities';
import type { SessionId } from '../domain/value-objects';
import { TreeFingerprint } from '../domain/value-objects';
import type { HeldSessions } from './session.fixtures';
import { heldSessionsOf, ownChangesIn, reviewDebtIn } from './session.fixtures';

const createFakeSessionQueryRepository = (
  sessions: HeldSessions = heldSessionsOf(),
): SessionQueryRepository => ({
  fingerprint: (asked): TreeFingerprint | undefined => {
    const text = sessions.get(asked.session)?.marks.get(asked.mark);

    return TreeFingerprint.is(text) ? text : undefined;
  },
  ownChanges: (asked): readonly AbsolutePath[] => ownChangesIn(sessions, asked),
  reviewDebt: (session: SessionId): readonly ReviewDebt[] => reviewDebtIn(sessions, session),
  reminded: (asked): ReadonlySet<BlockId> =>
    new Set(sessions.get(asked.session)?.reminded.get(asked.agent)),
  state: (session: SessionId): SessionState | undefined => sessions.get(session)?.state,
  unjudged: (session: SessionId): string | undefined =>
    sessions.get(session)?.marks.get(SessionMark.Unjudged),
});

export { createFakeSessionQueryRepository };
