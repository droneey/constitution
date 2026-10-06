import { describe, expect, it } from 'bun:test';

import { Axis } from '#/kernel';

import type { PresetPath } from '../preset-paths.utils';
import { PresetFileKind, presetPathOf } from '../preset-paths.utils';

describe('presetPathOf', () => {
  it.each<{
    expected: PresetPath | undefined;
    name: string;
    path: string;
  }>([
    {
      expected: {
        axis: Axis.Foundation,
        kind: PresetFileKind.Part,
        name: 'core',
        scope: 'typescript',
        tool: 'biome',
      },
      name: "a part at the tool's root",
      path: 'presets/typescript/biome/core.jsonc',
    },
    {
      expected: {
        axis: Axis.Workflow,
        kind: PresetFileKind.Bindings,
        scope: 'common',
        tool: 'lefthook',
      },
      name: 'the bindings of the workflow axis',
      path: 'presets/common/lefthook/workflow/bindings.yaml',
    },
    {
      expected: {
        axis: Axis.Architecture,
        kind: PresetFileKind.Plugin,
        name: 'surface-only-re-exports',
        scope: 'typescript',
        tool: 'biome',
      },
      name: 'a plugin of the architecture axis',
      path: 'presets/typescript/biome/architecture/plugins/surface-only-re-exports.grit',
    },
    {
      expected: undefined,
      name: 'a file outside the presets',
      path: 'templates/typescript/biome/core.jsonc',
    },
  ])('should read $name when the path is $path', ({ expected, path }) => {
    // Arrange
    const input = path;

    // Act
    const read = presetPathOf(input);

    // Assert
    expect(read).toStrictEqual(expected);
  });
});
