import type { LoweredLevel } from '../constants';
import type { RuleSlug, UnitPath } from '../value-objects';

interface Lowering {
  readonly level: LoweredLevel;
  readonly unit: UnitPath;
  /** the rule the override names, when this rule takes its level from it */
  readonly via?: RuleSlug;
}

export type { Lowering };
