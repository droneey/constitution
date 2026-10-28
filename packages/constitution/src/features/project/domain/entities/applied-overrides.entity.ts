import type { Lowering } from '#/kernel/entities';
import type { RuleSlug, UnitPath } from '#/kernel/value-objects';

import type { ListedOverride } from './block-listing.entity';

/**
 * What the overrides of a project lower: the overrides that hold, the repository's first and each
 * unit's in the order it lists them; per unit, the rules its own overrides lower; and per rule, how
 * they lower it.
 */
interface AppliedOverrides {
  readonly live: readonly ListedOverride[];
  readonly loweredIn: ReadonlyMap<UnitPath, ReadonlySet<RuleSlug>>;
  readonly lowerings: ReadonlyMap<RuleSlug, readonly Lowering[]>;
}

const isLowered = (
  applied: AppliedOverrides,
  input: {
    rule: RuleSlug;
    unit: UnitPath;
  },
): boolean => applied.loweredIn.get(input.unit)?.has(input.rule) === true;

const AppliedOverrides = {
  isLowered,
} as const;

export { AppliedOverrides };
