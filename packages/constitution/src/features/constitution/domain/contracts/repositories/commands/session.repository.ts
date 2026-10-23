import type { SessionMark, SessionState } from '../../../entities';

// A write that cannot land costs the reminders and the gate, never the hook: it is dropped.
interface SessionCommandRepository {
  addReminded: (input: {
    agent: string | undefined;
    ids: readonly string[];
    session: string;
  }) => void;
  recordMark: (input: { mark: SessionMark; session: string; value: string }) => void;
  // keepReminded keeps what was reminded, as a resumed session does
  saveState: (input: { isReminderKept: boolean; session: string; state: SessionState }) => void;
}

export type { SessionCommandRepository };
