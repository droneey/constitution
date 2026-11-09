import { describe, expect, it } from 'bun:test';

import { Axis, Layer } from '../../constants';
import { BlockId, coreBlockId } from '../../value-objects';
import type { ModelBlock, RoleTerm } from '../block-model.entity';
import { BlockModel } from '../block-model.entity';
import { TermKind } from '../term.entity';

interface BlockFixture {
  readonly id: string;
  readonly requires?: readonly string[];
}

const blockOf = (input: BlockFixture): ModelBlock => ({
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

describe('BlockModel.blockOf', () => {
  it.each([
    {
      condition: 'the model holds a block of the id',
      expected: blockOf({
        id: 'redis',
      }),
      id: 'redis',
    },
    {
      condition: 'no block of the model has the id',
      expected: undefined,
      id: 'mongo',
    },
  ])('should give the block of the id when $condition', ({ expected, id }) => {
    // Arrange
    const model = modelOf([
      {
        id: 'redis',
      },
    ]);

    // Act
    const block = BlockModel.blockOf(model, id);

    // Assert
    expect(block).toStrictEqual(expected);
  });
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
      condition: 'it requires a block that requires another',
      expected: [
        'bun',
        'core',
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
      blocks: [
        {
          id: 'task-runner',
        },
        {
          id: 'js-runtime',
        },
        {
          id: 'js-runtime/bun',
          requires: [
            'task-runner',
          ],
        },
        {
          id: 'react',
        },
      ],
      condition: 'it sits in the folder of a parent and requires a block',
      expected: [
        'js-runtime/bun',
        'core',
        'task-runner',
        'js-runtime',
      ],
      reader: 'js-runtime/bun',
    },
    {
      blocks: [
        {
          id: 'react',
          requires: [
            'typescript',
          ],
        },
        {
          id: 'react/react-native',
        },
        {
          id: 'react/react-native/expo',
        },
        {
          id: 'typescript',
        },
      ],
      condition: 'it sits two folders below a parent that requires a block',
      expected: [
        'react/react-native/expo',
        'core',
        'react/react-native',
        'react',
        'typescript',
      ],
      reader: 'react/react-native/expo',
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
        readers: readers.map(BlockId.create),
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
        BlockId.create('python'),
      ],
    });

    // Assert
    expect(role).toBeUndefined();
  });
});

describe('BlockModel.reachedRoleOf', () => {
  it.each([
    {
      condition: 'a language the readers reach spells it its own way',
      expected: 'use_cases/',
      readers: [
        'import-linter',
      ],
    },
    {
      condition: 'the readers reach only core, which defines it',
      expected: 'use-cases/',
      readers: [
        'typescript',
      ],
    },
    {
      condition: 'the model knows none of the readers',
      expected: undefined,
      readers: [
        'go',
      ],
    },
  ])(
    'should give the term of the most specific block the readers reach, and none where they reach none, when $condition',
    ({ expected, readers }) => {
      // Act
      const role = BlockModel.reachedRoleOf(roleModel, {
        id: 'use-case',
        readers: readers.map(BlockId.create),
      });

      // Assert
      expect(role?.term).toBe(expected);
    },
  );
});

describe('BlockModel.reachedRoleOf of a role a seam defines', () => {
  const tsc = BlockId.create('tsc');
  const seamModel = BlockModel.create({
    blocks: [
      ...modelOf([]).blocks,
      blockOf({
        id: 'tsc',
      }),
      blockOf({
        id: 'workspace',
      }),
      blockOf({
        id: 'monorepo-tsc',
        requires: [
          'tsc',
          'workspace',
        ],
      }),
    ],
    roles: [
      {
        axis: Axis.Foundation,
        block: tsc,
        id: 'declaration-cache',
        kind: TermKind.Folder,
        seam: BlockId.create('workspace'),
        term: '.tsc-cache/',
      },
    ],
    rules: [],
  });

  it.each([
    {
      condition: 'the readers reach both of its blocks',
      expected: '.tsc-cache/',
      readers: [
        'tsc',
        'workspace',
      ],
    },
    {
      condition: 'a reader reaches both of its blocks',
      expected: '.tsc-cache/',
      readers: [
        'monorepo-tsc',
      ],
    },
    {
      condition: 'the readers reach only the block that holds the seam',
      expected: undefined,
      readers: [
        'tsc',
      ],
    },
  ])(
    'should give its term only where both of its blocks are reached, when $condition',
    ({ expected, readers }) => {
      // Act
      const role = BlockModel.reachedRoleOf(seamModel, {
        id: 'declaration-cache',
        readers: readers.map(BlockId.create),
      });

      // Assert
      expect(role?.term).toBe(expected);
    },
  );
});

describe('BlockModel.rolesIn', () => {
  it("should give a folder a seam defines with the seam's other block", () => {
    // Arrange
    const texts = [
      {
        axis: Axis.Foundation,
        block: BlockId.create('tsc'),
        body: 'Its declarations go into **`.tsc-cache/`**{#declaration-cache}.',
        seam: BlockId.create('workspace'),
      },
    ];

    // Act
    const roles = BlockModel.rolesIn(texts);

    // Assert
    expect(roles).toStrictEqual([
      {
        axis: Axis.Foundation,
        block: BlockId.create('tsc'),
        id: 'declaration-cache',
        kind: TermKind.Folder,
        seam: BlockId.create('workspace'),
        term: '.tsc-cache/',
      },
    ]);
  });

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
        body: 'A screen sits in **`screens/`**{#screen}, named **`.screen`**, beside **`kernel/`**{#shared-kernel}.',
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

describe('BlockModel.rolesIn of files', () => {
  it("should give a file a block spells under an id, and a name such as `<entry>` that stands for it under the same id, as the file's role", () => {
    // Arrange
    const texts = [
      {
        axis: Axis.Foundation,
        block: coreBlockId,
        body: 'A program starts at **`<entry>`**{#entry}, absence is **`<absent>`**{#absent}, **`renovate.json`** names updates and **`bun:test`** runs the specs.',
      },
      {
        axis: Axis.Foundation,
        block: BlockId.create('typescript'),
        body: 'A program starts at **`main.ts`**{#entry}, and absence is **`undefined`**{#absent}.',
      },
    ];

    // Act
    const roles = BlockModel.rolesIn(texts);

    // Assert
    expect(roles).toStrictEqual([
      {
        axis: Axis.Foundation,
        block: coreBlockId,
        id: 'entry',
        kind: TermKind.File,
        term: '<entry>',
      },
      {
        axis: Axis.Foundation,
        block: BlockId.create('typescript'),
        id: 'entry',
        kind: TermKind.File,
        term: 'main.ts',
      },
    ]);
  });
});

describe('BlockModel.listsIn', () => {
  it('should give the words each concept that carries an id lists, by the block and the seam that define it', () => {
    // Arrange
    const texts = [
      {
        axis: Axis.Foundation,
        block: coreBlockId,
        body: 'The **empty names**{#empty-names} are `data` and `info`; the **hollow words** are `try`, and **kebab-case**{#name-case} is the case.',
      },
      {
        axis: Axis.Foundation,
        block: BlockId.create('typescript'),
        body: 'The **empty words**{#empty-names} are `data` and `item`.',
        seam: BlockId.create('workspace'),
      },
    ];

    // Act
    const lists = BlockModel.listsIn(texts);

    // Assert
    expect(lists).toStrictEqual([
      {
        axis: Axis.Foundation,
        block: coreBlockId,
        id: 'empty-names',
        members: [
          'data',
          'info',
        ],
      },
      {
        axis: Axis.Foundation,
        block: BlockId.create('typescript'),
        id: 'empty-names',
        members: [
          'data',
          'item',
        ],
        seam: BlockId.create('workspace'),
      },
    ]);
  });
});

describe('BlockModel.listOf', () => {
  const listModel = BlockModel.create({
    ...roleModel,
    lists: [
      {
        axis: Axis.Foundation,
        block: coreBlockId,
        id: 'empty-names',
        members: [
          'data',
        ],
      },
      {
        axis: Axis.Foundation,
        block: python,
        id: 'empty-names',
        members: [
          'data',
          'obj',
        ],
      },
    ],
  });

  it.each([
    {
      condition: 'a language the readers reach spells it its own way',
      expected: [
        'data',
        'obj',
      ],
      readers: [
        'import-linter',
      ],
    },
    {
      condition: 'the readers reach only core',
      expected: [
        'data',
      ],
      readers: [
        'typescript',
      ],
    },
    {
      condition: 'the model knows none of the readers',
      expected: [
        'data',
      ],
      readers: [
        'go',
      ],
    },
  ])(
    'should give the words of the most specific block the readers reach when $condition',
    ({ expected, readers }) => {
      // Act
      const list = BlockModel.listOf(listModel, {
        id: 'empty-names',
        readers: readers.map(BlockId.create),
      });

      // Assert
      expect(list?.members).toStrictEqual(expected);
    },
  );

  it('should give no words for an id no concept carries', () => {
    // Act
    const list = BlockModel.listOf(listModel, {
      id: 'dating-words',
      readers: [
        python,
      ],
    });

    // Assert
    expect(list).toBeUndefined();
  });

  it('should hold no list in a model made without one', () => {
    // Act
    const { lists } = BlockModel.create({
      blocks: [],
      roles: [],
      rules: [],
    });

    // Assert
    expect(lists).toStrictEqual([]);
  });
});
