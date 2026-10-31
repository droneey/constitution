import type { BlockId } from '#/kernel/value-objects';

import type {
  FingerprintMark,
  SessionAgent,
  SessionState,
} from '../../../../domain/session/entities';
import type { SessionId } from '../../../../domain/session/value-objects';
import type { TreeFingerprint } from '../../../../domain/tree-state/value-objects';

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
