import { describe, expect, it } from 'bun:test';

import { Axis, Layer } from '#/kernel/constants';
import { BlockModel, TermKind } from '#/kernel/entities';
import {
  BlockId,
  BlockSource,
  coreBlockId,
  PackPath,
  RepositoryRelativePath,
  SourceKind,
} from '#/kernel/value-objects';

import { presetsModel } from '../../../../__tests__/presets.fixtures';
import { EVERY } from '../../../constants';
import { EntryTarget } from '../../../value-objects';
import { PresetValue } from '../../preset-value/preset-value.entity';
import type { PresetEntry as Entry, LanguageKey } from '../preset-entry.entity';
import { PresetEntry } from '../preset-entry.entity';

const entryOf = (input: { index: number; key?: string; pack?: string }): Entry => ({
  ...EntryTarget.of(input.key ?? 'biome.json'),
  block: BlockId.create('biome'),
  index: input.index,
  language: EVERY,
  rule: EVERY,
  set: {
    filePath: RepositoryRelativePath.create('presets/biome/foundation.yaml'),
    placeInPresets: {
      axis: Axis.Foundation,
      reader: BlockId.create('biome'),
      withs: [],
    },
    source: BlockSource.create(input.pack === undefined ? undefined : PackPath.create(input.pack)),
  },
  value: PresetValue.plain(input.index),
});

const spelledModel = BlockModel.create({
  blocks: [
    ...presetsModel.blocks,
    {
      governs: [],
      id: BlockId.create('python'),
      isAbstract: false,
      languages: [],
      layer: Layer.Language,
      requires: [],
    },
    {
      governs: [],
      id: BlockId.create('import-linter'),
      isAbstract: false,
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
  block: BlockId;
  language: LanguageKey;
  reader: BlockId;
  withs: readonly BlockId[];
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
      placeInPresets: {
        ...entry.set.placeInPresets,
        reader: input.reader,
        withs: input.withs,
      },
    },
  };
};

const keyedEntryOf = (input: { key: string; pattern: string }): Entry => ({
  ...entryOf({
    index: 0,
    key: input.key,
  }),
  value: PresetValue.plain([
    input.pattern,
  ]),
});

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
      expected: 'use_cases',
      key: {
        block: BlockId.create('core'),
        language: BlockId.create('python'),
        reader: BlockId.create('biome'),
        withs: [],
      },
    },
    {
      condition: 'its language spells it as core does',
      expected: 'use-cases',
      key: {
        block: BlockId.create('core'),
        language: BlockId.create('typescript'),
        reader: BlockId.create('import-linter'),
        withs: [],
      },
    },
    {
      condition: 'it is of every language and its block reaches the language',
      expected: 'use_cases',
      key: {
        block: BlockId.create('import-linter'),
        language: EVERY,
        reader: BlockId.create('biome'),
        withs: [],
      },
    },
    {
      condition: 'it is of every language and its reader reaches the language',
      expected: 'use_cases',
      key: {
        block: BlockId.create('core'),
        language: EVERY,
        reader: BlockId.create('import-linter'),
        withs: [],
      },
    },
    {
      condition: 'it is of every language and a block its preset file needs reaches the language',
      expected: 'use_cases',
      key: {
        block: BlockId.create('core'),
        language: EVERY,
        reader: BlockId.create('biome'),
        withs: [
          BlockId.create('import-linter'),
        ],
      },
    },
  ])(
    'should name the folder of a role as the entry reads it when $condition',
    ({ expected, key }) => {
      // Act
      const name = PresetEntry.roleNameOf({
        entry: keyedOf(key),
        id: 'use-case',
        model: spelledModel,
      });

      // Assert
      expect(name).toBe(expected);
    },
  );

  it.each([
    {
      block: BlockId.create('tsc'),
      condition: 'its preset file is written with blocks',
      withs: [
        BlockId.create('tsc'),
        BlockId.create('workspace'),
      ],
    },
    {
      block: BlockId.create('biome'),
      condition: 'its preset file names the reader alone',
      withs: [],
    },
  ])('should name $block as the block that brings an entry when $condition', ({ block, withs }) => {
    // Arrange
    const entry = entryOf({
      index: 0,
    });

    // Act
    const named = PresetEntry.bringingBlockOf({
      ...entry,
      block: coreBlockId,
      set: {
        ...entry.set,
        placeInPresets: {
          ...entry.set.placeInPresets,
          withs,
        },
      },
    });

    // Assert
    expect(named).toBe(block);
  });
});

describe('PresetEntry.roleIdsOf', () => {
  it.each([
    {
      condition: 'its path, its guard and its value name roles beside other facts',
      expected: [
        'source',
        'gateway',
        'gateway-file',
      ],
      key: '${role.source}/biome.json ? ${unit.parent} = ${role.gateway}',
      pattern: '**/*${role.gateway-file}.${unit.name}',
    },
    {
      condition: 'its guard tests a role and its value names none',
      expected: [
        'ignore-file',
      ],
      key: 'biome.json ? ${role.ignore-file} = .gitignore',
      pattern: '${unit.name}',
    },
    {
      condition: 'it is a run, which writes no file, and its value names a role',
      expected: [
        'source',
      ],
      key: '${constitution.run}',
      pattern: '${role.source}',
    },
  ])(
    'should give the ids of the roles it names, in their order, when $condition',
    ({ expected, key, pattern }) => {
      // Arrange
      const entry = keyedEntryOf({
        key,
        pattern,
      });

      // Act
      const ids = PresetEntry.roleIdsOf(entry);

      // Assert
      expect(ids).toStrictEqual(expected);
    },
  );
});
