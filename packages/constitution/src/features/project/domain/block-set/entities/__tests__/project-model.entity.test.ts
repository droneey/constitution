import { describe, expect, it } from 'bun:test';

import { Axis, Layer, Level } from '#/kernel/constants';
import { BlockId, BlockSource, RuleSlug } from '#/kernel/value-objects';

import type { BlockSetBlock, BlockSetRule } from '../block-set.entity';
import { ProjectModel } from '../project-model.entity';

const blockOf = (input: { base?: string; id: string; layer?: Layer }): BlockSetBlock => ({
  chapters: [],
  ...(input.base === undefined
    ? {}
    : {
        extends: BlockId.create(input.base),
      }),
  governs: [],
  id: BlockId.create(input.id),
  isAbstract: false,
  languages: [],
  layer: input.layer ?? Layer.Domain,
  requires: [],
  seams: [],
  source: BlockSource.create(),
});

const ruleOf = (input: {
  isLevelStated: boolean;
  slug: string;
  tightens?: string;
}): BlockSetRule => ({
  axis: Axis.Foundation,
  block: BlockId.create('ui'),
  isLevelStated: input.isLevelStated,
  level: Level.Must,
  slug: RuleSlug.create(input.slug),
  ...(input.tightens === undefined
    ? {}
    : {
        tightens: RuleSlug.create(input.tightens),
      }),
});

const modelOf = (input: {
  blocks?: readonly BlockSetBlock[];
  rules?: readonly BlockSetRule[];
}): ProjectModel =>
  ProjectModel.create({
    ancestors: new Map(),
    answers: [],
    blocks: input.blocks ?? [],
    roles: [],
    rules: input.rules ?? [],
  });

describe('ProjectModel', () => {
  it('should name the blocks that extend a block, in the order they were read, when other blocks extend another or none', () => {
    // Arrange
    const model = modelOf({
      blocks: [
        blockOf({
          base: '_store',
          id: 'owned-data',
        }),
        blockOf({
          id: 'ui',
        }),
        blockOf({
          base: '_cache',
          id: 'edge-cache',
        }),
        blockOf({
          base: '_store',
          id: 'messaging',
        }),
      ],
    });

    // Act
    const heirs = ProjectModel.heirsOf(model, BlockId.create('_store'));

    // Assert
    expect(heirs).toStrictEqual([
      BlockId.create('owned-data'),
      BlockId.create('messaging'),
    ]);
  });

  it('should name the rules that tighten a rule and take their level from it when other rules state a level or tighten another', () => {
    // Arrange
    const model = modelOf({
      rules: [
        ruleOf({
          isLevelStated: false,
          slug: 'labels-translated',
          tightens: 'inputs-are-labelled',
        }),
        ruleOf({
          isLevelStated: true,
          slug: 'labels-short',
          tightens: 'inputs-are-labelled',
        }),
        ruleOf({
          isLevelStated: false,
          slug: 'focus-ringed',
          tightens: 'focus-is-shown',
        }),
        ruleOf({
          isLevelStated: true,
          slug: 'inputs-grouped',
        }),
        ruleOf({
          isLevelStated: false,
          slug: 'labels-visible',
          tightens: 'inputs-are-labelled',
        }),
      ],
    });

    // Act
    const inheritors = ProjectModel.inheritorsOf(model, RuleSlug.create('inputs-are-labelled'));

    // Assert
    expect(inheritors).toStrictEqual([
      RuleSlug.create('labels-translated'),
      RuleSlug.create('labels-visible'),
    ]);
  });

  it('should name the language blocks among the blocks of a unit in the order they were read when the unit holds other blocks and the block set other languages', () => {
    // Arrange
    const model = modelOf({
      blocks: [
        blockOf({
          id: 'typescript',
          layer: Layer.Language,
        }),
        blockOf({
          id: 'ui',
        }),
        blockOf({
          id: 'css',
          layer: Layer.Language,
        }),
        blockOf({
          id: 'python',
          layer: Layer.Language,
        }),
      ],
    });

    // Act
    const languages = ProjectModel.languagesOf(
      model,
      new Set([
        BlockId.create('css'),
        BlockId.create('ui'),
        BlockId.create('typescript'),
      ]),
    );

    // Assert
    expect([
      ...languages,
    ]).toStrictEqual([
      BlockId.create('typescript'),
      BlockId.create('css'),
    ]);
  });
});
