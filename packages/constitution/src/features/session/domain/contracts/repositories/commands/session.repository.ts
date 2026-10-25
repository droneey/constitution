import type { BlockId } from '#/kernel/value-objects';

import type { SessionMark, SessionState } from '../../../entities';
import type { AgentId, SessionId } from '../../../value-objects';

/**
 * What a session keeps between its hooks; a session that was never written loads as absent, and a
 * write that cannot land is dropped: it costs the reminders and the gate, never the hook.
 */
interface SessionCommandRepository {
  /** agent is undefined for the session's own agent */
  readonly addReminded: (input: {
    agent: AgentId | undefined;
    ids: readonly BlockId[];
    session: SessionId;
  }) => void;
  readonly recordMark: (input: { mark: SessionMark; session: SessionId; value: string }) => void;
  /** isReminderKept keeps what was reminded, as a resumed session does */
  readonly saveState: (input: {
    isReminderKept: boolean;
    session: SessionId;
    state: SessionState;
  }) => void;
  readonly state: (session: SessionId) => SessionState | undefined;
}

export type { SessionCommandRepository };
