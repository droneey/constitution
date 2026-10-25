import type { MustRule } from '#/kernel/entities';
import type { BlockId } from '#/kernel/value-objects';

interface RemindedBlock {
  readonly files: readonly string[];
  readonly id: BlockId;
  readonly musts: readonly MustRule[];
}

/** The blocks a file reminds of, with the file's path from the project's folder. */
interface Reminder {
  readonly blocks: readonly RemindedBlock[];
  readonly path: string;
}

export type { RemindedBlock, Reminder };
