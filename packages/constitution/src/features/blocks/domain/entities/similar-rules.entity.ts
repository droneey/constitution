import type { BlockId, RuleSlug } from '#/kernel/value-objects';

interface RuleNamed {
  readonly block: BlockId;
  readonly slug: RuleSlug;
}

interface SimilarRules {
  readonly left: RuleNamed;
  readonly right: RuleNamed;
}

export type { SimilarRules };
