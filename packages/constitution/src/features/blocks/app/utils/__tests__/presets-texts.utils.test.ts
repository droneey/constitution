import { describe, expect, it } from 'bun:test';

import { Axis } from '#/kernel/constants';
import { BlockId, RuleSlug } from '#/kernel/value-objects';

import type { BlockFinding } from '../../../domain/use-cases/queries/check';
import {
  BindingsCode,
  PluginCode,
  PresetsCode,
  TemplatesCode,
} from '../../../domain/use-cases/queries/check';
import { findingTextOf } from '../finding-text.utils';

const PATH = '.claude-plugin/plugin.json';

describe('presetsTexts', () => {
  it.each<{
    finding: BlockFinding;
    text: string;
  }>([
    {
      finding: {
        code: PluginCode.ManifestMissing,
        details: {},
        path: PATH,
      },
      text: 'is missing; the Constitution ships as a plugin and needs its manifest',
    },
    {
      finding: {
        code: PluginCode.MarketplaceMissing,
        details: {},
        path: PATH,
      },
      text: 'is missing; the Constitution ships as a plugin and needs its marketplace',
    },
    {
      finding: {
        code: PluginCode.NotJson,
        details: {
          reason: "JSON Parse error: Expected '}'",
        },
        path: PATH,
      },
      text: "is not valid JSON: JSON Parse error: Expected '}'",
    },
    {
      finding: {
        code: PluginCode.OffSchema,
        details: {
          field: '',
          reason: 'Invalid input: expected object, received array',
        },
        path: PATH,
      },
      text: 'does not match its schema: <root>: Invalid input: expected object, received array',
    },
    {
      finding: {
        code: PluginCode.OffSchema,
        details: {
          field: 'plugins',
          reason: 'Too small: expected array to have >=1 items',
        },
        path: PATH,
      },
      text: 'does not match its schema: plugins: Too small: expected array to have >=1 items',
    },
    {
      finding: {
        code: PluginCode.SkillsDirectoryEmpty,
        details: {
          directory: 'skills/',
        },
        path: PATH,
      },
      text: 'lists the skills directory "./skills/", which holds no <skill>/SKILL.md',
    },
    {
      finding: {
        code: PluginCode.SkillsDirectoryUnlisted,
        details: {
          directory: 'tools/skills/',
        },
        path: PATH,
      },
      text: 'does not list "./tools/skills/", which holds skills',
    },
    {
      finding: {
        code: PluginCode.SkillWithoutFile,
        details: {},
        path: PATH,
      },
      text: 'holds no SKILL.md; a skill is a folder with SKILL.md in it',
    },
    {
      finding: {
        code: PluginCode.SkillWithoutFrontMatter,
        details: {},
        path: PATH,
      },
      text: 'has no front matter; a skill names itself and says when to use it there',
    },
    {
      finding: {
        code: PluginCode.SkillFrontMatterNotYaml,
        details: {
          reason: 'Nested mappings are not allowed in compact mappings',
        },
        path: PATH,
      },
      text: 'front matter is not valid YAML: Nested mappings are not allowed in compact mappings',
    },
    {
      finding: {
        code: PluginCode.SkillFieldMissing,
        details: {
          field: 'name',
        },
        path: PATH,
      },
      text: 'front matter lacks "name"; a skill declares its name and description',
    },
    {
      finding: {
        code: PluginCode.AgentWithoutFrontMatter,
        details: {},
        path: PATH,
      },
      text: 'has no front matter; an agent names itself and says when to use it there',
    },
    {
      finding: {
        code: PluginCode.AgentFrontMatterNotYaml,
        details: {
          reason: 'Implicit keys need to be on a single line',
        },
        path: PATH,
      },
      text: 'front matter is not valid YAML: Implicit keys need to be on a single line',
    },
    {
      finding: {
        code: PluginCode.AgentFieldMissing,
        details: {
          field: 'description',
        },
        path: PATH,
      },
      text: 'front matter lacks "description"; an agent declares its name and description',
    },
    {
      finding: {
        code: PluginCode.AgentNameMismatch,
        details: {
          file: 'reviewer',
          name: 'critic',
        },
        path: PATH,
      },
      text: 'is named "critic" in its front matter; an agent is named after its file, reviewer',
    },
    {
      finding: {
        code: PluginCode.TemplateMissing,
        details: {},
        path: PATH,
      },
      text: 'is missing; /ratify writes a project from the templates',
    },
    {
      finding: {
        code: PluginCode.MarketplaceOmitsPlugin,
        details: {
          plugin: 'constitution',
          repo: 'droneey/constitution',
        },
        path: PATH,
      },
      text: 'does not list the plugin "constitution" from the GitHub repository its manifest names (droneey/constitution), at a release tag v<major>.<minor>.<patch> and from the folder that holds its manifest',
    },
    {
      finding: {
        code: PluginCode.MarketplaceOmitsPlugin,
        details: {
          plugin: undefined,
          repo: undefined,
        },
        path: PATH,
      },
      text: 'does not list the plugin "" from the GitHub repository its manifest names (none), at a release tag v<major>.<minor>.<patch> and from the folder that holds its manifest',
    },
    {
      finding: {
        code: PluginCode.HookFileMissing,
        details: {
          file: 'hooks/session-start.sh',
        },
        path: PATH,
      },
      text: 'runs "hooks/session-start.sh", which is missing',
    },
    {
      finding: {
        code: PresetsCode.StrayFile,
        details: {},
        path: PATH,
      },
      text: 'is not a part of a preset: presets/<scope>/<tool>/<axis>/<block>.<extension>, presets/<scope>/<tool>/<axis>/plugins/<rule>.grit, presets/<scope>/<tool>/<axis>/bindings.yaml, the axis foundation, architecture or workflow, or a module the configurations of a scope share, presets/<scope>/<name>.<extension>',
    },
    {
      finding: {
        code: PresetsCode.ToolNamesNoBlock,
        details: {
          scope: 'typescript',
          tool: 'eslint',
        },
        path: PATH,
      },
      text: 'is in presets/typescript/eslint/, which names no block',
    },
    {
      finding: {
        code: PresetsCode.ScopeNotCovered,
        details: {
          scope: 'css',
          tool: 'biome',
        },
        path: PATH,
      },
      text: 'is in presets/css/, which is neither common nor a language biome covers',
    },
    {
      finding: {
        code: PresetsCode.PartNamesNoBlock,
        details: {
          name: 'react',
        },
        path: PATH,
      },
      text: 'is named "react", which is neither a block nor self',
    },
    {
      finding: {
        code: PresetsCode.PluginNamesNoRule,
        details: {
          rule: 'null-free',
        },
        path: PATH,
      },
      text: 'is named "null-free", which is not a rule; a plugin is named after the rule it holds',
    },
    {
      finding: {
        code: PresetsCode.PluginOffAxis,
        details: {
          axis: Axis.Foundation,
          rule: RuleSlug.create('reads-are-cancellable'),
          ruleAxis: Axis.Architecture,
        },
        path: PATH,
      },
      text: 'holds reads-are-cancellable, a rule of architecture, in foundation/plugins/',
    },
    {
      finding: {
        code: BindingsCode.NotRule,
        details: {
          rule: RuleSlug.create('hooks-anywhere'),
        },
        path: PATH,
      },
      text: 'binds "hooks-anywhere", which is not a rule',
    },
    {
      finding: {
        code: BindingsCode.OffAxis,
        details: {
          axis: Axis.Foundation,
          rule: RuleSlug.create('reads-are-cancellable'),
          ruleAxis: Axis.Architecture,
        },
        path: PATH,
      },
      text: 'binds reads-are-cancellable, a rule of architecture, under foundation',
    },
    {
      finding: {
        code: BindingsCode.OutOfReach,
        details: {
          part: 'ui',
          rule: RuleSlug.create('hooks-at-top-level'),
          ruleBlock: BlockId.create('_react'),
        },
        path: PATH,
      },
      text: 'binds hooks-at-top-level, a rule of _react, to the part ui, which may hold only rules of its block, of the blocks above it, of a seam with it or of its tool',
    },
    {
      finding: {
        code: BindingsCode.PartMissing,
        details: {
          axis: Axis.Architecture,
          part: 'ui',
          rule: RuleSlug.create('four-data-states'),
          scope: 'typescript',
          tool: 'biome',
        },
        path: PATH,
      },
      text: 'binds four-data-states to the part ui, which presets/typescript/biome/architecture/ does not hold',
    },
    {
      finding: {
        code: BindingsCode.SettingMissing,
        details: {
          file: 'presets/typescript/biome/foundation/_react.jsonc',
          rule: RuleSlug.create('four-data-states'),
          setting: 'noUselessFragments',
        },
        path: PATH,
      },
      text: 'binds four-data-states to "noUselessFragments", which presets/typescript/biome/foundation/_react.jsonc does not hold',
    },
    {
      finding: {
        code: TemplatesCode.StrayFile,
        details: {},
        path: PATH,
      },
      text: 'is not a fragment of a block: templates/project/<scope>/<block>/<path>, the scope common or a language',
    },
    {
      finding: {
        code: TemplatesCode.ToolWithoutTemplate,
        details: {
          scope: 'typescript',
          tool: 'biome',
        },
        path: PATH,
      },
      text: 'has parts and no template in templates/project/typescript/biome/ that takes them by <parts>',
    },
    {
      finding: {
        code: TemplatesCode.NamesNoBlock,
        details: {
          scope: 'common',
          tool: 'nowhere',
        },
        path: PATH,
      },
      text: 'is in templates/project/common/nowhere/, which names no block; a template is a fragment its block owns',
    },
    {
      finding: {
        code: TemplatesCode.ScopeNotCovered,
        details: {
          scope: 'biome',
        },
        path: PATH,
      },
      text: 'is in templates/project/biome/, which is neither common nor a language',
    },
  ])('should say $finding.code as the report words it', ({ finding, text }) => {
    // Arrange
    const reported = finding;

    // Act
    const said = findingTextOf(reported);

    // Assert
    expect(said).toBe(text);
  });
});
