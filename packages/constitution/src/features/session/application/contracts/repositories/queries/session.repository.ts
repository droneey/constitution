import type { AbsolutePath, BlockId } from '#/kernel/value-objects';

import type {
  AgentInSession,
  FingerprintMark,
  SessionState,
} from '../../../../domain/session/entities';
import type { SessionId } from '../../../../domain/session/value-objects';
import type { ReviewDebt } from '../../../../domain/stop-judgement/entities';
import type { TreeFingerprint } from '../../../../domain/tree-state/value-objects';

interface FingerprintInput {
  readonly mark: FingerprintMark;
  readonly session: SessionId;
}

interface SessionQueries {
  readonly fingerprint: (input: FingerprintInput) => TreeFingerprint | undefined;
  readonly isStarted: (session: SessionId) => boolean;
  readonly ownChanges: (input: AgentInSession) => readonly AbsolutePath[];
  readonly reminded: (input: AgentInSession) => ReadonlySet<BlockId>;
  readonly reviewDebt: (session: SessionId) => readonly ReviewDebt[];
  readonly state: (session: SessionId) => SessionState | undefined;
  readonly unjudged: (session: SessionId) => string | undefined;
}

export type { SessionQueries };
