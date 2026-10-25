import type { SessionCommandRepository } from '../domain/contracts/repositories/commands';
import type { SessionState } from '../domain/entities';
import type { SessionId } from '../domain/value-objects';
import { keptSession, sessionStateOf } from './session.fixtures';

type Added = Parameters<SessionCommandRepository['addReminded']>[0];
type Recorded = Parameters<SessionCommandRepository['recordMark']>[0];
type Saved = Parameters<SessionCommandRepository['saveState']>[0];

interface FakeSessionCommandRepository {
  readonly sessions: SessionCommandRepository;
  readonly writes: {
    readonly added: readonly Added[];
    readonly recorded: readonly Recorded[];
    readonly saved: readonly Saved[];
  };
}

// A session's store that loads session-1's state by default and keeps every write it is given, in
// order, without changing what it loads.
const createFakeSessionCommandRepository = (
  held: {
    readonly state?: SessionState;
    readonly states?: Readonly<Record<string, SessionState>>;
  } = {},
): FakeSessionCommandRepository => {
  const states = held.states ?? {
    [keptSession]: held.state ?? sessionStateOf(),
  };
  const added: Added[] = [];
  const recorded: Recorded[] = [];
  const saved: Saved[] = [];

  return {
    sessions: {
      addReminded: (write): void => {
        added.push(write);
      },
      recordMark: (write): void => {
        recorded.push(write);
      },
      saveState: (write): void => {
        saved.push(write);
      },
      state: (session: SessionId): SessionState | undefined => states[session],
    },
    writes: {
      added,
      recorded,
      saved,
    },
  };
};

export { createFakeSessionCommandRepository };
