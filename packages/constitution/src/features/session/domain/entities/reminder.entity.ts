import type { MustRule } from '#/kernel/entities';
import type { BlockId, RepositoryRelativePath } from '#/kernel/value-objects';

interface RemindedBlock {
  readonly files: readonly string[];
  readonly id: BlockId;
  readonly musts: readonly MustRule[];
}

interface Reminder {
  readonly blocks: readonly RemindedBlock[];
  readonly path: RepositoryRelativePath;
}

export type { RemindedBlock, Reminder };
