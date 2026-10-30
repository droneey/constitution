import type { BlockModel, ModelBlock, ModelRule } from '#/kernel/entities';
import type { BlockId, RuleSlug } from '#/kernel/value-objects';

interface ModelIndex {
  readonly blocks: ReadonlyMap<BlockId, ModelBlock>;
  readonly roleIds: ReadonlySet<string>;
  readonly rules: ReadonlyMap<RuleSlug, ModelRule>;
}

const indexOf = (model: BlockModel): ModelIndex => ({
  blocks: new Map<BlockId, ModelBlock>(
    model.blocks.map((block) => [
      block.id,
      block,
    ]),
  ),
  // Stryker disable next-line ArrayDeclaration: no role a fact names is spelled as the text it adds
  roleIds: new Set(model.roles.flatMap((term) => term.id ?? [])),
  rules: new Map<RuleSlug, ModelRule>(
    model.rules.map((rule) => [
      rule.slug,
      rule,
    ]),
  ),
});

export type { ModelIndex };
export { indexOf };
