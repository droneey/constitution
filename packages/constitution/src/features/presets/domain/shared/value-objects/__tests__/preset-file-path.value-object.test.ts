import { describe, expect, it } from 'bun:test';

import fc from 'fast-check';

import { Axis } from '#/kernel/constants';
import { BlockId } from '#/kernel/value-objects';

import type { PathRead } from '../preset-file-path.value-object';
import { PathKind, PresetFilePath } from '../preset-file-path.value-object';

const pathsInPresets = fc.oneof(
  fc
    .array(
      fc.constantFrom(
        'biome',
        'Biome',
        'foundation',
        'workflow',
        'with',
        'css',
        'foundation.yaml',
        'css.yaml',
        '@foundation',
        '@architecture.yaml',
        'js-runtime',
        '',
      ),
      {
        maxLength: 7,
      },
    )
    .map((segments) => segments.join('/')),
  fc.string(),
);

const isReadBack = (path: string): boolean => {
  const read = PresetFilePath.readOf(path);

  return read.kind !== PathKind.PresetFile || PresetFilePath.textOf(read.presetFile) === path;
};

describe('PresetFilePath', () => {
  it.each<{
    condition: string;
    path: string;
    read: PathRead;
  }>([
    {
      condition: "it is a reader's axis",
      path: 'biome/@foundation.yaml',
      read: {
        presetFile: {
          axis: Axis.Foundation,
          reader: BlockId.create('biome'),
          withs: [],
        },
        kind: PathKind.PresetFile,
      },
    },
    {
      condition: 'it names one block beyond its reader',
      path: 'biome/@architecture/with/typescript.yaml',
      read: {
        presetFile: {
          axis: Axis.Architecture,
          reader: BlockId.create('biome'),
          withs: [
            BlockId.create('typescript'),
          ],
        },
        kind: PathKind.PresetFile,
      },
    },
    {
      condition: 'it names a block and its seam partner',
      path: 'biome/@workflow/with/css/with/browser.yaml',
      read: {
        presetFile: {
          axis: Axis.Workflow,
          reader: BlockId.create('biome'),
          withs: [
            BlockId.create('css'),
            BlockId.create('browser'),
          ],
        },
        kind: PathKind.PresetFile,
      },
    },
    {
      condition: 'it is the axis of a reader whose id is a path',
      path: 'js-runtime/bun/@foundation.yaml',
      read: {
        presetFile: {
          axis: Axis.Foundation,
          reader: BlockId.create('js-runtime/bun'),
          withs: [],
        },
        kind: PathKind.PresetFile,
      },
    },
    {
      condition: 'its chain names partners whose ids are paths',
      path: 'js-runtime/bun/@foundation/with/react/react-dom/with/presentation.yaml',
      read: {
        presetFile: {
          axis: Axis.Foundation,
          reader: BlockId.create('js-runtime/bun'),
          withs: [
            BlockId.create('react/react-dom'),
            BlockId.create('presentation'),
          ],
        },
        kind: PathKind.PresetFile,
      },
    },
    {
      condition: 'its chain names a partner of three segments',
      path: 'biome/@architecture/with/react/react-native/expo.yaml',
      read: {
        presetFile: {
          axis: Axis.Architecture,
          reader: BlockId.create('biome'),
          withs: [
            BlockId.create('react/react-native/expo'),
          ],
        },
        kind: PathKind.PresetFile,
      },
    },
    {
      condition: 'its reader is core',
      path: 'core/@workflow.yaml',
      read: {
        presetFile: {
          axis: Axis.Workflow,
          reader: BlockId.create('core'),
          withs: [],
        },
        kind: PathKind.PresetFile,
      },
    },
    {
      condition: 'its marked axis is none',
      path: 'biome/@foundations.yaml',
      read: {
        kind: PathKind.Misplaced,
      },
    },
    {
      condition: 'its marked axis lies in presets/ itself',
      path: '@foundation.yaml',
      read: {
        kind: PathKind.Misplaced,
      },
    },
    {
      condition: 'its marked axis holds a file of no with/',
      path: 'biome/@foundation/typescript.yaml',
      read: {
        kind: PathKind.Misplaced,
      },
    },
    {
      condition: 'its chain names a partner of no segment',
      path: 'biome/@foundation/with/with/css.yaml',
      read: {
        kind: PathKind.Misplaced,
      },
    },
    {
      condition: 'its chain names three partners',
      path: 'biome/@foundation/with/a/b/with/c/with/d.yaml',
      read: {
        kind: PathKind.Misplaced,
      },
    },
    {
      condition: 'its reader path is spelled as no block is',
      path: 'js-runtime/Bun/@foundation.yaml',
      read: {
        kind: PathKind.Misplaced,
      },
    },
    {
      condition: 'it lies in a folder of a reader path that is no axis',
      path: 'js-runtime/bun/plugins/settings.yaml',
      read: {
        kind: PathKind.Data,
      },
    },
    {
      condition: 'its marked axis holds a folder other than with/',
      path: 'biome/@foundation/via/typescript.yaml',
      read: {
        kind: PathKind.Misplaced,
      },
    },
    {
      condition: 'its marked axis holds a file named with',
      path: 'biome/@foundation/with.yaml',
      read: {
        kind: PathKind.Misplaced,
      },
    },
    {
      condition: 'a block it names beyond its reader is spelled as no block is',
      path: 'biome/@foundation/with/css/with/Browser.yaml',
      read: {
        kind: PathKind.Misplaced,
      },
    },
    {
      condition: 'its axis is spelled without its mark',
      path: 'biome/foundation.yaml',
      read: {
        kind: PathKind.Misplaced,
      },
    },
    {
      condition: 'it holds no YAML below a marked axis',
      path: 'biome/@foundation/with/css',
      read: {
        kind: PathKind.Data,
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
  ])('should read the path when $condition', ({ path, read }) => {
    // Act
    const found = PresetFilePath.readOf(path);

    // Assert
    expect(found).toStrictEqual(read);
  });

  it('should read any path as data, misplaced, or a preset file it writes back', () => {
    // Act
    const run = fc.check(fc.property(pathsInPresets, isReadBack));

    // Assert
    expect(run.counterexample).toBeNull();
  });

  it('should write the path of a preset file under presets/', () => {
    // Arrange
    const presetFile = {
      axis: Axis.Architecture,
      reader: BlockId.create('task-runner/poe'),
      withs: [
        BlockId.create('react/react-dom'),
        BlockId.create('client/browser'),
      ],
    };

    // Act
    const text = PresetFilePath.textOf(presetFile);

    // Assert
    expect(text).toBe(
      'task-runner/poe/@architecture/with/react/react-dom/with/client/browser.yaml',
    );
  });
});
