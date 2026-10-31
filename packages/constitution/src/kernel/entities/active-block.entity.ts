import type { BlockId, Glob, UnitPath } from '../value-objects';
import type { SourcedFile } from './sourced-file.entity';

interface ActiveBlock {
  readonly files: readonly SourcedFile[];
  readonly governs: readonly Glob[];
  readonly id: BlockId;
  readonly unit: UnitPath;
}

export type { ActiveBlock };
