import type { BlockId } from '#/kernel/value-objects';

import type { FingerprintMark, SessionState } from '../../../entities';
import type { AgentId, SessionId, TreeFingerprint } from '../../../value-objects';

interface AddRemindedInput {
  /** undefined for the session's own agent */
  readonly agent: AgentId | undefined;
  readonly ids: readonly BlockId[];
  readonly session: SessionId;
}

interface RecordFingerprintInput {
  readonly fingerprint: TreeFingerprint;
  readonly mark: FingerprintMark;
  readonly session: SessionId;
}

interface RecordUnjudgedInput {
  /** why git could not report the tree */
  readonly reason: string;
  readonly session: SessionId;
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
  readonly recordFingerprint: (input: RecordFingerprintInput) => void;
  readonly recordUnjudged: (input: RecordUnjudgedInput) => void;
  readonly saveState: (input: SaveStateInput) => void;
  readonly state: (session: SessionId) => SessionState | undefined;
}

export type {
  AddRemindedInput,
  RecordFingerprintInput,
  RecordUnjudgedInput,
  SaveStateInput,
  SessionCommandRepository,
};
