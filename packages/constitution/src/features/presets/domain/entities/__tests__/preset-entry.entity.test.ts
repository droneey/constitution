import { describe, expect, it } from 'bun:test';

import { Axis, Layer } from '#/kernel/constants';
import { BlockModel, TermKind } from '#/kernel/entities';
import { BlockId, BlockSource, coreBlockId, PackPath, SourceKind } from '#/kernel/value-objects';

import { presetsModel } from '../../../__tests__/presets.fixtures';
import { TargetFile } from '../../value-objects';
import type { PresetEntry as Entry } from '../preset-entry.entity';
import { PresetEntry } from '../preset-entry.entity';
import { PresetValue } from '../preset-value.entity';

const entryOf = (input: { index: number; pack?: string }): Entry => ({
  block: 'biome',
  file: TargetFile.of('biome.json'),
  index: input.index,
  language: '*',
  rule: '*',
  set: {
    file: 'presets/biome/foundation.yaml',
    path: {
      axis: Axis.Foundation,
      reader: 'biome',
      withs: [],
    },
    source: BlockSource.create(input.pack === undefined ? undefined : PackPath.create(input.pack)),
  },
  value: PresetValue.plain(input.index),
});

// Core spells the folder one way, and Python, which import-linter requires, its own.
const spelledModel = BlockModel.create({
  blocks: [
    ...presetsModel.blocks,
    {
      governs: [],
      id: BlockId.create('python'),
      languages: [],
      layer: Layer.Language,
      requires: [],
    },
    {
      governs: [],
      id: BlockId.create('import-linter'),
      languages: [],
      layer: Layer.Implementation,
      requires: [
        BlockId.create('python'),
      ],
    },
  ],
  roles: [
    {
      axis: Axis.Architecture,
      block: coreBlockId,
      id: 'use-case',
      kind: TermKind.Folder,
      term: 'use-cases/',
    },
    {
      axis: Axis.Architecture,
      block: BlockId.create('python'),
      id: 'use-case',
      kind: TermKind.Folder,
      term: 'use_cases/',
    },
  ],
  rules: [],
});

const keyedOf = (input: {
  block: string;
  language: string;
  reader: string;
  withs: readonly string[];
}): Entry => {
  const entry = entryOf({
    index: 0,
  });

  return {
    ...entry,
    block: input.block,
    language: input.language,
    set: {
      ...entry.set,
      path: {
        ...entry.set.path,
        reader: input.reader,
        withs: input.withs,
      },
    },
  };
};

const placeOf = (entry: Entry): string =>
  `${entry.set.source.kind === SourceKind.Pack ? entry.set.source.pack : 'release'}#${String(entry.index)}`;

describe('PresetEntry', () => {
  it("should order the entries of one block and preset file by their source, the release's first, then by their places", () => {
    // Arrange
    const entries = [
      entryOf({
        index: 0,
        pack: 'Packs/zeta',
      }),
      entryOf({
        index: 0,
        pack: 'packs/acme',
      }),
      entryOf({
        index: 2,
      }),
      entryOf({
        index: 1,
      }),
    ];

    // Act
    const ordered = entries.toSorted(PresetEntry.orderOf(presetsModel));

    // Assert
    expect(ordered.map(placeOf)).toStrictEqual([
      'release#1',
      'release#2',
      'Packs/zeta#0',
      'packs/acme#0',
    ]);
  });

  it.each([
    {
      condition: 'its language spells the folder its own way',
      expected: 'use_cases/',
      key: {
        block: 'core',
        language: 'python',
        reader: 'biome',
        withs: [],
      },
    },
    {
      condition: 'its language spells it as core does',
      expected: 'use-cases/',
      key: {
        block: 'core',
        language: 'typescript',
        reader: 'import-linter',
        withs: [],
      },
    },
    {
      condition: 'it is of every language and its block reaches the language',
      expected: 'use_cases/',
      key: {
        block: 'import-linter',
        language: '*',
        reader: 'biome',
        withs: [],
      },
    },
    {
      condition: 'it is of every language and its reader reaches the language',
      expected: 'use_cases/',
      key: {
        block: 'core',
        language: '*',
        reader: 'import-linter',
        withs: [],
      },
    },
    {
      condition: 'it is of every language and a block its preset file needs reaches the language',
      expected: 'use_cases/',
      key: {
        block: 'core',
        language: '*',
        reader: 'biome',
        withs: [
          'import-linter',
        ],
      },
    },
  ])(
    'should name the folder of a role as the entry reads it when $condition',
    ({ expected, key }) => {
      // Act
      const role = PresetEntry.roleOf({
        entry: keyedOf(key),
        id: 'use-case',
        model: spelledModel,
      });

      // Assert
      expect(role?.term).toBe(expected);
    },
  );

  it.each([
    {
      block: 'tsc',
      condition: 'its preset file is written with blocks',
      withs: [
        'tsc',
        'workspace',
      ],
    },
    {
      block: 'biome',
      condition: 'its preset file names the reader alone',
      withs: [],
    },
  ])('should name $block as the block that brings an entry when $condition', ({ block, withs }) => {
    // Arrange
    const entry = entryOf({
      index: 0,
    });

    // Act
    const named = PresetEntry.blockOf({
      ...entry,
      block: 'core',
      set: {
        ...entry.set,
        path: {
          ...entry.set.path,
          withs,
        },
      },
    });

    // Assert
    expect(named).toBe(block);
  });
});
