import type { AbsolutePath, BlockId } from '#/kernel/value-objects';

import type {
  AgentInSession,
  FingerprintMark,
  SessionState,
} from '../../../../domain/session/entities';
import type { AgentId, SessionId } from '../../../../domain/session/value-objects';
import type { ReviewDebt } from '../../../../domain/stop-judgement/entities';
import type { TreeFingerprint } from '../../../../domain/tree-state/value-objects';

interface AddRemindedInput extends AgentInSession {
  readonly ids: readonly BlockId[];
}

interface AddOwnChangesInput extends AgentInSession {
  readonly paths: readonly AbsolutePath[];
}

interface AddReviewDebtInput {
  readonly paths: readonly AbsolutePath[];
  readonly session: SessionId;
  readonly subagent: AgentId;
}

interface SettleReviewDebtInput {
  readonly debts: readonly ReviewDebt[];
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

// Why: a write that cannot land is dropped, costing the reminders and the hand-back but never the
// hook.
interface SessionRepository {
  readonly addOwnChanges: (input: AddOwnChangesInput) => void;
  readonly addReminded: (input: AddRemindedInput) => void;
  readonly addReviewDebt: (input: AddReviewDebtInput) => void;
  readonly clearOwnChanges: (input: AgentInSession) => void;
  readonly ownChanges: (input: AgentInSession) => readonly AbsolutePath[];
  readonly recordFingerprint: (input: RecordFingerprintInput) => void;
  readonly recordStarted: (session: SessionId) => void;
  readonly recordUnjudged: (input: RecordUnjudgedInput) => void;
  readonly saveState: (input: SaveStateInput) => void;
  readonly settleReviewDebt: (input: SettleReviewDebtInput) => void;
  readonly state: (session: SessionId) => SessionState | undefined;
}

export type {
  AddOwnChangesInput,
  AddRemindedInput,
  AddReviewDebtInput,
  RecordFingerprintInput,
  RecordUnjudgedInput,
  SaveStateInput,
  SessionRepository,
  SettleReviewDebtInput,
};
