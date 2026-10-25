import { BlockId, RuleSlug } from '#/kernel/value-objects';

import type { Catalogue, CatalogueBlock, CatalogueRule } from './catalogue.entity';

// The catalogue as the resolution looks it up, with each block's bases, nearest first.
interface ProjectModel {
  readonly ancestors: ReadonlyMap<BlockId, readonly BlockId[]>;
  readonly blocks: readonly CatalogueBlock[];
  readonly byId: ReadonlyMap<BlockId, CatalogueBlock>;
  readonly rules: ReadonlyMap<RuleSlug, CatalogueRule>;
}

const create = (
  catalogue: Catalogue & {
    ancestors: ReadonlyMap<BlockId, readonly BlockId[]>;
  },
): ProjectModel => ({
  ancestors: catalogue.ancestors,
  blocks: catalogue.blocks,
  byId: new Map(
    catalogue.blocks.map((block) => [
      block.id,
      block,
    ]),
  ),
  rules: new Map(
    catalogue.rules.map((rule) => [
      rule.slug,
      rule,
    ]),
  ),
});

const basesOf = (model: ProjectModel, id: BlockId): readonly BlockId[] =>
  model.ancestors.get(id) ?? [];

const extendsBlock = (block: CatalogueBlock, id: BlockId): boolean =>
  // Stryker disable next-line ConditionalExpression,LogicalOperator: the test only narrows the type; an absent base equals none
  block.extends !== undefined && BlockId.equals(block.extends, id);

/** The blocks that extend a block, in the order they were read. */
const heirsOf = (model: ProjectModel, id: BlockId): readonly BlockId[] =>
  model.blocks.filter((block) => extendsBlock(block, id)).map((block) => block.id);

/** The rules that tighten a rule and take their level from it, in the order they were read. */
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

const blockNamed = (model: ProjectModel, name: string): CatalogueBlock | undefined =>
  BlockId.is(name) ? model.byId.get(name) : undefined;

const ruleNamed = (model: ProjectModel, slug: string): CatalogueRule | undefined =>
  RuleSlug.is(slug) ? model.rules.get(slug) : undefined;

const ProjectModel = {
  basesOf,
  blockNamed,
  create,
  heirsOf,
  inheritorsOf,
  ruleNamed,
} as const;

export { ProjectModel };
