import type { Lowering } from '#/kernel/entities';
import type { RuleSlug, UnitPath } from '#/kernel/value-objects';

interface AppliedOverrides {
  readonly loweredIn: ReadonlyMap<UnitPath, ReadonlySet<RuleSlug>>;
  readonly lowerings: ReadonlyMap<RuleSlug, readonly Lowering[]>;
}

export type { AppliedOverrides };
