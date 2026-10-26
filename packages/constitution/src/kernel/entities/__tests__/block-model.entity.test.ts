import { describe, expect, it } from 'bun:test';

import { Layer } from '../../constants';
import { BlockId, coreBlockId } from '../../value-objects';
import type { ModelBlock } from '../block-model.entity';
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
  id: BlockId.create(input.id),
  languages: [],
  layer: Layer.Implementation,
  requires: (input.requires ?? []).map(BlockId.create),
});

const modelOf = (blocks: readonly BlockFixture[]): BlockModel =>
  BlockModel.create({
    blocks: [
      {
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

describe('BlockModel.rolesIn', () => {
  it('should give each folder and suffix by its first definition, with the id it carries, in the order the files are read, when the files define other terms and one folder twice', () => {
    // Arrange
    const texts = [
      {
        block: coreBlockId,
        body: 'The **`kernel/`** opens at **`index.ts`**, a **surface**.',
      },
      {
        block: BlockId.create('ui'),
        body: 'A screen sits in **`screens/`**{#screen}, named **`.screen`**, beside **`kernel/`**{#shared-domain}.',
      },
    ];

    // Act
    const roles = BlockModel.rolesIn(texts);

    // Assert
    expect(roles).toStrictEqual([
      {
        block: coreBlockId,
        kind: TermKind.Folder,
        term: 'kernel/',
      },
      {
        block: BlockId.create('ui'),
        id: 'screen',
        kind: TermKind.Folder,
        term: 'screens/',
      },
      {
        block: BlockId.create('ui'),
        kind: TermKind.Suffix,
        term: '.screen',
      },
    ]);
  });
});
