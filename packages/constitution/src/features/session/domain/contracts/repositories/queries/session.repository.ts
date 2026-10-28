import type { BlockId } from '#/kernel/value-objects';

import type { FingerprintMark, SessionState } from '../../../entities';
import type { AgentId, SessionId, TreeFingerprint } from '../../../value-objects';

interface FingerprintInput {
  readonly mark: FingerprintMark;
  readonly session: SessionId;
}

interface RemindedInput {
  readonly agent: AgentId | undefined;
  readonly session: SessionId;
}

/**
 * What a session's hooks read of what it keeps; a session or a record that was never written
 * reads as absent.
 */
interface SessionQueryRepository {
  readonly fingerprint: (input: FingerprintInput) => TreeFingerprint | undefined;
  /** the blocks a reminder has named to the session, or, unless agent is undefined, to one of its agents */
  readonly reminded: (input: RemindedInput) => ReadonlySet<BlockId>;
  readonly state: (session: SessionId) => SessionState | undefined;
  /** why git last could not report the tree */
  readonly unjudged: (session: SessionId) => string | undefined;
}

export type { SessionQueryRepository };
