import type { BlockId } from '#/kernel/value-objects';

import type { SessionMark, SessionState } from '../../../entities';
import type { AgentId, SessionId } from '../../../value-objects';

interface AddRemindedInput {
  /** undefined for the session's own agent */
  readonly agent: AgentId | undefined;
  readonly ids: readonly BlockId[];
  readonly session: SessionId;
}

interface RecordMarkInput {
  readonly mark: SessionMark;
  readonly session: SessionId;
  readonly value: string;
}

interface SaveStateInput {
  /** keeps what was reminded, as a resumed session does */
  readonly isReminderKept: boolean;
  readonly session: SessionId;
  readonly state: SessionState;
}

/**
 * What a session keeps between its hooks; a session that was never written loads as absent, and a
 * write that cannot land is dropped: it costs the reminders and the gate, never the hook.
 */
interface SessionCommandRepository {
  readonly addReminded: (input: AddRemindedInput) => void;
  readonly recordMark: (input: RecordMarkInput) => void;
  readonly saveState: (input: SaveStateInput) => void;
  readonly state: (session: SessionId) => SessionState | undefined;
}

export type { AddRemindedInput, RecordMarkInput, SaveStateInput, SessionCommandRepository };
