import { describe, expect, it } from 'bun:test';

import { Axis } from '#/kernel/constants';
import { BlockSource, PackPath, SourceKind } from '#/kernel/value-objects';

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

// An entry by its source and its place in its catalogue.
const placeOf = (entry: Entry): string =>
  `${entry.set.source.kind === SourceKind.Pack ? entry.set.source.pack : 'release'}#${String(entry.index)}`;

describe('PresetEntry', () => {
  it("should order the entries of one block and catalogue by their source, the release's first, then by their places", () => {
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
});
