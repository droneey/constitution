import { describe, expect, it } from 'bun:test';

import { Axis } from '#/kernel/constants';
import { BlockSource } from '#/kernel/value-objects';

import type { Contribution, PresetEntry } from '../../../../../../entities';
import { PresetValue, ValueKind } from '../../../../../../entities';
import { TargetFile } from '../../../../../../value-objects';
import { layOutLines } from '../lay-out-lines.utils';

const entryOf = (input: { file: string; withs: readonly string[] }): PresetEntry => ({
  block: 'git',
  file: TargetFile.of(input.file),
  index: 0,
  language: '*',
  rule: '*',
  set: {
    file: 'presets/git/foundation.yaml',
    path: {
      axis: Axis.Foundation,
      reader: 'git',
      withs: input.withs,
    },
    source: BlockSource.create(undefined),
  },
  value: PresetValue.plain([]),
});

const from = (group: string, given: PresetValue): Contribution => ({
  group,
  source: group,
  value: given,
});

describe('layOutLines', () => {
  it('should gather each line under the first group that gives it, a default aside, and name every group of the path', () => {
    // Arrange
    const written = entryOf({
      file: '.gitignore',
      withs: [
        'vite',
      ],
    });

    // Act
    const layout = layOutLines({
      contributions: [
        from(
          'vite',
          PresetValue.plain([
            'dist/',
            'gone/',
          ]),
        ),
        from('tsc', {
          kind: ValueKind.Replace,
          setting: [
            'dist/',
            '*.tsbuildinfo',
          ],
        }),
        from('starter', {
          kind: ValueKind.Default,
          setting: [
            'notes/',
          ],
        }),
        from('odd', PresetValue.plain('text')),
        from('map', PresetValue.mapOf([])),
      ],
      entries: [
        written,
        entryOf({
          file: '.gitignore',
          withs: [
            'tsc',
          ],
        }),
        entryOf({
          file: '.dockerignore',
          withs: [
            'docker',
          ],
        }),
      ],
      merged: [
        'dist/',
        '*.tsbuildinfo',
        'notes/',
      ],
      written: [
        written,
      ],
    });

    // Assert
    expect(layout).toStrictEqual({
      groups: [
        {
          lines: [
            'dist/',
          ],
          name: 'vite',
        },
        {
          lines: [
            '*.tsbuildinfo',
          ],
          name: 'tsc',
        },
      ],
      names: [
        'vite',
        'tsc',
      ],
    });
  });

  it('should lay out no file that holds no lines', () => {
    // Act
    const layout = layOutLines({
      contributions: [],
      entries: [],
      merged: {},
      written: [],
    });

    // Assert
    expect(layout).toBeUndefined();
  });
});
