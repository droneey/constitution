import { describe, expect, it } from 'bun:test';

import { Axis } from '#/kernel/constants';
import type { FindingOf } from '#/kernel/types';
import { BlockId, RuleSlug } from '#/kernel/value-objects';

import type { Files } from '../../../../../../__tests__/constitution.fixtures';
import { checkInputOf, rule } from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import type { BindingsDetails } from '../bindings';
import { BindingsCode, bindingsCheck } from '../bindings';

const BINDINGS = 'presets/typescript/biome/foundation/bindings.yaml';
const PART = 'presets/typescript/biome/foundation/_react.jsonc';
const HOOKS_BINDING = '_react:\n  hooks-at-top-level: [useHookAtTopLevel]\n';

const presetFiles = (): Files => ({
  [PART]: '{ "useHookAtTopLevel": "error" }\n',
});

const findingsOf = (files: Readonly<Files>): readonly FindingOf<BindingsDetails>[] =>
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
      name: 'a workflow part holds a rule of foundation',
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

  it.each<{
    finding: FindingOf<BindingsDetails>;
    name: string;
    yaml: string;
  }>([
    {
      finding: {
        code: BindingsCode.NotRule,
        details: {
          rule: RuleSlug.create('hooks-anywhere'),
        },
        path: BINDINGS,
      },
      name: 'the rule does not exist',
      yaml: '  hooks-anywhere: [useHookAtTopLevel]\n',
    },
    {
      finding: {
        code: BindingsCode.OffAxis,
        details: {
          axis: Axis.Foundation,
          rule: RuleSlug.create('reads-are-cancellable'),
          ruleAxis: Axis.Architecture,
        },
        path: BINDINGS,
      },
      name: 'the rule sits on another axis',
      yaml: '  reads-are-cancellable: [useHookAtTopLevel]\n',
    },
    {
      finding: {
        code: BindingsCode.SettingMissing,
        details: {
          file: PART,
          rule: RuleSlug.create('four-data-states'),
          setting: 'noUselessFragments',
        },
        path: BINDINGS,
      },
      name: 'the part does not spell the setting',
      yaml: '  four-data-states: [noUselessFragments]\n',
    },
  ])('should report the binding when $name', ({ finding, yaml }) => {
    // Arrange
    const files = {
      ...presetFiles(),
      [BINDINGS]: `${HOOKS_BINDING}${yaml}`,
    };

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([
      finding,
    ]);
  });

  it.each([
    {
      name: 'a domain part holds a rule of a library',
      part: 'ui',
      yaml: 'ui:\n  hooks-at-top-level: [useHookAtTopLevel]\n',
    },
    {
      name: "the tool's own part holds a rule of a library beside it",
      part: 'self',
      yaml: 'self:\n  hooks-at-top-level: [useHookAtTopLevel]\n',
    },
  ])('should report the binding out of reach when $name', ({ part, yaml }) => {
    // Arrange
    const files = {
      ...presetFiles(),
      [BINDINGS]: yaml,
      [`presets/typescript/biome/foundation/${part}.jsonc`]: '{ "useHookAtTopLevel": "error" }\n',
    };

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([
      {
        code: BindingsCode.OutOfReach,
        details: {
          part,
          rule: RuleSlug.create('hooks-at-top-level'),
          ruleBlock: BlockId.create('_react'),
        },
        path: BINDINGS,
      },
    ]);
  });

  it.each([
    {
      binding: `${HOOKS_BINDING}browser:\n  four-data-states: [useHookAtTopLevel]\n`,
      folder: 'foundation/',
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
      folder: 'foundation/',
      name: 'the part of a library holds a rule of the tool itself',
      part: 'ui',
      scope: 'typescript',
    },
    {
      binding: `${HOOKS_BINDING}i18n:\n  any-never-typed: [useHookAtTopLevel]\n`,
      folder: 'foundation/',
      name: "a part of a language's scope holds a rule of its language",
      part: 'i18n',
      scope: 'typescript',
    },
    {
      binding: 'nowhere:\n  four-data-states: [useHookAtTopLevel]\n',
      folder: 'foundation/',
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
      'blocks/implementations/biome/foundation/checks.md': `# Checks\n\n${rule({
        slug: 'biome-runs-in-the-check',
      })}`,
    };

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report the binding when the part is named after a block other than the seam of its rule and unable to refer to the rule block', () => {
    // Arrange
    const bindings = 'presets/common/biome/architecture/bindings.yaml';
    const files = {
      ...presetFiles(),
      [bindings]: 'i18n:\n  optimistic-writes-roll-back: [useHookAtTopLevel]\n',
      'presets/common/biome/architecture/i18n.jsonc': '{ "useHookAtTopLevel": "error" }\n',
    };

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([
      {
        code: BindingsCode.OutOfReach,
        details: {
          part: 'i18n',
          rule: RuleSlug.create('optimistic-writes-roll-back'),
          ruleBlock: BlockId.create('ui'),
        },
        path: bindings,
      },
    ]);
  });

  it('should report the binding when a part of every language holds a rule of a language', () => {
    // Arrange
    const bindings = 'presets/common/biome/foundation/bindings.yaml';
    const files = {
      ...presetFiles(),
      [BINDINGS]: HOOKS_BINDING,
      [bindings]: 'i18n:\n  any-never-typed: [useHookAtTopLevel]\n',
      'presets/common/biome/foundation/i18n.jsonc': '{ "useHookAtTopLevel": "error" }\n',
    };

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([
      {
        code: BindingsCode.OutOfReach,
        details: {
          part: 'i18n',
          rule: RuleSlug.create('any-never-typed'),
          ruleBlock: BlockId.create('typescript'),
        },
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
      'presets/common/biome/foundation/ui.jsonc': setting,
      'presets/typescript/biome/architecture/ui.jsonc': setting,
      'presets/typescript/biome/notes/ui.jsonc': setting,
      'presets/typescript/biome/ui.jsonc': setting,
      'presets/typescript/biome/foundation/plugins/ui.grit': setting,
      'presets/typescript/eslint/foundation/ui.jsonc': setting,
    };

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([
      {
        code: BindingsCode.PartMissing,
        details: {
          axis: Axis.Foundation,
          part: 'ui',
          rule: RuleSlug.create('four-data-states'),
          scope: 'typescript',
          tool: 'biome',
        },
        path: BINDINGS,
      },
    ]);
  });
});
