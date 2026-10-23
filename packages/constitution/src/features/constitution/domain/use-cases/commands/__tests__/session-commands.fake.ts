import type { SessionCommandRepository } from '../../../contracts/repositories/commands';

type Added = Parameters<SessionCommandRepository['addReminded']>[0];
type Recorded = Parameters<SessionCommandRepository['recordMark']>[0];
type Saved = Parameters<SessionCommandRepository['saveState']>[0];

// A session's store that keeps every write it is given, as it was given, in order.
interface FakeSessionCommands {
  readonly commands: SessionCommandRepository;
  readonly writes: {
    readonly added: readonly Added[];
    readonly recorded: readonly Recorded[];
    readonly saved: readonly Saved[];
  };
}

const createFakeSessionCommands = (): FakeSessionCommands => {
  const added: Added[] = [];
  const recorded: Recorded[] = [];
  const saved: Saved[] = [];

  return {
    commands: {
      addReminded: (write): void => {
        added.push(write);
      },
      recordMark: (write): void => {
        recorded.push(write);
      },
      saveState: (write): void => {
        saved.push(write);
      },
    },
    writes: {
      added,
      recorded,
      saved,
    },
  };
};

export { createFakeSessionCommands };
