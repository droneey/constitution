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

const basesOf = (model: ProjectModel, id: BlockId): readonly BlockId[] =>
  model.ancestors.get(id) ?? [];

const extendsBlock = (block: BlockSetBlock, id: BlockId): boolean =>
  // Stryker disable next-line ConditionalExpression,LogicalOperator: the test only narrows the type; an absent base equals none
  block.extends !== undefined && BlockId.equals(block.extends, id);

const heirsOf = (model: ProjectModel, id: BlockId): readonly BlockId[] =>
  model.blocks.filter((block) => extendsBlock(block, id)).map((block) => block.id);

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
  basesOf,
  blockNamed,
  create,
  heirsOf,
  inheritorsOf,
  languagesOf,
  ruleNamed,
} as const;

export { ProjectModel };
