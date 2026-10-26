import { describe, expect, it } from 'bun:test';

import { Axis } from '#/kernel/constants';

import type { PathRead } from '../preset-file-path.value-object';
import { PathKind, PresetFilePath } from '../preset-file-path.value-object';

describe('PresetFilePath', () => {
  it.each<{
    condition: string;
    path: string;
    read: PathRead;
  }>([
    {
      condition: "it is a reader's axis",
      path: 'biome/foundation.yaml',
      read: {
        presetFile: {
          axis: Axis.Foundation,
          reader: 'biome',
          withs: [],
        },
        kind: PathKind.PresetFile,
      },
    },
    {
      condition: 'it names one block beyond its reader',
      path: 'biome/architecture/with/typescript.yaml',
      read: {
        presetFile: {
          axis: Axis.Architecture,
          reader: 'biome',
          withs: [
            'typescript',
          ],
        },
        kind: PathKind.PresetFile,
      },
    },
    {
      condition: 'it names a block and its seam partner',
      path: 'biome/workflow/with/css/with/browser.yaml',
      read: {
        presetFile: {
          axis: Axis.Workflow,
          reader: 'biome',
          withs: [
            'css',
            'browser',
          ],
        },
        kind: PathKind.PresetFile,
      },
    },
    {
      condition: 'it names three blocks beyond its reader',
      path: 'biome/foundation/with/a/with/b/with/c.yaml',
      read: {
        kind: PathKind.Misplaced,
      },
    },
    {
      condition: 'its axis is none',
      path: 'biome/foundations.yaml',
      read: {
        kind: PathKind.Misplaced,
      },
    },
    {
      condition: 'it lies in presets/ itself',
      path: 'biome.yaml',
      read: {
        kind: PathKind.Misplaced,
      },
    },
    {
      condition: 'its axis holds a folder other than with/',
      path: 'biome/foundation/via/typescript.yaml',
      read: {
        kind: PathKind.Misplaced,
      },
    },
    {
      condition: 'its axis holds a file named with',
      path: 'biome/foundation/with.yaml',
      read: {
        kind: PathKind.Misplaced,
      },
    },
    {
      condition: 'a block of its path holds a file of no with/',
      path: 'biome/foundation/with/css/browser.yaml',
      read: {
        kind: PathKind.Misplaced,
      },
    },
    {
      condition: "it lies in a reader's folder that is no axis",
      path: 'biome/plugins/settings.yaml',
      read: {
        kind: PathKind.Data,
      },
    },
    {
      condition: 'it is a plugin',
      path: 'biome/plugins/typescript/file-within-500-lines.grit',
      read: {
        kind: PathKind.Data,
      },
    },
    {
      condition: 'it holds no YAML below an axis',
      path: 'biome/foundation/with/css',
      read: {
        kind: PathKind.Data,
      },
    },
  ])('should read the path when $condition', ({ path, read }) => {
    // Act
    const found = PresetFilePath.readOf(path);

    // Assert
    expect(found).toStrictEqual(read);
  });

  it('should write the path of a preset file under presets/', () => {
    // Arrange
    const presetFile = {
      axis: Axis.Foundation,
      reader: 'biome',
      withs: [
        'css',
        'browser',
      ],
    };

    // Act
    const text = PresetFilePath.textOf(presetFile);

    // Assert
    expect(text).toBe('biome/foundation/with/css/with/browser.yaml');
  });
});
