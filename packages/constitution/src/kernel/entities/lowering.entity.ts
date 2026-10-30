import type { LoweredLevel } from '../constants';
import type { RuleSlug, UnitPath } from '../value-objects';

interface Lowering {
  readonly level: LoweredLevel;
  readonly unit: UnitPath;
  readonly via?: RuleSlug;
}

export type { Lowering };
