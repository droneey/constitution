import type { BlockModel, ModelBlock, ModelRule } from '#/kernel/entities';
import type { BlockId, RuleSlug } from '#/kernel/value-objects';

interface ModelIndex {
  readonly blocks: ReadonlyMap<BlockId, ModelBlock>;
  readonly roleIds: ReadonlySet<string>;
  readonly rules: ReadonlyMap<RuleSlug, ModelRule>;
}

const modelIndexOf = (model: BlockModel): ModelIndex => ({
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

// Why: every check of a model's preset sets looks its blocks, roles and rules up, so a model is
// indexed once.
const indexesByModel = new WeakMap<BlockModel, ModelIndex>();

const indexOf = (model: BlockModel): ModelIndex => {
  const known = indexesByModel.get(model);

  // Stryker disable next-line ConditionalExpression,BlockStatement: an answer worked out again equals the remembered one, which only saves time
  if (known !== undefined) {
    return known;
  }

  const index = modelIndexOf(model);

  indexesByModel.set(model, index);

  return index;
};

export type { ModelIndex };
export { indexOf };
