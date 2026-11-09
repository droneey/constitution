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
import { PresetValue, ValueKind } from '../../../setting/entities';
import { EVERY } from '../../../shared/constants';
import { EntryTarget } from '../../../shared/value-objects';
import type { PresetEntry as Entry, LanguageKey } from '../preset-entry.entity';
import { PresetEntry, TextPlace } from '../preset-entry.entity';

const entryOf = (input: { index: number; key?: string; pack?: string }): Entry => ({
  ...EntryTarget.of(input.key ?? 'biome.json'),
  block: BlockId.create('biome'),
  index: input.index,
  language: EVERY,
  rule: EVERY,
  set: {
    filePath: RepositoryRelativePath.create('presets/biome/@foundation.yaml'),
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
    {
      axis: Axis.Foundation,
      block: coreBlockId,
      id: 'entry',
      kind: TermKind.File,
      term: '<entry>',
    },
    {
      axis: Axis.Foundation,
      block: BlockId.create('python'),
      id: 'entry',
      kind: TermKind.File,
      term: 'main.py',
    },
  ],
  rules: [],
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
      block: BlockId.create('python'),
      id: 'empty-names',
      members: [
        'data',
        'obj',
      ],
    },
  ],
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
        'adapter',
        'adapter-file',
      ],
      key: '${role.source}/biome.json ? ${unit.parent} = ${role.adapter}',
      pattern: '**/*${role.adapter-file}.${unit.name}',
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

describe('PresetEntry of a file role and a list term', () => {
  const python = {
    block: coreBlockId,
    language: BlockId.create('python'),
    reader: BlockId.create('import-linter'),
    withs: [],
  };
  const typescript = {
    ...python,
    language: BlockId.create('typescript'),
  };

  it.each([
    {
      condition: 'its language spells the file',
      expected: 'main',
      key: python,
    },
    {
      condition: 'no block it reaches spells the file core names only as a placeholder',
      expected: undefined,
      key: typescript,
    },
  ])(
    'should name the file of a role without its extension when $condition',
    ({ expected, key }) => {
      // Act
      const name = PresetEntry.roleNameOf({
        entry: keyedOf(key),
        id: 'entry',
        model: spelledModel,
      });

      // Assert
      expect(name).toBe(expected);
    },
  );

  it.each([
    {
      condition: 'its language lists them its own way',
      expected: [
        'data',
        'obj',
      ],
      id: 'empty-names',
      key: python,
    },
    {
      condition: 'only core lists them',
      expected: [
        'data',
      ],
      id: 'empty-names',
      key: typescript,
    },
    {
      condition: 'no concept carries the id',
      expected: undefined,
      id: 'dating-words',
      key: python,
    },
  ])(
    'should give the words of a term as the entry reads it when $condition',
    ({ expected, id, key }) => {
      // Act
      const members = PresetEntry.membersOf({
        entry: keyedOf(key),
        id,
        model: spelledModel,
      });

      // Assert
      expect(members).toStrictEqual(expected);
    },
  );
});

describe('PresetEntry of a copy', () => {
  const copyOf = (setting: string | readonly string[]): Entry => ({
    ...entryOf({
      index: 0,
      key: 'biome.gen/rule.grit',
    }),
    value: {
      isWords: false,
      kind: ValueKind.Copy,
      setting,
    },
  });

  it('should give the text a copy names as the file it copies', () => {
    // Act
    const texts = PresetEntry.textsOf(
      copyOf('${constitution.path}/presets/biome/plugins/rule.grit'),
    );

    // Assert
    expect(texts).toStrictEqual([
      {
        place: TextPlace.Copied,
        text: '${constitution.path}/presets/biome/plugins/rule.grit',
      },
    ]);
  });

  it.each([
    {
      condition: 'it names a file of the release, its roles spelled',
      entry: copyOf('${constitution.path}/presets/${role.use-case}/rule.grit'),
      expected: [
        'presets/use-cases/rule.grit',
      ],
    },
    {
      condition: 'it names no file of the release',
      entry: copyOf('presets/rule.grit'),
      expected: [],
    },
    {
      condition: 'its value holds no text',
      entry: copyOf([
        'presets/rule.grit',
      ]),
      expected: [],
    },
    {
      condition: 'the entry copies nothing',
      entry: keyedEntryOf({
        key: 'biome.json',
        pattern: '${constitution.path}/presets/rule.grit',
      }),
      expected: [],
    },
  ])(
    'should give the path in the release an entry copies when $condition',
    ({ entry, expected }) => {
      // Act
      const copied = PresetEntry.copiedPathsOf({
        entry,
        model: spelledModel,
      });

      // Assert
      expect(copied).toStrictEqual(expected);
    },
  );
});
