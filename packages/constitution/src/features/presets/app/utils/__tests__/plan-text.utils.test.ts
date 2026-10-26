import { describe, expect, it } from 'bun:test';

import { Axis } from '#/kernel/constants';
import { BlockSource, UnitPath } from '#/kernel/value-objects';

import type { PresetEntry, PresetsFinding, PresetsPlan } from '../../../domain/entities';
import { PresetEntry as Entry, PresetsCode, PresetValue } from '../../../domain/entities';
import { TargetFile } from '../../../domain/value-objects';
import { planLinesOf } from '../plan-text.utils';
import { findingLinesOf } from '../presets-findings-report.utils';

const entry: PresetEntry = {
  block: 'biome',
  file: TargetFile.of('biome.json'),
  index: 0,
  language: '*',
  rule: '*',
  set: {
    file: 'presets/biome/foundation.yaml',
    path: {
      axis: Axis.Foundation,
      reader: 'biome',
      withs: [],
    },
    source: BlockSource.create(),
  },
  value: PresetValue.plain(true),
};
const finding: PresetsFinding = {
  code: PresetsCode.FileUnparsed,
  details: {},
  path: 'biome.json',
};

describe('planLinesOf', () => {
  it('should give each file, then the entries it takes under it, then what each unit runs, then the findings', () => {
    // Arrange
    const plan: PresetsPlan = {
      blocks: new Map(),
      files: [
        {
          entries: [
            entry,
          ],
          file: 'biome.json',
          merged: {
            defaults: [],
            problems: [],
          },
          unit: UnitPath.create(''),
        },
      ],
      findings: [
        finding,
      ],
      runs: [
        {
          commands: new Map([
            [
              'check',
              [
                'bun run check',
              ],
            ],
          ]),
          unit: UnitPath.create(''),
        },
        {
          commands: new Map([
            [
              'fix',
              [
                'bun run fix',
                'uv run --locked poe fix',
              ],
            ],
          ]),
          unit: UnitPath.create('packages/kit'),
        },
      ],
    };

    // Act
    const lines = planLinesOf(plan);

    // Assert
    expect(lines).toStrictEqual([
      'biome.json',
      `  ${Entry.sourceOf(entry)}`,
      'run check',
      '  bun run check',
      'packages/kit: run fix',
      '  bun run fix',
      '  uv run --locked poe fix',
      ...findingLinesOf([
        finding,
      ]),
    ]);
  });
});
