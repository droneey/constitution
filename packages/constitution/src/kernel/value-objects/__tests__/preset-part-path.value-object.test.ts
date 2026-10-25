import { describe, expect, it } from 'bun:test';

import { Axis } from '../../constants';
import { PresetFileKind, PresetPartPath } from '../preset-part-path.value-object';

describe('PresetPartPath.parse', () => {
  it.each<{
    expected: object | undefined;
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
      name: 'a part of the foundation axis',
      path: 'presets/typescript/biome/foundation/core.jsonc',
    },
    {
      expected: {
        axis: Axis.Foundation,
        kind: PresetFileKind.Part,
        name: 'core',
        scope: 'typescript',
        tool: 'tsc',
      },
      name: 'a part whose file has two extensions',
      path: 'presets/typescript/tsc/foundation/core.d.ts',
    },
    {
      expected: undefined,
      name: 'a file with no extension',
      path: 'presets/typescript/biome/foundation/core',
    },
    {
      expected: undefined,
      name: 'a hidden file',
      path: 'presets/typescript/biome/foundation/.core.jsonc',
    },
    {
      expected: undefined,
      name: "a part at the tool's root, in no axis folder",
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
        rule: 'surface-only-re-exports',
        scope: 'typescript',
        tool: 'biome',
      },
      name: 'a plugin of the architecture axis',
      path: 'presets/typescript/biome/architecture/plugins/surface-only-re-exports.grit',
    },
    {
      expected: undefined,
      name: 'a plugin with a second extension',
      path: 'presets/typescript/biome/architecture/plugins/surface.only.grit',
    },
    {
      expected: undefined,
      name: 'a part of an empty scope',
      path: 'presets//biome/foundation/core.jsonc',
    },
    {
      expected: undefined,
      name: 'the bindings of an empty tool',
      path: 'presets/typescript//foundation/bindings.yaml',
    },
    {
      expected: undefined,
      name: 'a file outside the presets',
      path: 'templates/typescript/biome/core.jsonc',
    },
    {
      expected: undefined,
      name: 'a file outside the presets, in a folder named like an axis',
      path: 'templates/typescript/biome/foundation/core.jsonc',
    },
    {
      expected: undefined,
      name: 'a plugin in a folder of an axis',
      path: 'presets/typescript/biome/foundation/notes/plugins/surface-only-re-exports.grit',
    },
    {
      expected: undefined,
      name: 'a GritQL rule in a folder that is not plugins/',
      path: 'presets/typescript/biome/foundation/notes/surface-only-re-exports.grit',
    },
  ])('should read $name when the path is $path', ({ expected, path }) => {
    // Act
    // the file a caller reads: its fields, the brand being the compiler's alone
    const read: object | undefined = PresetPartPath.parse(path);

    // Assert
    expect(read).toStrictEqual(expected);
  });

  it.each([
    {
      file: 'core.jsonc',
      name: 'core',
    },
    {
      file: 'core.d.ts',
      name: 'core',
    },
    {
      file: 'core',
      name: 'core',
    },
  ])('should name the part $name when its file is $file', ({ file, name }) => {
    // Act
    const partName = PresetPartPath.partNameOf(file);

    // Assert
    expect(partName).toBe(name);
  });
});

const coreOfBiome = {
  axis: Axis.Foundation,
  kind: PresetFileKind.Part,
  name: 'core',
  scope: 'typescript',
  tool: 'biome',
};
const bindingsOfBiome = {
  axis: Axis.Foundation,
  kind: PresetFileKind.Bindings,
  scope: 'typescript',
  tool: 'biome',
};
const pluginOfBiome = {
  axis: Axis.Architecture,
  kind: PresetFileKind.Plugin,
  rule: 'surface-only-re-exports',
  scope: 'typescript',
  tool: 'biome',
};

const presetOf = (path: string): PresetPartPath => {
  const preset = PresetPartPath.parse(path);

  if (preset === undefined) {
    throw new Error(`${path} is no file of a preset`);
  }

  return preset;
};

describe('PresetPartPath', () => {
  it.each([
    {
      candidate: coreOfBiome,
      condition: 'it is a part',
      isPreset: true,
    },
    {
      candidate: bindingsOfBiome,
      condition: 'it is the bindings of an axis',
      isPreset: true,
    },
    {
      candidate: pluginOfBiome,
      condition: 'it is a plugin',
      isPreset: true,
    },
    {
      candidate: {
        ...coreOfBiome,
        name: '',
      },
      condition: 'it is a part with no name',
      isPreset: false,
    },
    {
      candidate: {
        ...bindingsOfBiome,
        axis: 'sideways',
      },
      condition: 'it is bindings of no axis',
      isPreset: false,
    },
    {
      candidate: {
        ...bindingsOfBiome,
        scope: '',
      },
      condition: 'it is bindings of an empty scope',
      isPreset: false,
    },
    {
      candidate: {
        ...bindingsOfBiome,
        tool: 'bio/me',
      },
      condition: 'it is bindings of a tool that holds a "/"',
      isPreset: false,
    },
    {
      candidate: {
        ...pluginOfBiome,
        tool: '',
      },
      condition: 'it is a plugin of an empty tool',
      isPreset: false,
    },
    {
      candidate: {
        ...pluginOfBiome,
        rule: 'surface.only',
      },
      condition: 'it is a plugin whose rule holds a dot',
      isPreset: false,
    },
    {
      candidate: {
        ...pluginOfBiome,
        rule: 'plugins/surface',
      },
      condition: 'it is a plugin whose rule holds a "/"',
      isPreset: false,
    },
    {
      candidate: {
        ...coreOfBiome,
        kind: 'notes',
      },
      condition: 'it holds a name but its kind is none',
      isPreset: false,
    },
    {
      candidate: {
        ...pluginOfBiome,
        kind: 'notes',
      },
      condition: 'it holds a rule but its kind is none',
      isPreset: false,
    },
  ])('should say $isPreset when $condition', ({ candidate, isPreset }) => {
    // Act
    const answer = PresetPartPath.is(candidate);

    // Assert
    expect(answer).toBe(isPreset);
  });

  it.each([
    {
      condition: 'they are one part',
      isEqual: true,
      left: 'presets/typescript/biome/foundation/core.jsonc',
      right: 'presets/typescript/biome/foundation/core.jsonc',
    },
    {
      condition: 'they are two parts',
      isEqual: false,
      left: 'presets/typescript/biome/foundation/core.jsonc',
      right: 'presets/typescript/biome/foundation/self.jsonc',
    },
    {
      condition: 'they are two plugins',
      isEqual: false,
      left: 'presets/typescript/biome/architecture/plugins/surface-only-re-exports.grit',
      right: 'presets/typescript/biome/architecture/plugins/no-default-export.grit',
    },
    {
      condition: 'one is the bindings and one a part of the same folder',
      isEqual: false,
      left: 'presets/typescript/biome/foundation/bindings.yaml',
      right: 'presets/typescript/biome/foundation/core.jsonc',
    },
  ])('should say $isEqual when $condition', ({ isEqual, left, right }) => {
    // Arrange
    const paths = [
      presetOf(left),
      presetOf(right),
    ] as const;

    // Act
    const isSame = PresetPartPath.equals(...paths);

    // Assert
    expect(isSame).toBe(isEqual);
  });
});
