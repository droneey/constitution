import type { AbsolutePath, BlockId } from '#/kernel/value-objects';

import type { AgentInSession, FingerprintMark, ReviewDebt, SessionState } from '../../../entities';
import type { SessionId, TreeFingerprint } from '../../../value-objects';

interface FingerprintInput {
  readonly mark: FingerprintMark;
  readonly session: SessionId;
}

interface SessionQueryRepository {
  readonly fingerprint: (input: FingerprintInput) => TreeFingerprint | undefined;
  readonly ownChanges: (input: AgentInSession) => readonly AbsolutePath[];
  readonly reminded: (input: AgentInSession) => ReadonlySet<BlockId>;
  readonly reviewDebt: (session: SessionId) => readonly ReviewDebt[];
  readonly state: (session: SessionId) => SessionState | undefined;
  readonly unjudged: (session: SessionId) => string | undefined;
}

export type { SessionQueryRepository };
