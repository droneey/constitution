import { describe, expect, it } from 'bun:test';

import { Axis, BlockFormat, Layer, Level } from '#/kernel/constants';
import { BlockId, BlockSource, RuleSlug } from '#/kernel/value-objects';

import type { BlockSetBlock, BlockSetRule } from '../block-set.entity';
import { ProjectModel } from '../project-model.entity';

const blockOf = (input: { id: string; layer?: Layer }): BlockSetBlock => ({
  chapters: [],
  format: BlockFormat.Nested,
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
  ancestors?: Readonly<Record<string, readonly string[]>>;
  blocks?: readonly BlockSetBlock[];
  rules?: readonly BlockSetRule[];
}): ProjectModel =>
  ProjectModel.create({
    ancestors: new Map(
      Object.entries(input.ancestors ?? {}).map(([id, ancestors]) => [
        BlockId.create(id),
        ancestors.map(BlockId.create),
      ]),
    ),
    blocks: input.blocks ?? [],
    roles: [],
    rules: input.rules ?? [],
  });

describe('ProjectModel', () => {
  it('should name the ancestors of a block nearest first, and none for a block at the top of its tree, when blocks nest', () => {
    // Arrange
    const model = modelOf({
      ancestors: {
        'react/react-native': [
          'react',
        ],
        'react/react-native/expo': [
          'react/react-native',
          'react',
        ],
      },
      blocks: [
        blockOf({
          id: 'react',
        }),
        blockOf({
          id: 'react/react-native',
        }),
        blockOf({
          id: 'react/react-native/expo',
        }),
      ],
    });

    // Act
    const ancestors = [
      'react/react-native/expo',
      'react',
    ].map((id) => ProjectModel.ancestorsOf(model, BlockId.create(id)));

    // Assert
    expect(ancestors).toStrictEqual([
      [
        BlockId.create('react/react-native'),
        BlockId.create('react'),
      ],
      [],
    ]);
  });

  it('should name the children of a block in the order they were read, leaving out its grandchildren, when blocks nest under it and under another', () => {
    // Arrange
    const model = modelOf({
      ancestors: {
        'react/ink': [
          'react',
        ],
        'react/react-native': [
          'react',
        ],
        'react/react-native/expo': [
          'react/react-native',
          'react',
        ],
        'schema/zod': [
          'schema',
        ],
      },
      blocks: [
        blockOf({
          id: 'react/react-native',
        }),
        blockOf({
          id: 'ui',
        }),
        blockOf({
          id: 'react/react-native/expo',
        }),
        blockOf({
          id: 'schema/zod',
        }),
        blockOf({
          id: 'react/ink',
        }),
      ],
    });

    // Act
    const children = ProjectModel.childrenOf(model, BlockId.create('react'));

    // Assert
    expect(children).toStrictEqual([
      BlockId.create('react/react-native'),
      BlockId.create('react/ink'),
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
