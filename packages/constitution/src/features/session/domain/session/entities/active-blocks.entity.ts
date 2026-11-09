import type { ActiveBlock } from '#/kernel/entities';
import { firstBy } from '#/kernel/utils';
import type { RepositoryRelativePath } from '#/kernel/value-objects';
import { Glob, repositoryUnit, UnitPath } from '#/kernel/value-objects';

type GoverningBlock = Pick<ActiveBlock, 'governs' | 'id' | 'unit'>;

interface ActiveBlocks<TBlock extends GoverningBlock> {
  readonly active: readonly TBlock[];
}

const deeperOf = (deepest: UnitPath, unit: UnitPath): UnitPath =>
  // Stryker disable next-line EqualityOperator: two units of one length that both hold a path are one unit
  unit.length > deepest.length ? unit : deepest;

const unitHolding = (
  blocks: ActiveBlocks<GoverningBlock>,
  path: RepositoryRelativePath,
): UnitPath =>
  blocks.active
    .map((block) => block.unit)
    .filter((unit) => !UnitPath.isRepository(unit) && UnitPath.holds(unit, path))
    .reduce(deeperOf, repositoryUnit);

const governing = <TBlock extends GoverningBlock>(
  blocks: ActiveBlocks<TBlock>,
  path: RepositoryRelativePath,
): readonly TBlock[] => {
  const unit = unitHolding(blocks, path);
  const inner = UnitPath.pathFrom(unit, path);
  const matching = blocks.active.filter(
    (block) =>
      UnitPath.equals(block.unit, unit) &&
      Glob.matchesAny({
        globs: block.governs,
        path: inner,
      }),
  );

  return [
    ...firstBy(matching, (block) => block.id).values(),
  ];
};

const ActiveBlocks = {
  governing,
  unitHolding,
} as const;

export type { GoverningBlock };
export { ActiveBlocks };
