import type { AbsolutePath } from '#/kernel/value-objects';

import type { SessionCommandRepository } from '../domain/contracts/repositories/commands';
import type { AgentInSession, SessionState } from '../domain/entities';
import { SessionMark } from '../domain/entities';
import type { SessionId } from '../domain/value-objects';
import type { HeldSessions, KeptSession } from './session.fixtures';
import { heldSessionsOf, reviewKeyOf } from './session.fixtures';

const keptIn = (sessions: HeldSessions, session: SessionId): KeptSession => {
  const kept = sessions.get(session) ?? {
    marks: new Map(),
    own: new Map(),
    reminded: new Map(),
    review: new Map(),
  };

  sessions.set(session, kept);

  return kept;
};

const ownIn = (sessions: HeldSessions, asked: AgentInSession): Set<AbsolutePath> => {
  const { own } = keptIn(sessions, asked.session);
  const paths = own.get(asked.agent) ?? new Set();

  own.set(asked.agent, paths);

  return paths;
};

const createFakeSessionCommandRepository = (
  sessions: HeldSessions = heldSessionsOf(),
): SessionCommandRepository => ({
  addOwnChanges: (added): void => {
    const own = ownIn(sessions, added);

    for (const path of added.paths) {
      own.add(path);
    }
  },
  addReminded: (added): void => {
    const reminded = sessions.get(added.session)?.reminded;

    reminded?.set(
      added.agent,
      new Set([
        ...(reminded.get(added.agent) ?? []),
        ...added.ids,
      ]),
    );
  },
  addReviewDebt: (added): void => {
    const { review } = keptIn(sessions, added.session);

    for (const path of added.paths) {
      const debt = {
        agent: added.subagent,
        path,
      };

      review.set(reviewKeyOf(debt), review.get(reviewKeyOf(debt)) ?? debt);
    }
  },
  clearOwnChanges: (cleared): void => {
    ownIn(sessions, cleared).clear();
  },
  ownChanges: (asked): readonly AbsolutePath[] => [
    ...ownIn(sessions, asked),
  ],
  recordFingerprint: (recorded): void => {
    sessions.get(recorded.session)?.marks.set(recorded.mark, recorded.fingerprint);
  },
  recordUnjudged: (recorded): void => {
    sessions.get(recorded.session)?.marks.set(SessionMark.Unjudged, recorded.reason);
  },
  saveState: (saved): void => {
    const kept = sessions.get(saved.session);

    sessions.set(saved.session, {
      marks: kept?.marks ?? new Map(),
      own: kept?.own ?? new Map(),
      reminded: saved.isReminderKept && kept !== undefined ? kept.reminded : new Map(),
      review: kept?.review ?? new Map(),
      state: saved.state,
    });
  },
  settleReviewDebt: (settled): void => {
    const review = sessions.get(settled.session)?.review;

    for (const debt of settled.debts) {
      review?.delete(reviewKeyOf(debt));
    }
  },
  state: (session: SessionId): SessionState | undefined => sessions.get(session)?.state,
});

export { createFakeSessionCommandRepository };
