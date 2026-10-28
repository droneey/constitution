import type { BlockId, RuleSlug } from '../value-objects';
import type { Lowering } from './lowering.entity';

interface MustRule {
  readonly block: BlockId;
  readonly lowerings: readonly Lowering[];
  readonly slug: RuleSlug;
}

export type { MustRule };
