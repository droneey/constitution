import type { Axis } from '#/kernel/constants';
import type { BlockId, PackPath, UnitPath } from '#/kernel/value-objects';

import type { BlockSetRule } from './block-set.entity';

// A unit with the axes it follows and the blocks it makes active, core and the bases of what it
// lists among them, its name and the packs it lists; the repository's comes first, then its
// members'.
interface ResolvedUnit {
  readonly axes: ReadonlySet<Axis>;
  readonly blocks: ReadonlySet<BlockId>;
  readonly name: string | undefined;
  readonly packs: readonly PackPath[];
  readonly path: UnitPath;
}

type ResolvedUnits = readonly [
  ResolvedUnit,
  ...ResolvedUnit[],
];

const create = (input: ResolvedUnit): ResolvedUnit => ({
  axes: input.axes,
  blocks: input.blocks,
  name: input.name,
  packs: input.packs,
  path: input.path,
});

const isAxisOn = (unit: ResolvedUnit, axis: Axis): boolean => unit.axes.has(axis);

const isActive = (unit: ResolvedUnit, block: BlockId): boolean => unit.blocks.has(block);

// A rule is active where its axis is followed and its block is active, and a seam's rule where the
// other block is active too.
const isActiveRule = (unit: ResolvedUnit, rule: BlockSetRule): boolean =>
  isAxisOn(unit, rule.axis) &&
  isActive(unit, rule.block) &&
  (rule.seam === undefined || isActive(unit, rule.seam));

const ResolvedUnit = {
  create,
  isActive,
  isActiveRule,
  isAxisOn,
} as const;

export type { ResolvedUnits };
export { ResolvedUnit };
