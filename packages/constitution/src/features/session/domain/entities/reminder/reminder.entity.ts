import type { MustRule } from '#/kernel/entities';
import type { RepositoryRelativePath } from '#/kernel/value-objects';
import { BlockId } from '#/kernel/value-objects';

import type { ParsedState } from '../session-state';
import { SessionState } from '../session-state';

interface RemindedBlock {
  readonly files: readonly string[];
  readonly id: BlockId;
  readonly musts: readonly MustRule[];
}

interface Reminder {
  readonly blocks: readonly RemindedBlock[];
  readonly path: RepositoryRelativePath;
}

/** The blocks that govern the path and were not yet reminded of, each with its musts. */
const of = (input: {
  path: RepositoryRelativePath;
  reminded: ReadonlySet<BlockId>;
  state: ParsedState;
}): Reminder => {
  const { state } = input;

  return {
    blocks: SessionState.governing(state, input.path)
      .filter((block) => !input.reminded.has(block.id))
      .map((block) => ({
        files: block.files,
        id: block.id,
        musts: state.mustsBesideCore.filter((must) => BlockId.equals(must.block, block.id)),
      })),
    path: input.path,
  };
};

const Reminder = {
  of,
} as const;

export type { RemindedBlock };
export { Reminder };
