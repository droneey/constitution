import { Layer } from '#/kernel/constants';
import { BlockId, RuleSlug } from '#/kernel/value-objects';

import type { BlockSet, BlockSetBlock, BlockSetRule } from './block-set.entity';

interface ProjectModel {
  readonly ancestors: ReadonlyMap<BlockId, readonly BlockId[]>;
  readonly blocks: readonly BlockSetBlock[];
  readonly byId: ReadonlyMap<BlockId, BlockSetBlock>;
  readonly rules: ReadonlyMap<RuleSlug, BlockSetRule>;
}

const create = (
  blockSet: BlockSet & {
    ancestors: ReadonlyMap<BlockId, readonly BlockId[]>;
  },
): ProjectModel => ({
  ancestors: blockSet.ancestors,
  blocks: blockSet.blocks,
  byId: new Map(
    blockSet.blocks.map((block) => [
      block.id,
      block,
    ]),
  ),
  rules: new Map(
    blockSet.rules.map((rule) => [
      rule.slug,
      rule,
    ]),
  ),
});

const ancestorsOf = (model: ProjectModel, id: BlockId): readonly BlockId[] =>
  model.ancestors.get(id) ?? [];

const childrenOf = (model: ProjectModel, id: BlockId): readonly BlockId[] =>
  model.blocks
    .filter((block) => {
      const [parent] = ancestorsOf(model, block.id);

      // Stryker disable next-line ConditionalExpression,LogicalOperator: the test only narrows the type; a block with no parent is no child
      return parent !== undefined && BlockId.equals(parent, id);
    })
    .map((block) => block.id);

const inheritorsOf = (model: ProjectModel, slug: RuleSlug): readonly RuleSlug[] =>
  [
    ...model.rules.values(),
  ]
    .filter(
      (rule) =>
        // Stryker disable next-line ConditionalExpression,LogicalOperator: the test only narrows the type; an absent slug equals none
        rule.tightens !== undefined && RuleSlug.equals(rule.tightens, slug) && !rule.isLevelStated,
    )
    .map((rule) => rule.slug);

const languagesOf = (model: ProjectModel, blocks: ReadonlySet<BlockId>): ReadonlySet<BlockId> =>
  new Set(
    model.blocks
      .filter((block) => block.layer === Layer.Language && blocks.has(block.id))
      .map((block) => block.id),
  );

const blockNamed = (model: ProjectModel, name: string): BlockSetBlock | undefined =>
  BlockId.is(name) ? model.byId.get(name) : undefined;

const ruleNamed = (model: ProjectModel, slug: string): BlockSetRule | undefined =>
  RuleSlug.is(slug) ? model.rules.get(slug) : undefined;

const ProjectModel = {
  ancestorsOf,
  blockNamed,
  childrenOf,
  create,
  inheritorsOf,
  languagesOf,
  ruleNamed,
} as const;

export { ProjectModel };
