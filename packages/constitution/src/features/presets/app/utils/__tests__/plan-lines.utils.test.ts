import { describe, expect, it } from 'bun:test';

import { goldenFileText, goldenOf } from '#/__tests__/golden.fixtures';
import { Axis } from '#/kernel/constants';
import { BlockId, BlockSource, RepositoryRelativePath, UnitPath } from '#/kernel/value-objects';

import { EVERY } from '../../../domain/constants';
import type { PresetEntry, PresetsPlan } from '../../../domain/entities';
import { EntryPoint, PresetsCode, PresetValue } from '../../../domain/entities';
import { EntryTarget } from '../../../domain/value-objects';
import { planLinesOf } from '../plan-lines.utils';

const entry: PresetEntry = {
  ...EntryTarget.of('biome.json'),
  block: BlockId.create('biome'),
  index: 0,
  language: EVERY,
  rule: EVERY,
  set: {
    filePath: RepositoryRelativePath.create('presets/biome/foundation.yaml'),
    placeInPresets: {
      axis: Axis.Foundation,
      reader: BlockId.create('biome'),
      withs: [],
    },
    source: BlockSource.create(),
  },
  value: PresetValue.plain(true),
};

// A file with its entry, the runs of the root and of a member, and a finding.
const plan: PresetsPlan = {
  blockIds: new Map(),
  files: [
    {
      entries: [
        entry,
      ],
      filePath: RepositoryRelativePath.create('biome.json'),
      merged: {
        defaults: [],
        problems: [],
      },
      unitPath: UnitPath.create(''),
    },
  ],
  findings: [
    {
      code: PresetsCode.FileUnparsed,
      details: {},
      path: 'biome.json',
    },
  ],
  runs: [
    {
      commands: new Map([
        [
          EntryPoint.Check,
          [
            'bun run check',
          ],
        ],
      ]),
      unitPath: UnitPath.create(''),
    },
    {
      commands: new Map([
        [
          EntryPoint.Fix,
          [
            'bun run fix',
            'uv run --locked poe fix',
          ],
        ],
      ]),
      unitPath: UnitPath.create('packages/kit'),
    },
  ],
};

describe('planLinesOf', () => {
  it('should list each file over its entries, then what each unit runs, then the findings, as the golden file shows them', async () => {
    // Act
    const golden = goldenOf({
      plan: planLinesOf(plan).join('\n'),
    });

    // Assert
    expect(golden).toBe(
      await goldenFileText(new URL('plan-lines.golden.txt', import.meta.url), golden),
    );
  });
});
