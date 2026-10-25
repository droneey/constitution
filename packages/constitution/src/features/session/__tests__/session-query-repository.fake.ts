import { BlockId } from '#/kernel/value-objects';

import type { SessionQueryRepository } from '../domain/contracts/repositories/queries';
import type { SessionMark, SessionState } from '../domain/entities';
import type { AgentId, SessionId } from '../domain/value-objects';
import { keptSession, sessionStateOf } from './session.fixtures';

interface Held {
  readonly marks?: readonly {
    readonly mark: SessionMark;
    readonly value: string;
  }[];
  // by the agent they were named to, none for the session itself
  readonly reminded?: readonly {
    readonly agent?: AgentId;
    readonly ids: readonly string[];
  }[];
  readonly state?: SessionState;
  readonly states?: Readonly<Record<string, SessionState>>;
}

// What a session's store reads: session-1's state by default, its marks and what it was reminded of.
const createFakeSessionQueryRepository = (held: Held = {}): SessionQueryRepository => {
  const states = held.states ?? {
    [keptSession]: held.state ?? sessionStateOf(),
  };

  return {
    mark: (asked): string | undefined =>
      asked.session === keptSession
        ? held.marks?.find((kept) => kept.mark === asked.mark)?.value
        : undefined,
    reminded: (asked): ReadonlySet<BlockId> =>
      new Set(
        (held.reminded ?? [])
          .filter((list) => asked.session === keptSession && list.agent === asked.agent)
          .flatMap((list) => list.ids.map(BlockId.create)),
      ),
    state: (session: SessionId): SessionState | undefined => states[session],
  };
};

export { createFakeSessionQueryRepository };
