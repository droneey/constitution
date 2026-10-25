import { describe, expect, it } from 'bun:test';

import { Axis } from '#/kernel/constants';
import type { ProblemOf } from '#/kernel/types';
import { BlockId, RuleSlug } from '#/kernel/value-objects';
import { textOf } from '#/shared/cli';

import { SkillField } from '../../../domain/entities';
import type {
  BindingsDetails,
  PluginDetails,
  PresetsDetails,
  TemplatesDetails,
} from '../../../domain/use-cases/queries/check';
import {
  BindingsCode,
  PluginCode,
  PresetsCode,
  TemplatesCode,
} from '../../../domain/use-cases/queries/check';
import { presetsTexts } from '../presets-texts.utils';

describe('presetsTexts', () => {
  it.each<{
    problem: ProblemOf<BindingsDetails & PluginDetails & PresetsDetails & TemplatesDetails>;
    text: string;
  }>([
    {
      problem: {
        code: PluginCode.ManifestMissing,
        details: {},
      },
      text: 'is missing; the Constitution ships as a plugin and needs its manifest',
    },
    {
      problem: {
        code: PluginCode.MarketplaceMissing,
        details: {},
      },
      text: 'is missing; the Constitution ships as a plugin and needs its marketplace',
    },
    {
      problem: {
        code: PluginCode.NotJson,
        details: {
          reason: "JSON Parse error: Expected '}'",
        },
      },
      text: "is not valid JSON: JSON Parse error: Expected '}'",
    },
    {
      problem: {
        code: PluginCode.OffSchema,
        details: {
          field: '',
          reason: 'Invalid input: expected object, received array',
        },
      },
      text: 'does not match its schema: <root>: Invalid input: expected object, received array',
    },
    {
      problem: {
        code: PluginCode.OffSchema,
        details: {
          field: 'plugins',
          reason: 'Too small: expected array to have >=1 items',
        },
      },
      text: 'does not match its schema: plugins: Too small: expected array to have >=1 items',
    },
    {
      problem: {
        code: PluginCode.SkillsDirectoryEmpty,
        details: {
          directory: 'skills/',
        },
      },
      text: 'lists the skills directory "./skills/", which holds no <skill>/SKILL.md',
    },
    {
      problem: {
        code: PluginCode.SkillsDirectoryUnlisted,
        details: {
          directory: 'tools/skills/',
        },
      },
      text: 'does not list "./tools/skills/", which holds skills',
    },
    {
      problem: {
        code: PluginCode.SkillWithoutFile,
        details: {},
      },
      text: 'holds no SKILL.md; a skill is a folder with SKILL.md in it',
    },
    {
      problem: {
        code: PluginCode.SkillWithoutFrontMatter,
        details: {},
      },
      text: 'has no front matter; a skill names itself and says when to use it there',
    },
    {
      problem: {
        code: PluginCode.SkillFrontMatterNotYaml,
        details: {
          reason: 'Nested mappings are not allowed in compact mappings',
        },
      },
      text: 'front matter is not valid YAML: Nested mappings are not allowed in compact mappings',
    },
    {
      problem: {
        code: PluginCode.SkillFieldMissing,
        details: {
          field: SkillField.Name,
        },
      },
      text: 'front matter lacks "name"; a skill declares its name and description',
    },
    {
      problem: {
        code: PluginCode.AgentWithoutFrontMatter,
        details: {},
      },
      text: 'has no front matter; an agent names itself and says when to use it there',
    },
    {
      problem: {
        code: PluginCode.AgentFrontMatterNotYaml,
        details: {
          reason: 'Implicit keys need to be on a single line',
        },
      },
      text: 'front matter is not valid YAML: Implicit keys need to be on a single line',
    },
    {
      problem: {
        code: PluginCode.AgentFieldMissing,
        details: {
          field: SkillField.Description,
        },
      },
      text: 'front matter lacks "description"; an agent declares its name and description',
    },
    {
      problem: {
        code: PluginCode.AgentNameMismatch,
        details: {
          file: 'reviewer',
          name: 'critic',
        },
      },
      text: 'is named "critic" in its front matter; an agent is named after its file, reviewer',
    },
    {
      problem: {
        code: PluginCode.TemplateMissing,
        details: {},
      },
      text: 'is missing; /ratify writes a project from the templates',
    },
    {
      problem: {
        code: PluginCode.MarketplaceOmitsPlugin,
        details: {
          plugin: 'constitution',
          repo: 'droneey/constitution',
        },
      },
      text: 'does not list the plugin "constitution" from the GitHub repository its manifest names (droneey/constitution), at a release tag v<major>.<minor>.<patch> and from the folder that holds its manifest',
    },
    {
      problem: {
        code: PluginCode.MarketplaceOmitsPlugin,
        details: {},
      },
      text: 'does not list the plugin "" from the GitHub repository its manifest names (none), at a release tag v<major>.<minor>.<patch> and from the folder that holds its manifest',
    },
    {
      problem: {
        code: PluginCode.HookFileMissing,
        details: {
          file: 'hooks/session-start.sh',
        },
      },
      text: 'runs "hooks/session-start.sh", which is missing',
    },
    {
      problem: {
        code: PresetsCode.StrayFile,
        details: {},
      },
      text: 'is not a part of a preset: presets/<scope>/<tool>/<axis>/<block>.<extension>, presets/<scope>/<tool>/<axis>/plugins/<rule>.grit, presets/<scope>/<tool>/<axis>/bindings.yaml, the axis foundation, architecture or workflow, or a module the configurations of a scope share, presets/<scope>/<name>.<extension>',
    },
    {
      problem: {
        code: PresetsCode.ToolNamesNoBlock,
        details: {
          scope: 'typescript',
          tool: 'eslint',
        },
      },
      text: 'is in presets/typescript/eslint/, which names no block',
    },
    {
      problem: {
        code: PresetsCode.ScopeNotCovered,
        details: {
          scope: 'css',
          tool: 'biome',
        },
      },
      text: 'is in presets/css/, which is neither common nor a language biome covers',
    },
    {
      problem: {
        code: PresetsCode.PartNamesNoBlock,
        details: {
          name: 'react',
        },
      },
      text: 'is named "react", which is neither a block nor self',
    },
    {
      problem: {
        code: PresetsCode.PluginNamesNoRule,
        details: {
          rule: 'null-free',
        },
      },
      text: 'is named "null-free", which is not a rule; a plugin is named after the rule it holds',
    },
    {
      problem: {
        code: PresetsCode.PluginOffAxis,
        details: {
          axis: Axis.Foundation,
          rule: RuleSlug.create('reads-are-cancellable'),
          ruleAxis: Axis.Architecture,
        },
      },
      text: 'holds reads-are-cancellable, a rule of architecture, in foundation/plugins/',
    },
    {
      problem: {
        code: BindingsCode.NotRule,
        details: {
          rule: RuleSlug.create('hooks-anywhere'),
        },
      },
      text: 'binds "hooks-anywhere", which is not a rule',
    },
    {
      problem: {
        code: BindingsCode.OffAxis,
        details: {
          axis: Axis.Foundation,
          rule: RuleSlug.create('reads-are-cancellable'),
          ruleAxis: Axis.Architecture,
        },
      },
      text: 'binds reads-are-cancellable, a rule of architecture, under foundation',
    },
    {
      problem: {
        code: BindingsCode.OutOfReach,
        details: {
          part: 'ui',
          rule: RuleSlug.create('hooks-at-top-level'),
          ruleBlock: BlockId.create('_react'),
        },
      },
      text: 'binds hooks-at-top-level, a rule of _react, to the part ui, which may hold only rules of its block, of the blocks above it, of a seam with it or of its tool',
    },
    {
      problem: {
        code: BindingsCode.PartMissing,
        details: {
          axis: Axis.Architecture,
          part: 'ui',
          rule: RuleSlug.create('four-data-states'),
          scope: 'typescript',
          tool: 'biome',
        },
      },
      text: 'binds four-data-states to the part ui, which presets/typescript/biome/architecture/ does not hold',
    },
    {
      problem: {
        code: BindingsCode.SettingMissing,
        details: {
          file: 'presets/typescript/biome/foundation/_react.jsonc',
          rule: RuleSlug.create('four-data-states'),
          setting: 'noUselessFragments',
        },
      },
      text: 'binds four-data-states to "noUselessFragments", which presets/typescript/biome/foundation/_react.jsonc does not hold',
    },
    {
      problem: {
        code: TemplatesCode.StrayFile,
        details: {},
      },
      text: 'is not a fragment of a block: templates/project/<scope>/<block>/<path>, the scope common or a language',
    },
    {
      problem: {
        code: TemplatesCode.ToolWithoutTemplate,
        details: {
          scope: 'typescript',
          tool: 'biome',
        },
      },
      text: 'has parts and no template in templates/project/typescript/biome/ that takes them by <parts>',
    },
    {
      problem: {
        code: TemplatesCode.NamesNoBlock,
        details: {
          scope: 'common',
          tool: 'nowhere',
        },
      },
      text: 'is in templates/project/common/nowhere/, which names no block; a template is a fragment its block owns',
    },
    {
      problem: {
        code: TemplatesCode.ScopeNotCovered,
        details: {
          scope: 'biome',
        },
      },
      text: 'is in templates/project/biome/, which is neither common nor a language',
    },
  ])('should say $problem.code as the report words it', ({ problem, text }) => {
    // Arrange
    const reported = problem;

    // Act
    const said = textOf(presetsTexts, reported.code, reported.details);

    // Assert
    expect(said).toBe(text);
  });
});
