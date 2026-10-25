import type { BlockId } from '#/kernel/value-objects';

import type { SessionMark, SessionState } from '../../../entities';
import type { AgentId, SessionId } from '../../../value-objects';

/**
 * What a session's hooks read of what it keeps; a session or a record that was never written
 * reads as absent.
 */
interface SessionQueryRepository {
  readonly mark: (input: { mark: SessionMark; session: SessionId }) => string | undefined;
  /** the blocks a reminder has named to the session, or, unless agent is undefined, to one of its agents */
  readonly reminded: (input: {
    agent: AgentId | undefined;
    session: SessionId;
  }) => ReadonlySet<BlockId>;
  readonly state: (session: SessionId) => SessionState | undefined;
}

export type { SessionQueryRepository };
