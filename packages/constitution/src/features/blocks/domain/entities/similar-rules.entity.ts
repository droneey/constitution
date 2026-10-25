import type { BlockId, RuleSlug } from '#/kernel/value-objects';

interface RuleNamed {
  readonly block: BlockId;
  readonly slug: RuleSlug;
}

/** Two rules of sibling blocks that say nearly the same thing, the first as the blocks list it. */
interface SimilarRules {
  readonly left: RuleNamed;
  readonly right: RuleNamed;
}

export type { SimilarRules };
