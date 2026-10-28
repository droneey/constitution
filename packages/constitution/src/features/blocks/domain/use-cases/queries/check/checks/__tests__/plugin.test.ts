import { describe, expect, it } from 'bun:test';

import type { FindingOf } from '#/kernel/types';

import type { Files } from '../../../../../../__tests__/constitution.fixtures';
import { without } from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { SkillField } from '../../../../../entities';
import { checkInputOf } from '../../__tests__/check.fixtures';
import type { ManifestReadDetails } from '../../utils';
import { ManifestReadCode } from '../../utils';
import type { PluginDetails } from '../plugin';
import { PluginCode, pluginCheck } from '../plugin';

type PluginFinding = FindingOf<ManifestReadDetails & PluginDetails>;

const PLUGIN = '.claude-plugin/plugin.json';
const SKILL = 'skills/ratify/SKILL.md';
const AGENT = 'agents/reviewer.md';
const LISTING_SKILLS =
  '{"name":"constitution","repository":"https://github.com/droneey/constitution","skills":["./skills/"]}';
const RATIFY = '---\nname: ratify\ndescription: Writes constitution.yaml.\n---\n';

interface ManifestCase {
  expected: PluginFinding[];
  files: Files;
  name: string;
}

const withFiles = (extra: Readonly<Files>): Files => ({
  ...validFiles(),
  ...extra,
});

describe('pluginCheck', () => {
  it.each<ManifestCase>([
    {
      expected: [
        {
          code: PluginCode.ManifestMissing,
          details: {},
          path: PLUGIN,
        },
      ],
      files: without({
        files: validFiles(),
        path: PLUGIN,
      }),
      name: 'missing',
    },
    {
      expected: [
        {
          code: ManifestReadCode.NotJson,
          details: {
            reason: expect.any(String),
          },
          path: PLUGIN,
        },
      ],
      files: withFiles({
        [PLUGIN]: '{',
      }),
      name: 'not JSON',
    },
    {
      expected: [
        {
          code: ManifestReadCode.OffSchema,
          details: {
            field: '',
            reason: expect.any(String),
          },
          path: PLUGIN,
        },
      ],
      files: withFiles({
        [PLUGIN]: '[]',
      }),
      name: 'not an object',
    },
  ])('should report the manifest when it is $name', ({ expected, files }) => {
    // Arrange
    const input = checkInputOf(files);

    // Act
    const findings = pluginCheck(input);

    // Assert
    expect(findings).toStrictEqual(expected);
  });

  it.each<ManifestCase>([
    {
      expected: [
        {
          code: PluginCode.SkillsDirectoryEmpty,
          details: {
            directory: 'skills/',
          },
          path: PLUGIN,
        },
      ],
      files: withFiles({
        [PLUGIN]:
          '{"name":"constitution","repository":"https://github.com/droneey/constitution","skills":"./skills/"}',
      }),
      name: 'a listed directory holds no skill',
    },
    {
      expected: [
        {
          code: PluginCode.SkillsDirectoryUnlisted,
          details: {
            directory: 'skills/',
          },
          path: PLUGIN,
        },
      ],
      files: withFiles({
        'skills/ratify/SKILL.md': RATIFY,
      }),
      name: 'a skill sits in an unlisted directory',
    },
  ])('should compare the listed and the present skills when $name', ({ expected, files }) => {
    // Arrange
    const input = checkInputOf(files);

    // Act
    const findings = pluginCheck(input);

    // Assert
    expect(findings).toStrictEqual(expected);
  });

  it.each<ManifestCase>([
    {
      expected: [
        {
          code: PluginCode.SkillWithoutFile,
          details: {},
          path: 'skills/ratify',
        },
      ],
      files: withFiles({
        'skills/ratify/SKILL.md.orig': RATIFY,
      }),
      name: 'the default directory holds a folder whose file only begins with SKILL.md',
    },
    {
      expected: [
        {
          code: PluginCode.SkillWithoutFile,
          details: {},
          path: 'tools/skills/check',
        },
      ],
      files: withFiles({
        [PLUGIN]:
          '{"name":"constitution","repository":"https://github.com/droneey/constitution","skills":["./tools/skills/"]}',
        'tools/skills/check/references/roles.md': '# Roles\n',
        'tools/skills/ratify/SKILL.md': RATIFY,
      }),
      name: 'a listed directory holds a folder of references only',
    },
    {
      expected: [],
      files: withFiles({
        [PLUGIN]: LISTING_SKILLS,
        'skills/.cache/state.json': '{}',
        'skills/README.md': '# Skills\n',
        'skills/ratify/SKILL.md': RATIFY,
        'skills/ratify/references/questions.md': '# Questions\n',
        'tools/skills-old/notes.md': '# Notes\n',
      }),
      name: 'the skills directory also holds a hidden folder, a loose file and references',
    },
  ])('should report a skill folder without SKILL.md when $name', ({ expected, files }) => {
    // Arrange
    const input = checkInputOf(files);

    // Act
    const findings = pluginCheck(input);

    // Assert
    expect(findings).toStrictEqual(expected);
  });

  it.each<{
    expected: PluginFinding[];
    name: string;
    skill: string;
  }>([
    {
      expected: [
        {
          code: PluginCode.SkillWithoutFrontMatter,
          details: {},
          path: SKILL,
        },
      ],
      name: 'it has no front matter',
      skill: '# Ratify\n',
    },
    {
      expected: [
        {
          code: PluginCode.SkillFrontMatterNotYaml,
          details: {
            reason: expect.any(String),
          },
          path: SKILL,
        },
      ],
      name: 'its front matter is not YAML',
      skill: '---\nname: ratify\ndescription: [a\n---\n',
    },
    {
      expected: [
        {
          code: PluginCode.SkillFieldMissing,
          details: {
            field: SkillField.Name,
          },
          path: SKILL,
        },
      ],
      name: 'it has no name',
      skill: '---\ndescription: Writes constitution.yaml.\n---\n',
    },
    {
      expected: [
        {
          code: PluginCode.SkillFieldMissing,
          details: {
            field: SkillField.Description,
          },
          path: SKILL,
        },
      ],
      name: 'its description is blank',
      skill: '---\nname: ratify\ndescription: ""\n---\n',
    },
    {
      expected: [
        {
          code: PluginCode.SkillFieldMissing,
          details: {
            field: SkillField.Name,
          },
          path: SKILL,
        },
        {
          code: PluginCode.SkillFieldMissing,
          details: {
            field: SkillField.Description,
          },
          path: SKILL,
        },
      ],
      name: 'its front matter is empty',
      skill: '---\n---\n',
    },
  ])('should check what a SKILL.md declares when $name', ({ expected, skill }) => {
    // Arrange
    const input = checkInputOf(
      withFiles({
        [PLUGIN]: LISTING_SKILLS,
        [SKILL]: skill,
      }),
    );

    // Act
    const findings = pluginCheck(input);

    // Assert
    expect(findings).toStrictEqual(expected);
  });

  it.each<{
    agent: string;
    expected: PluginFinding[];
    name: string;
  }>([
    {
      agent: 'You review.\n',
      expected: [
        {
          code: PluginCode.AgentWithoutFrontMatter,
          details: {},
          path: AGENT,
        },
      ],
      name: 'it has no front matter',
    },
    {
      agent: '---\nname: reviewer\ndescription: [a\n---\n',
      expected: [
        {
          code: PluginCode.AgentFrontMatterNotYaml,
          details: {
            reason: expect.any(String),
          },
          path: AGENT,
        },
      ],
      name: 'its front matter is not YAML',
    },
    {
      agent: '---\ndescription: Reviews files.\n---\n',
      expected: [
        {
          code: PluginCode.AgentFieldMissing,
          details: {
            field: SkillField.Name,
          },
          path: AGENT,
        },
      ],
      name: 'it has no name',
    },
    {
      agent: '---\nname: reviewer\n---\n',
      expected: [
        {
          code: PluginCode.AgentFieldMissing,
          details: {
            field: SkillField.Description,
          },
          path: AGENT,
        },
      ],
      name: 'it has no description',
    },
    {
      agent: '---\nname: critic\ndescription: Reviews files.\n---\n',
      expected: [
        {
          code: PluginCode.AgentNameMismatch,
          details: {
            file: 'reviewer',
            name: 'critic',
          },
          path: AGENT,
        },
      ],
      name: 'its name is not its file',
    },
    {
      agent: '---\nname: reviewer\ndescription: Reviews files.\n---\n',
      expected: [],
      name: 'it is named after its file and says what it does',
    },
  ])('should check what an agent declares when $name', ({ agent, expected }) => {
    // Arrange
    const input = checkInputOf(
      withFiles({
        [AGENT]: agent,
      }),
    );

    // Act
    const findings = pluginCheck(input);

    // Assert
    expect(findings).toStrictEqual(expected);
  });

  it.each([
    'templates/PROJECT.md',
    'templates/DECISIONS.md',
    'templates/block/block.md',
    'templates/block/foundation/chapter.md',
    'templates/constitution.yaml',
  ])('should report the template %s when it is missing', (path) => {
    // Arrange
    const input = checkInputOf(
      without({
        files: validFiles(),
        path,
      }),
    );

    // Act
    const findings = pluginCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        code: PluginCode.TemplateMissing,
        details: {},
        path,
      },
    ]);
  });
});
