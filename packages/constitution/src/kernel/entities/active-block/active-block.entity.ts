import type { BlockId, Glob, UnitPath } from '../../value-objects';

interface ActiveBlock {
  readonly files: readonly string[];
  readonly governs: readonly Glob[];
  readonly id: BlockId;
  readonly unit: UnitPath;
}

export type { ActiveBlock };
