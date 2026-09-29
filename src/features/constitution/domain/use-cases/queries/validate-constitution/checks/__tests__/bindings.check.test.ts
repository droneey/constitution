import { describe, expect, it } from 'bun:test';

import type { Finding } from '#/kernel';

import type { Files } from '../../../../../../__tests__/constitution.fixtures';
import {
  checkInputOf,
  rule,
} from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { bindingsCheck } from '../bindings.check';

const BINDINGS = 'presets/biome/bindings.yaml';
const HOOKS = 'blocks/implementations/_react/foundation/hooks.md';
const PART = 'presets/biome/foundation/_react.jsonc';
const UNHELD =
  'says a tool holds hooks-at-top-level (tool — lint), but no binding holds it, nor a rule that carries it out';
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
          check: 'tool — lint',
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
        check: 'tool — lint',
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
      part: 'presets/biome/architecture/remote-data.jsonc',
      yaml: 'architecture:\n  remote-data:\n    reads-are-cancellable: [cancel]\n',
    },
    {
      name: 'a workflow part holds a rule of foundation',
      part: 'presets/biome/workflow/ui.yaml',
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
        'binds hooks-at-top-level, a rule of _react, to the part ui, which may hold only rules of its block, of the blocks above it or of a seam with it',
      name: 'a domain part holds a rule of a library',
      part: 'presets/biome/foundation/ui.jsonc',
      yaml: 'foundation:\n  ui:\n    hooks-at-top-level: [useHookAtTopLevel]\n',
    },
    {
      message:
        'binds hooks-at-top-level, a rule of _react, to the part self, which may hold only rules of its block, of the blocks above it or of a seam with it',
      name: "the tool's own part holds a rule of a library beside it",
      part: 'presets/biome/foundation/self.jsonc',
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
      slug: 'four-data-states',
    },
    {
      name: 'the part of a block holds a rule of its seam with it',
      part: 'remote-data',
      slug: 'optimistic-writes-roll-back',
    },
    {
      name: 'a part named after no block holds a rule',
      part: 'nowhere',
      slug: 'four-data-states',
    },
  ])('should find no binding amiss when $name', ({ part, slug }) => {
    // Arrange
    const axis =
      slug === 'optimistic-writes-roll-back' ? 'architecture' : 'foundation';
    const files = {
      ...presetFiles(),
      [BINDINGS]: `${HOOKS_BINDING}${axis === 'foundation' ? '' : `${axis}:\n`}  ${part}:\n    ${slug}: [useHookAtTopLevel]\n`,
      [`presets/biome/${axis}/${part}.jsonc`]:
        '{ "useHookAtTopLevel": "error" }\n',
    };

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report the part as missing when only a stray file, a plugin, another axis or another tool holds a file of its name', () => {
    // Arrange
    const setting = '{ "useHookAtTopLevel": "error" }\n';
    const files = {
      ...presetFiles(),
      [BINDINGS]: `${HOOKS_BINDING}  ui:\n    four-data-states: [useHookAtTopLevel]\n`,
      'presets/biome/architecture/ui.jsonc': setting,
      'presets/biome/foundation/plugins/ui.grit': setting,
      'presets/biome/stray.txt': setting,
      'presets/eslint/foundation/ui.jsonc': setting,
    };

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'binds four-data-states to the part ui, which presets/biome/foundation/ does not hold',
        path: BINDINGS,
      },
    ]);
  });
});
