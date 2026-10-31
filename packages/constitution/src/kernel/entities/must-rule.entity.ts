import type { BlockId, RuleSlug } from '../value-objects';
import type { LoweringPlace } from './lowering.entity';

interface MustRule {
  readonly block: BlockId;
  readonly lowerings: readonly LoweringPlace[];
  readonly slug: RuleSlug;
}

export type { MustRule };
