import { describe, expect, it } from 'bun:test';

import type { Finding } from '#/kernel';

import type { Files } from '../../../../../../__tests__/constitution.fixtures';
import {
  checkInputOf,
  rule,
} from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { bindingsCheck } from '../bindings.check';

const BINDINGS = 'presets/typescript/biome/bindings.yaml';
const HOOKS = 'blocks/implementations/_react/foundation/hooks.md';
const PART = 'presets/typescript/biome/foundation/_react.jsonc';
const UNHELD =
  'says a tool holds hooks-at-top-level (tool/lint), but no binding holds it, nor a rule that carries it out';
const HOOKS_BINDING =
  'foundation:\n  _react:\n    hooks-at-top-level: [useHookAtTopLevel]\n';

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

  it('should report the rule when a tool with presets checks its role and nothing binds it', () => {
    // Arrange
    const files = presetFiles();

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: UNHELD,
        path: HOOKS,
      },
    ]);
  });

  it('should find nothing when the rule under it with the same check is bound', () => {
    // Arrange
    const files = {
      ...presetFiles(),
      [BINDINGS]:
        'foundation:\n  _react:\n    hooks-in-components: [useHookAtTopLevel]\n',
      'blocks/implementations/_react/foundation/components.md': `# Components\n\n${rule(
        {
          check: 'tool/lint',
          parent: 'hooks-at-top-level',
          slug: 'hooks-in-components',
        },
      )}`,
    };

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report the rule when the rule under it is bound but reviewed', () => {
    // Arrange
    const files = {
      ...presetFiles(),
      [BINDINGS]:
        'foundation:\n  _react:\n    hooks-in-components: [useHookAtTopLevel]\n',
      'blocks/implementations/_react/foundation/components.md': `# Components\n\n${rule(
        {
          parent: 'hooks-at-top-level',
          slug: 'hooks-in-components',
        },
      )}`,
    };

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: UNHELD,
        path: HOOKS,
      },
    ]);
  });

  it('should find nothing unbound when the rule belongs to the tool block that checks its role', () => {
    // Arrange
    const files = {
      ...presetFiles(),
      [BINDINGS]: HOOKS_BINDING,
      'blocks/implementations/biome/foundation/biome.md': `# Biome\n\n${rule({
        check: 'tool/lint',
        slug: 'biome-runs-in-the-check',
      })}`,
    };

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it.each([
    {
      name: 'an architecture part holds a rule of architecture',
      part: 'presets/typescript/biome/architecture/remote-data.jsonc',
      yaml: 'architecture:\n  remote-data:\n    reads-are-cancellable: [cancel]\n',
    },
    {
      name: 'a workflow part holds a rule of foundation',
      part: 'presets/typescript/biome/workflow/ui.yaml',
      yaml: 'workflow:\n  ui:\n    four-data-states: [cancel]\n',
    },
  ])('should find nothing when $name', ({ part, yaml }) => {
    // Arrange
    const files = {
      ...presetFiles(),
      [BINDINGS]: `${HOOKS_BINDING}${yaml}`,
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
      yaml: '    hooks-anywhere: [useHookAtTopLevel]\n',
    },
    {
      message:
        'binds reads-are-cancellable, a rule of architecture, under foundation',
      name: 'the rule sits on another axis',
      yaml: '    reads-are-cancellable: [useHookAtTopLevel]\n',
    },
    {
      message: `binds four-data-states to "noUselessFragments", which ${PART} does not hold`,
      name: 'the part does not spell the setting',
      yaml: '    four-data-states: [noUselessFragments]\n',
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
      part: 'presets/typescript/biome/foundation/ui.jsonc',
      yaml: 'foundation:\n  ui:\n    hooks-at-top-level: [useHookAtTopLevel]\n',
    },
    {
      message:
        'binds hooks-at-top-level, a rule of _react, to the part self, which may hold only rules of its block, of the blocks above it, of a seam with it or of its tool',
      name: "the tool's own part holds a rule of a library beside it",
      part: 'presets/typescript/biome/foundation/self.jsonc',
      yaml: 'foundation:\n  self:\n    hooks-at-top-level: [useHookAtTopLevel]\n',
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
      name: 'the part of a platform holds a rule of a domain above it',
      part: 'browser',
      scope: 'typescript',
      slug: 'four-data-states',
    },
    {
      name: 'the part of a block holds a rule of its seam with it',
      part: 'remote-data',
      scope: 'common',
      slug: 'optimistic-writes-roll-back',
    },
    {
      name: 'the part of a library holds a rule of the tool itself',
      part: 'ui',
      scope: 'typescript',
      slug: 'biome-runs-in-the-check',
    },
    {
      name: 'a part of every language holds a rule of its block',
      part: 'ui',
      scope: 'common',
      slug: 'four-data-states',
    },
    {
      name: "a part of a language's scope holds a rule of its language",
      part: 'i18n',
      scope: 'typescript',
      slug: 'no-any',
    },
    {
      name: "the tool's own part holds a rule of a domain above the tool",
      part: 'self',
      scope: 'common',
      slug: 'four-data-states',
    },
    {
      name: 'a part named after no block holds a rule',
      part: 'nowhere',
      scope: 'common',
      slug: 'four-data-states',
    },
  ])('should find no binding amiss when $name', ({ part, scope, slug }) => {
    // Arrange
    const axis =
      slug === 'optimistic-writes-roll-back' ? 'architecture' : 'foundation';
    const files = {
      ...presetFiles(),
      [BINDINGS]: HOOKS_BINDING,
      [`presets/${scope}/biome/bindings.yaml`]: `${scope === 'typescript' ? HOOKS_BINDING : ''}${axis === 'foundation' && scope === 'typescript' ? '' : `${axis}:\n`}  ${part}:\n    ${slug}: [useHookAtTopLevel]\n`,
      [`presets/${scope}/biome/${axis}/${part}.jsonc`]:
        '{ "useHookAtTopLevel": "error" }\n',
      'blocks/implementations/biome/foundation/biome.md': `# Biome\n\n${rule({
        check: 'tool/lint',
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
      [bindings]: 'foundation:\n  i18n:\n    no-any: [useHookAtTopLevel]\n',
      'presets/common/biome/foundation/i18n.jsonc':
        '{ "useHookAtTopLevel": "error" }\n',
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
      [BINDINGS]: `${HOOKS_BINDING}  ui:\n    four-data-states: [useHookAtTopLevel]\n`,
      'presets/common/biome/foundation/ui.jsonc': setting,
      'presets/typescript/biome/architecture/ui.jsonc': setting,
      'presets/typescript/biome/foundation/plugins/ui.grit': setting,
      'presets/typescript/biome/stray.txt': setting,
      'presets/typescript/eslint/foundation/ui.jsonc': setting,
    };

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'binds four-data-states to the part ui, which presets/typescript/biome/foundation/ does not hold',
        path: BINDINGS,
      },
    ]);
  });
});
