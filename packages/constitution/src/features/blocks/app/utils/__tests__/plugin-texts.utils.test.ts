import { describe, expect, it } from 'bun:test';

import type { ProblemOf } from '#/kernel/types';
import { textOf } from '#/shared/cli';

import { SkillField } from '../../../domain/entities';
import type { PluginDetails } from '../../../domain/use-cases/queries/check';
import { PluginCode } from '../../../domain/use-cases/queries/check';
import { pluginTexts } from '../plugin-texts.utils';

describe('pluginTexts', () => {
  it.each<{
    problem: ProblemOf<PluginDetails>;
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
  ])('should say $problem.code as the report words it', ({ problem, text }) => {
    // Act
    const said = textOf(pluginTexts, problem.code, problem.details);

    // Assert
    expect(said).toBe(text);
  });
});
