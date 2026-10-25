import type { SessionCommandRepository } from '../domain/contracts/repositories/commands';
import type { SessionState } from '../domain/entities';
import type { SessionId } from '../domain/value-objects';
import type { HeldSessions } from './session.fixtures';
import { heldSessionsOf } from './session.fixtures';

/**
 * What a session's hooks write, kept in the sessions held as the real store keeps them: a save
 * replaces the state and, unless it keeps them, the reminders; a write to a session never saved is
 * dropped.
 */
const createFakeSessionCommandRepository = (
  sessions: HeldSessions = heldSessionsOf(),
): SessionCommandRepository => ({
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
  recordMark: (recorded): void => {
    sessions.get(recorded.session)?.marks.set(recorded.mark, recorded.value);
  },
  saveState: (saved): void => {
    const kept = sessions.get(saved.session);

    sessions.set(saved.session, {
      marks: kept?.marks ?? new Map(),
      reminded: saved.isReminderKept && kept !== undefined ? kept.reminded : new Map(),
      state: saved.state,
    });
  },
  state: (session: SessionId): SessionState | undefined => sessions.get(session)?.state,
});

export { createFakeSessionCommandRepository };
