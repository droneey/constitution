import type { BlockId } from '#/kernel/value-objects';

import type {
  FingerprintMark,
  SessionAgent,
  SessionState,
} from '../../../../domain/session/entities';
import type { SessionId } from '../../../../domain/session/value-objects';
import type { TreeFingerprint } from '../../../../domain/tree-state/value-objects';

interface AddRemindedInput {
  readonly agent: SessionAgent;
  readonly ids: readonly BlockId[];
  readonly session: SessionId;
}

interface RecordFingerprintInput {
  readonly fingerprint: TreeFingerprint;
  readonly mark: FingerprintMark;
  readonly session: SessionId;
}

interface RecordUnjudgedInput {
  readonly reason: string;
  readonly session: SessionId;
}

interface SaveStateInput {
  readonly isReminderKept: boolean;
  readonly session: SessionId;
  readonly state: SessionState;
}

// Why: a write that cannot land is dropped, costing the reminders and the gate but never the hook.
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
