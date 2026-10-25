import { describe, expect, it } from 'bun:test';

import { Axis } from '#/kernel/constants';
import type { FindingOf } from '#/kernel/types';
import { RuleSlug } from '#/kernel/value-objects';

import { blockFiles, checkInputOf } from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import type { PresetsDetails } from '../presets';
import { PresetsCode, presetsCheck } from '../presets';

type PresetsFinding = FindingOf<PresetsDetails>;

const findingsOf = (paths: readonly string[]): readonly PresetsFinding[] =>
  presetsCheck(
    checkInputOf({
      ...validFiles(),
      ...blockFiles({
        body: '# CSS\n',
        dir: 'blocks/contexts/languages/css',
        id: 'css',
      }),
      ...Object.fromEntries(
        paths.map((path) => [
          path,
          '{}\n',
        ]),
      ),
    }),
  );

describe('presetsCheck', () => {
  it('should find nothing when every part is named after a block or self and every plugin after a rule of its axis', () => {
    // Arrange
    const paths = [
      'presets/common/biome/foundation/self.jsonc',
      'presets/typescript/biome/foundation/_react.jsonc',
      'presets/typescript/biome/foundation/plugins/hooks-at-top-level.grit',
      'presets/typescript/biome/architecture/plugins/reads-are-cancellable.grit',
      'presets/typescript/biome/architecture/ui.jsonc',
      'presets/typescript/biome/foundation/bindings.yaml',
      'presets/typescript/biome/architecture/bindings.yaml',
      'presets/typescript/biome/workflow/self.config.jsonc',
      'presets/common/biome/foundation/bindings.yaml',
      'presets/css/lingui/foundation/core.jsonc',
      'presets/typescript/join.mjs',
      'presets/common/join.mjs',
      'presets/common/join.js',
      'presets/common/join.ts',
      'presets/common/join.py',
    ];

    // Act
    const findings = findingsOf(paths);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should find nothing when a part sits in one of the several languages its tool covers', () => {
    // Arrange
    const files = {
      ...validFiles(),
      ...blockFiles({
        body: '# CSS\n',
        dir: 'blocks/contexts/languages/css',
        id: 'css',
      }),
      ...blockFiles({
        body: '# Biome\n\n**Biome** checks every `.ts` file.\n',
        dir: 'blocks/implementations/biome',
        id: 'biome',
        languages: [
          'typescript',
          'css',
        ],
        requires: [
          'typescript',
        ],
      }),
      'presets/css/biome/foundation/core.jsonc': '{}\n',
    };

    // Act
    const findings = presetsCheck(checkInputOf(files));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it.each<{
    name: string;
    path: string;
  }>([
    {
      name: "a part sits at its tool folder's root",
      path: 'presets/typescript/biome/core.jsonc',
    },
    {
      name: 'a part sits in a folder that is no axis',
      path: 'presets/typescript/biome/notes/core.jsonc',
    },
    {
      name: 'a part sits in a folder of an axis folder',
      path: 'presets/typescript/biome/architecture/nested/core.jsonc',
    },
    {
      name: 'a part sits in an axis folder of an axis folder',
      path: 'presets/typescript/biome/architecture/workflow/core.jsonc',
    },
    {
      name: 'a part sits in a presets folder of a tool folder',
      path: 'presets/typescript/biome/nested/presets/common/biome/foundation/core.jsonc',
    },
    {
      name: 'a shared module sits in a domain',
      path: 'presets/ui/join.mjs',
    },
    {
      name: 'a shared module sits in a scope that names no block',
      path: 'presets/nowhere/join.mjs',
    },
    {
      name: 'a shared module sits in a presets folder of a tool folder',
      path: 'presets/typescript/biome/presets/common/join.mjs',
    },
    {
      name: 'a folder is named like a shared module',
      path: 'presets/typescript/join.mjs/notes.txt',
    },
    {
      name: 'a shared module is hidden',
      path: 'presets/typescript/.join.mjs',
    },
    {
      name: 'a shared module has no extension',
      path: 'presets/typescript/join',
    },
    {
      name: 'a part is hidden',
      path: 'presets/typescript/biome/foundation/.core.jsonc',
    },
    {
      name: 'a part has an empty extension',
      path: 'presets/typescript/biome/foundation/core.',
    },
    {
      name: 'a folder is named like a part',
      path: 'presets/typescript/biome/foundation/core.jsonc/notes.txt',
    },
    {
      name: "a plugin sits in its tool folder's root plugins folder",
      path: 'presets/typescript/biome/plugins/hooks-at-top-level.grit',
    },
    {
      name: 'a plugin sits in a folder of a tool folder',
      path: 'presets/typescript/biome/x/plugins/hooks-at-top-level.grit',
    },
    {
      name: 'a plugin sits in a folder of its plugins folder',
      path: 'presets/typescript/biome/foundation/plugins/nested/hooks-at-top-level.grit',
    },
    {
      name: 'a folder is named like a plugin',
      path: 'presets/typescript/biome/foundation/plugins/hooks-at-top-level.grit/notes.grit',
    },
    {
      name: 'a GritQL file sits in a folder that is no plugins folder',
      path: 'presets/typescript/biome/x/hooks-at-top-level.grit',
    },
    {
      name: 'a plugin carries a second extension',
      path: 'presets/typescript/biome/foundation/plugins/hooks-at-top-level.grit.bak',
    },
    {
      name: 'a plugin is hidden',
      path: 'presets/typescript/biome/foundation/plugins/.hooks-at-top-level.grit',
    },
    {
      name: 'a plugin is not GritQL',
      path: 'presets/typescript/biome/foundation/plugins/hooks-at-top-level.json',
    },
    {
      name: 'the bindings sit outside a scope folder',
      path: 'presets/biome/bindings.yaml',
    },
    {
      name: "the bindings sit at their tool folder's root",
      path: 'presets/typescript/biome/bindings.yaml',
    },
    {
      name: 'the bindings sit in a folder that is no axis',
      path: 'presets/typescript/biome/notes/bindings.yaml',
    },
    {
      name: 'the bindings sit two folders deep in an axis folder',
      path: 'presets/typescript/biome/architecture/nested/bindings.yaml',
    },
    {
      name: 'a folder is named like the bindings',
      path: 'presets/typescript/biome/foundation/bindings.yaml/notes.txt',
    },
  ])('should report a stray file when $name', ({ path }) => {
    // Arrange
    const paths = [
      path,
    ];

    // Act
    const findings = findingsOf(paths);

    // Assert
    expect(findings).toStrictEqual([
      {
        code: PresetsCode.StrayFile,
        details: {},
        path,
      },
    ]);
  });

  it.each<{
    finding: PresetsFinding;
    name: string;
  }>([
    {
      finding: {
        code: PresetsCode.PartNamesNoBlock,
        details: {
          name: 'bindings',
        },
        path: 'presets/typescript/biome/foundation/bindings.yaml.bak',
      },
      name: 'the bindings carry a second extension',
    },
    {
      finding: {
        code: PresetsCode.ScopeNotCovered,
        details: {
          scope: 'nowhere',
          tool: 'biome',
        },
        path: 'presets/nowhere/biome/architecture/ui.jsonc',
      },
      name: 'a part sits in a scope that names no block',
    },
    {
      finding: {
        code: PresetsCode.ScopeNotCovered,
        details: {
          scope: 'ui',
          tool: 'biome',
        },
        path: 'presets/ui/biome/architecture/typescript.jsonc',
      },
      name: 'a part sits in a scope that is a domain, not a language',
    },
    {
      finding: {
        code: PresetsCode.ScopeNotCovered,
        details: {
          scope: 'css',
          tool: 'biome',
        },
        path: 'presets/css/biome/foundation/core.jsonc',
      },
      name: 'a part sits in a language its tool does not cover',
    },
    {
      finding: {
        code: PresetsCode.ScopeNotCovered,
        details: {
          scope: 'css',
          tool: 'biome',
        },
        path: 'presets/css/biome/foundation/bindings.yaml',
      },
      name: 'the bindings sit in a language their tool does not cover',
    },
    {
      finding: {
        code: PresetsCode.ToolNamesNoBlock,
        details: {
          scope: 'common',
          tool: 'eslint',
        },
        path: 'presets/common/eslint/foundation/bindings.yaml',
      },
      name: 'the bindings of a tool that is no block',
    },
    {
      finding: {
        code: PresetsCode.ScopeNotCovered,
        details: {
          scope: 'ui',
          tool: 'lingui',
        },
        path: 'presets/ui/lingui/foundation/core.jsonc',
      },
      name: 'a part of a tool that covers any language sits in a domain',
    },
    {
      finding: {
        code: PresetsCode.ToolNamesNoBlock,
        details: {
          scope: 'typescript',
          tool: 'eslint',
        },
        path: 'presets/typescript/eslint/foundation/core.mjs',
      },
      name: "a language's folder holds a tool that names no block",
    },
    {
      finding: {
        code: PresetsCode.PartNamesNoBlock,
        details: {
          name: 'react',
        },
        path: 'presets/typescript/biome/foundation/react.jsonc',
      },
      name: 'a part is named after no block',
    },
    {
      finding: {
        code: PresetsCode.PluginNamesNoRule,
        details: {
          rule: 'null-free',
        },
        path: 'presets/typescript/biome/foundation/plugins/null-free.grit',
      },
      name: 'a plugin is named after no rule',
    },
    {
      finding: {
        code: PresetsCode.PluginOffAxis,
        details: {
          axis: Axis.Foundation,
          rule: RuleSlug.create('reads-are-cancellable'),
          ruleAxis: Axis.Architecture,
        },
        path: 'presets/typescript/biome/foundation/plugins/reads-are-cancellable.grit',
      },
      name: 'a plugin of foundation holds a rule of architecture',
    },
    {
      finding: {
        code: PresetsCode.PluginOffAxis,
        details: {
          axis: Axis.Architecture,
          rule: RuleSlug.create('hooks-at-top-level'),
          ruleAxis: Axis.Foundation,
        },
        path: 'presets/typescript/biome/architecture/plugins/hooks-at-top-level.grit',
      },
      name: 'a plugin of architecture holds a rule of foundation',
    },
  ])('should report $finding.code when $name', ({ finding }) => {
    // Arrange
    const paths = [
      finding.path,
    ];

    // Act
    const findings = findingsOf(paths);

    // Assert
    expect(findings).toStrictEqual([
      finding,
    ]);
  });
});
