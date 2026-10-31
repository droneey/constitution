import type { Lowering } from '#/kernel/entities';
import type { RuleSlug, UnitPath } from '#/kernel/value-objects';

interface AppliedOverrides {
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
