import type { LoweredLevel } from '../constants';
import type { RuleSlug, UnitPath } from '../value-objects';

interface LoweringPlace {
  readonly level: LoweredLevel;
  readonly unit: UnitPath;
  readonly via?: RuleSlug;
}

interface Lowering extends LoweringPlace {
  readonly reason: string;
}

export type { Lowering, LoweringPlace };
