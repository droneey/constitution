import type { Axis } from '#/kernel/constants';
import type { BlockId, PackPath, UnitPath } from '#/kernel/value-objects';

import type { BlockSetRule } from '../block-set/block-set.entity';

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
