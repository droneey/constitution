import type { BlockId } from '#/kernel/value-objects';

import type { FingerprintMark, SessionAgent, SessionState } from '../../../entities';
import type { SessionId, TreeFingerprint } from '../../../value-objects';

interface FingerprintInput {
  readonly mark: FingerprintMark;
  readonly session: SessionId;
}

interface RemindedInput {
  readonly agent: SessionAgent;
  readonly session: SessionId;
}

interface SessionQueryRepository {
  readonly fingerprint: (input: FingerprintInput) => TreeFingerprint | undefined;
  readonly reminded: (input: RemindedInput) => ReadonlySet<BlockId>;
  readonly state: (session: SessionId) => SessionState | undefined;
  readonly unjudged: (session: SessionId) => string | undefined;
}

export type { SessionQueryRepository };
