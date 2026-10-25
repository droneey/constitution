import type { BlockId, Glob, UnitPath } from '../value-objects';

interface ActiveBlock {
  readonly files: readonly string[];
  readonly governs: readonly Glob[];
  readonly id: BlockId;
  readonly unit: UnitPath;
}

const ActiveBlock = {
  create: (input: ActiveBlock): ActiveBlock => ({
    files: input.files,
    governs: input.governs,
    id: input.id,
    unit: input.unit,
  }),
} as const;

export { ActiveBlock };
