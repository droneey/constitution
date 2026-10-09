import { describe, expect, it } from 'bun:test';

import type { Finding } from '#/kernel/types';

import type { Files } from '../../../../../../__tests__/constitution.fixtures';
import { checkInputOf, rule } from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { bindingsCheck } from '../bindings.check';

const BINDINGS = 'presets/typescript/biome/bindings.yaml';
const PART = 'presets/typescript/biome/_react.jsonc';
const HOOKS_BINDING = '_react:\n  hooks-at-top-level: [useHookAtTopLevel]\n';

const presetFiles = (): Files => ({
  [PART]: '{ "useHookAtTopLevel": "error" }\n',
});

const findingsOf = (files: Readonly<Files>): readonly Finding[] =>
  bindingsCheck(
    checkInputOf({
      ...validFiles(),
      ...files,
    }),
  );

describe('bindingsCheck', () => {
  it('should find nothing when no tool block has presets', () => {
    // Arrange
    const files = {};

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should find nothing when a binding holds a rule of its axis by a setting its part spells', () => {
    // Arrange
    const files = {
      ...presetFiles(),
      [BINDINGS]: HOOKS_BINDING,
    };

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it.each([
    {
      bindings: 'presets/typescript/biome/architecture/bindings.yaml',
      name: 'an architecture part holds a rule of architecture',
      part: 'presets/typescript/biome/architecture/remote-data.jsonc',
      yaml: 'remote-data:\n  reads-are-cancellable: [cancel]\n',
    },
    {
      bindings: 'presets/typescript/biome/workflow/bindings.yaml',
      name: 'a workflow part holds a rule of the base',
      part: 'presets/typescript/biome/workflow/ui.yaml',
      yaml: 'ui:\n  four-data-states: [cancel]\n',
    },
  ])('should find nothing when $name', ({ bindings, part, yaml }) => {
    // Arrange
    const files = {
      ...presetFiles(),
      [BINDINGS]: HOOKS_BINDING,
      [bindings]: yaml,
      [part]: 'cancel: on\n',
    };

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it.each([
    {
      message: 'binds "hooks-anywhere", which is not a rule',
      name: 'the rule does not exist',
      yaml: '  hooks-anywhere: [useHookAtTopLevel]\n',
    },
    {
      message: 'binds reads-are-cancellable, a rule of architecture, under the base',
      name: 'the rule sits on another axis',
      yaml: '  reads-are-cancellable: [useHookAtTopLevel]\n',
    },
    {
      message: `binds four-data-states to "noUselessFragments", which ${PART} does not hold`,
      name: 'the part does not spell the setting',
      yaml: '  four-data-states: [noUselessFragments]\n',
    },
  ])('should report the binding when $name', ({ message, yaml }) => {
    // Arrange
    const files = {
      ...presetFiles(),
      [BINDINGS]: `${HOOKS_BINDING}${yaml}`,
    };

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([
      {
        message,
        path: BINDINGS,
      },
    ]);
  });

  it.each([
    {
      message:
        'binds hooks-at-top-level, a rule of _react, to the part ui, which may hold only rules of its block, of the blocks above it, of a seam with it or of its tool',
      name: 'a domain part holds a rule of a library',
      part: 'presets/typescript/biome/ui.jsonc',
      yaml: 'ui:\n  hooks-at-top-level: [useHookAtTopLevel]\n',
    },
    {
      message:
        'binds hooks-at-top-level, a rule of _react, to the part self, which may hold only rules of its block, of the blocks above it, of a seam with it or of its tool',
      name: "the tool's own part holds a rule of a library beside it",
      part: 'presets/typescript/biome/self.jsonc',
      yaml: 'self:\n  hooks-at-top-level: [useHookAtTopLevel]\n',
    },
  ])('should report the binding when $name', ({ message, part, yaml }) => {
    // Arrange
    const files = {
      ...presetFiles(),
      [BINDINGS]: yaml,
      [part]: '{ "useHookAtTopLevel": "error" }\n',
    };

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([
      {
        message,
        path: BINDINGS,
      },
    ]);
  });

  it.each([
    {
      binding: `${HOOKS_BINDING}browser:\n  four-data-states: [useHookAtTopLevel]\n`,
      folder: '',
      name: 'the part of a platform holds a rule of a domain above it',
      part: 'browser',
      scope: 'typescript',
    },
    {
      binding: 'remote-data:\n  optimistic-writes-roll-back: [useHookAtTopLevel]\n',
      folder: 'architecture/',
      name: 'the part of a block holds a rule of its seam with it',
      part: 'remote-data',
      scope: 'common',
    },
    {
      binding: `${HOOKS_BINDING}ui:\n  biome-runs-in-the-check: [useHookAtTopLevel]\n`,
      folder: '',
      name: 'the part of a library holds a rule of the tool itself',
      part: 'ui',
      scope: 'typescript',
    },
    {
      binding: `${HOOKS_BINDING}i18n:\n  no-any: [useHookAtTopLevel]\n`,
      folder: '',
      name: "a part of a language's scope holds a rule of its language",
      part: 'i18n',
      scope: 'typescript',
    },
    {
      binding: 'nowhere:\n  four-data-states: [useHookAtTopLevel]\n',
      folder: '',
      name: 'a part named after no block holds a rule',
      part: 'nowhere',
      scope: 'common',
    },
  ])('should find no binding amiss when $name', ({ binding, folder, part, scope }) => {
    // Arrange
    const files = {
      ...presetFiles(),
      [BINDINGS]: HOOKS_BINDING,
      [`presets/${scope}/biome/${folder}bindings.yaml`]: binding,
      [`presets/${scope}/biome/${folder}${part}.jsonc`]: '{ "useHookAtTopLevel": "error" }\n',
      'blocks/implementations/biome/checks.md': `# Checks\n\n${rule({
        slug: 'biome-runs-in-the-check',
      })}`,
    };

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report the binding when a part of every language holds a rule of a language', () => {
    // Arrange
    const bindings = 'presets/common/biome/bindings.yaml';
    const files = {
      ...presetFiles(),
      [BINDINGS]: HOOKS_BINDING,
      [bindings]: 'i18n:\n  no-any: [useHookAtTopLevel]\n',
      'presets/common/biome/i18n.jsonc': '{ "useHookAtTopLevel": "error" }\n',
    };

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'binds no-any, a rule of typescript, to the part i18n, which may hold only rules of its block, of the blocks above it, of a seam with it or of its tool',
        path: bindings,
      },
    ]);
  });

  it('should report the part as missing when only a stray file, a plugin, another axis, another scope or another tool holds a file of its name', () => {
    // Arrange
    const setting = '{ "useHookAtTopLevel": "error" }\n';
    const files = {
      ...presetFiles(),
      [BINDINGS]: `${HOOKS_BINDING}ui:\n  four-data-states: [useHookAtTopLevel]\n`,
      'presets/common/biome/ui.jsonc': setting,
      'presets/typescript/biome/architecture/ui.jsonc': setting,
      'presets/typescript/biome/notes/ui.jsonc': setting,
      'presets/typescript/biome/plugins/ui.grit': setting,
      'presets/typescript/eslint/ui.jsonc': setting,
    };

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'binds four-data-states to the part ui, which presets/typescript/biome/ does not hold',
        path: BINDINGS,
      },
    ]);
  });
});
