import type { ActiveBlock } from '#/kernel/entities';
import { isGoverned } from '#/kernel/utils';
import type { BlockId } from '#/kernel/value-objects';
import { repositoryUnit, UnitPath } from '#/kernel/value-objects';

// The deeper of two units that hold one path.
const deeperOf = (deepest: UnitPath, unit: UnitPath): UnitPath =>
  // Stryker disable next-line EqualityOperator: two units of one length that both hold a path are one unit
  unit.length > deepest.length ? unit : deepest;

interface GoverningInput {
  readonly active: readonly ActiveBlock[];
  readonly path: string;
}

// The unit a path from the project's folder lies in: the deepest member that holds it among the
// units of the active blocks, or the repository.
const unitOf = (input: GoverningInput): UnitPath =>
  input.active
    .map((block) => block.unit)
    .filter((unit) => !UnitPath.isRepository(unit) && UnitPath.holds(unit, input.path))
    .reduce(deeperOf, repositoryUnit);

// The active blocks that govern a path from the project's folder, in their order, each once: those
// of the deepest member the path lies in, or the repository's.
const governingOf = (input: GoverningInput): readonly ActiveBlock[] => {
  const unit = unitOf(input);
  const inner = UnitPath.pathFrom(unit, input.path);
  const seen = new Set<BlockId>();

  return input.active.filter((block) => {
    if (
      !UnitPath.equals(block.unit, unit) ||
      seen.has(block.id) ||
      !isGoverned({
        globs: block.governs,
        path: inner,
      })
    ) {
      return false;
    }

    seen.add(block.id);

    return true;
  });
};

export { governingOf };
