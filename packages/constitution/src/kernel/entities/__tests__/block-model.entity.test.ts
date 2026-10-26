import { describe, expect, it } from 'bun:test';

import { Axis, Layer } from '../../constants';
import { BlockId, coreBlockId } from '../../value-objects';
import type { ModelBlock, RoleTerm } from '../block-model.entity';
import { BlockModel } from '../block-model.entity';
import { TermKind } from '../term.entity';

interface BlockFixture {
  readonly extends?: string;
  readonly id: string;
  readonly requires?: readonly string[];
}

const blockOf = (input: BlockFixture): ModelBlock => ({
  ...(input.extends === undefined
    ? {}
    : {
        extends: BlockId.create(input.extends),
      }),
  governs: [],
  id: BlockId.create(input.id),
  languages: [],
  layer: Layer.Implementation,
  requires: (input.requires ?? []).map(BlockId.create),
});

const modelOf = (blocks: readonly BlockFixture[]): BlockModel =>
  BlockModel.create({
    blocks: [
      {
        governs: [],
        id: coreBlockId,
        languages: [],
        layer: Layer.Core,
        requires: [],
      },
      ...blocks.map(blockOf),
    ],
    roles: [],
    rules: [],
  });

describe('BlockModel.reachOf', () => {
  it.each<{
    blocks: readonly BlockFixture[];
    condition: string;
    expected: readonly string[];
    reader: string;
  }>([
    {
      blocks: [
        {
          id: '_runtime',
        },
        {
          extends: '_runtime',
          id: 'bun',
          requires: [
            'typescript',
          ],
        },
        {
          id: 'typescript',
          requires: [
            'json',
          ],
        },
        {
          id: 'json',
        },
        {
          id: 'biome',
        },
      ],
      condition: 'it extends a base and requires a block that requires another',
      expected: [
        'bun',
        'core',
        '_runtime',
        'typescript',
        'json',
      ],
      reader: 'bun',
    },
    {
      blocks: [
        {
          id: 'a',
          requires: [
            'b',
            'gone',
          ],
        },
        {
          id: 'b',
          requires: [
            'a',
          ],
        },
      ],
      condition: 'its requires close in a cycle and name a block that is none',
      expected: [
        'a',
        'core',
        'b',
      ],
      reader: 'a',
    },
    {
      blocks: [],
      condition: 'the reader is no block',
      expected: [],
      reader: 'gone',
    },
  ])('should give the blocks a reader reaches when $condition', ({ blocks, expected, reader }) => {
    // Arrange
    const model = modelOf(blocks);

    // Act
    const reached = BlockModel.reachOf(model, BlockId.create(reader));

    // Assert
    expect([
      ...reached,
    ]).toStrictEqual(expected.map(BlockId.create));
  });
});

const languageOf = (id: string): ModelBlock => ({
  governs: [],
  id: BlockId.create(id),
  languages: [],
  layer: Layer.Language,
  requires: [],
});

const folderOf = (input: { block: BlockId; term: string }): RoleTerm => ({
  axis: Axis.Architecture,
  block: input.block,
  id: 'use-case',
  kind: TermKind.Folder,
  term: input.term,
});

const python = BlockId.create('python');
const roleModel = BlockModel.create({
  blocks: [
    ...modelOf([]).blocks,
    blockOf({
      id: 'import-linter',
      requires: [
        'python',
      ],
    }),
    languageOf('python'),
    languageOf('typescript'),
  ],
  roles: [
    folderOf({
      block: coreBlockId,
      term: 'use-cases/',
    }),
    folderOf({
      block: python,
      term: 'use_cases/',
    }),
  ],
  rules: [],
});

describe('BlockModel.roleOf', () => {
  it.each([
    {
      condition: 'a language spells it its own way',
      expected: 'use_cases/',
      readers: [
        'python',
      ],
    },
    {
      condition: 'a block reaches the language that spells it',
      expected: 'use_cases/',
      readers: [
        'import-linter',
      ],
    },
    {
      condition: 'the readers reach only core',
      expected: 'use-cases/',
      readers: [
        'typescript',
      ],
    },
    {
      condition: 'the model knows none of the readers',
      expected: 'use-cases/',
      readers: [
        'go',
      ],
    },
  ])(
    'should give the term of the most specific block the readers reach when $condition',
    ({ expected, readers }) => {
      // Act
      const role = BlockModel.roleOf(roleModel, {
        id: 'use-case',
        readers,
      });

      // Assert
      expect(role?.term).toBe(expected);
    },
  );

  it('should give no term for an id no block defines', () => {
    // Act
    const role = BlockModel.roleOf(roleModel, {
      id: 'entity',
      readers: [
        'python',
      ],
    });

    // Assert
    expect(role).toBeUndefined();
  });
});

describe('BlockModel.rolesIn', () => {
  it('should give each folder and suffix by its first definition, with the id it carries, in the order the files are read, when the files define other terms and one folder twice', () => {
    // Arrange
    const texts = [
      {
        axis: Axis.Foundation,
        block: coreBlockId,
        body: 'The **`kernel/`** opens at **`index.ts`**, a **surface**.',
      },
      {
        axis: Axis.Architecture,
        block: BlockId.create('ui'),
        body: 'A screen sits in **`screens/`**{#screen}, named **`.screen`**, beside **`kernel/`**{#shared-domain}.',
      },
    ];

    // Act
    const roles = BlockModel.rolesIn(texts);

    // Assert
    expect(roles).toStrictEqual([
      {
        axis: Axis.Foundation,
        block: coreBlockId,
        kind: TermKind.Folder,
        term: 'kernel/',
      },
      {
        axis: Axis.Architecture,
        block: BlockId.create('ui'),
        id: 'screen',
        kind: TermKind.Folder,
        term: 'screens/',
      },
      {
        axis: Axis.Architecture,
        block: BlockId.create('ui'),
        kind: TermKind.Suffix,
        term: '.screen',
      },
    ]);
  });
});
