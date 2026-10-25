import type { BlockId, RuleSlug } from '../value-objects';
import type { Lowering } from './lowering.entity';

interface MustRule {
  readonly block: BlockId;
  readonly lowerings: readonly Lowering[];
  readonly slug: RuleSlug;
}

const MustRule = {
  create: (input: MustRule): MustRule => ({
    block: input.block,
    lowerings: input.lowerings,
    slug: input.slug,
  }),
} as const;

export { MustRule };
