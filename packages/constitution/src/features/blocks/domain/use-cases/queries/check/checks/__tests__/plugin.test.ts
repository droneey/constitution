import { describe, expect, it } from 'bun:test';

import type { FindingOf } from '#/kernel/types';

import type { Files } from '../../../../../../__tests__/constitution.fixtures';
import { checkInputOf, without } from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import type { PluginDetails } from '../plugin';
import { PluginCode, pluginCheck } from '../plugin';

type PluginFinding = FindingOf<PluginDetails>;

const PLUGIN = '.claude-plugin/plugin.json';
const MARKETPLACE = '.claude-plugin/marketplace.json';
const SKILL = 'skills/ratify/SKILL.md';
const AGENT = 'agents/reviewer.md';

const unserved = (repo: string | undefined): PluginFinding => ({
  code: PluginCode.MarketplaceOmitsPlugin,
  details: {
    plugin: 'constitution',
    repo,
  },
  path: MARKETPLACE,
});

const listed = (source: unknown): string =>
  JSON.stringify({
    name: 'droneey',
    plugins: [
      {
        name: 'constitution',
        source,
      },
    ],
  });

const github = {
  repo: 'droneey/constitution',
  source: 'github',
};
const HOOKS = 'hooks/hooks.json';
const LISTING_SKILLS =
  '{"name":"constitution","repository":"https://github.com/droneey/constitution","skills":["./skills/"]}';
const RATIFY = '---\nname: ratify\ndescription: Writes constitution.yaml.\n---\n';
const SESSION_START_HOOK =
  '{"hooks":{"SessionStart":[{"hooks":[{"type":"command","command":"sh \\"${CLAUDE_PLUGIN_ROOT}/hooks/session-start.sh\\""}]}]}}';

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
          code: PluginCode.NotJson,
          details: {
            reason: "JSON Parse error: Expected '}'",
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
          code: PluginCode.OffSchema,
          details: {
            field: '',
            reason: 'Invalid input: expected object, received array',
          },
          path: PLUGIN,
        },
      ],
      files: withFiles({
        [PLUGIN]: '[]',
      }),
      name: 'not an object',
    },
  ])(
    'should report the manifest and the marketplace entry when the plugin manifest is $name',
    ({ expected, files }) => {
      // Arrange
      const input = checkInputOf(files);

      // Act
      const findings = pluginCheck(input);

      // Assert
      expect(findings).toStrictEqual([
        ...expected,
        {
          code: PluginCode.MarketplaceOmitsPlugin,
          details: {
            plugin: undefined,
            repo: undefined,
          },
          path: MARKETPLACE,
        },
      ]);
    },
  );

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
            reason:
              'Flow sequence in block collection must be sufficiently indented and end with a ]',
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
            field: 'name',
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
            field: 'description',
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
            field: 'name',
          },
          path: SKILL,
        },
        {
          code: PluginCode.SkillFieldMissing,
          details: {
            field: 'description',
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
            reason:
              'Flow sequence in block collection must be sufficiently indented and end with a ]',
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
            field: 'name',
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
            field: 'description',
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

  it.each([
    {
      expected: [],
      name: 'the folder that holds the plugin manifest',
      source: {
        path: 'packages/constitution',
        url: 'droneey/constitution',
      },
    },
    {
      expected: [],
      name: 'the folder that holds the plugin manifest, by the URL of the repository',
      source: {
        path: 'packages/constitution',
        url: 'https://github.com/droneey/constitution.git',
      },
    },
    {
      expected: [
        unserved('droneey/constitution'),
      ],
      name: 'a folder that holds no plugin manifest',
      source: {
        path: 'packages/tools',
        url: 'droneey/constitution',
      },
    },
    {
      expected: [
        unserved('droneey/constitution'),
      ],
      name: 'the root of a repository that holds the manifest in a folder',
      source: {
        url: 'droneey/constitution',
      },
    },
    {
      expected: [
        unserved('droneey/constitution'),
      ],
      name: 'a folder of no named repository',
      source: {
        path: 'packages/constitution',
      },
    },
  ])(
    'should check a marketplace in the repository when it serves the plugin from $name',
    ({ expected, source }) => {
      // Arrange
      const input = checkInputOf(
        without({
          files: validFiles(),
          path: MARKETPLACE,
        }),
        {
          [MARKETPLACE]: listed({
            ...source,
            ref: 'v1.0.0',
            source: 'git-subdir',
          }),
          [`packages/constitution/${PLUGIN}`]: LISTING_SKILLS,
        },
      );

      // Act
      const findings = pluginCheck(input);

      // Assert
      expect(findings).toStrictEqual(expected);
    },
  );

  it('should report the marketplace when it serves the plugin from a source of neither GitHub nor a folder of it', () => {
    // Arrange
    const files = withFiles({
      [MARKETPLACE]: listed({
        ref: 'v1.0.0',
        source: 'url',
        url: 'https://github.com/droneey/constitution.git',
      }),
    });
    const input = checkInputOf(files);

    // Act
    const findings = pluginCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      unserved('droneey/constitution'),
    ]);
  });

  it.each<ManifestCase>([
    {
      expected: [
        {
          code: PluginCode.MarketplaceMissing,
          details: {},
          path: MARKETPLACE,
        },
      ],
      files: without({
        files: validFiles(),
        path: MARKETPLACE,
      }),
      name: 'missing',
    },
    {
      expected: [
        unserved('droneey/constitution'),
      ],
      files: withFiles({
        [MARKETPLACE]: listed('./'),
      }),
      name: 'serving the plugin from its own folder',
    },
    {
      expected: [
        unserved('droneey/constitution'),
      ],
      files: withFiles({
        [MARKETPLACE]: listed({
          ...github,
          repo: 'someone/constitution',
          ref: 'v1.0.0',
        }),
      }),
      name: 'serving the plugin from another repository',
    },
    ...[
      'v1.0.0-rc.1',
      'release-v1.0.0',
      undefined,
    ].map((ref) => ({
      expected: [
        unserved('droneey/constitution'),
      ],
      files: withFiles({
        [MARKETPLACE]: listed({
          ...github,
          ref,
        }),
      }),
      name: `serving the plugin at ${ref ?? 'no ref'}`,
    })),
    {
      expected: [
        unserved(undefined),
      ],
      files: withFiles({
        '.claude-plugin/plugin.json': '{"name":"constitution"}',
        [MARKETPLACE]: listed({
          ref: 'v1.0.0',
          source: 'github',
        }),
      }),
      name: 'listed while the plugin manifest names no repository',
    },
    {
      expected: [
        unserved(undefined),
      ],
      files: withFiles({
        '.claude-plugin/plugin.json':
          '{"name":"constitution","repository":"https://gitlab.com/droneey/constitution"}',
        [MARKETPLACE]: listed({
          ...github,
          ref: 'v1.0.0',
        }),
      }),
      name: 'listed while the plugin manifest names a repository off GitHub',
    },
    {
      expected: [
        unserved('droneey/constitution'),
      ],
      files: withFiles({
        [MARKETPLACE]:
          '{"name":"droneey","plugins":[{"name":"devkit","source":{"source":"github","repo":"droneey/constitution","ref":"v1.0.0"}}]}',
      }),
      name: 'serving another plugin from the repository and release tag',
    },
    {
      expected: [
        {
          code: PluginCode.OffSchema,
          details: {
            field: 'plugins',
            reason: 'Too small: expected array to have >=1 items',
          },
          path: MARKETPLACE,
        },
      ],
      files: withFiles({
        [MARKETPLACE]: '{"name":"droneey","plugins":[]}',
      }),
      name: 'listing no plugin',
    },
    {
      expected: [],
      files: withFiles({
        [MARKETPLACE]:
          '{"name":"droneey","plugins":[{"name":"devkit","source":"./devkit/"},{"name":"constitution","source":{"source":"github","repo":"droneey/constitution","ref":"v10.10.10"}}]}',
      }),
      name: 'listing another plugin beside it',
    },
  ])('should check the marketplace when it is $name', ({ expected, files }) => {
    // Arrange
    const input = checkInputOf(files);

    // Act
    const findings = pluginCheck(input);

    // Assert
    expect(findings).toStrictEqual(expected);
  });

  it.each<ManifestCase>([
    {
      expected: [],
      files: without({
        files: validFiles(),
        path: HOOKS,
      }),
      name: 'the hooks manifest is absent',
    },
    {
      expected: [
        {
          code: PluginCode.HookFileMissing,
          details: {
            file: 'hooks/session-start.sh',
          },
          path: HOOKS,
        },
      ],
      files: withFiles({
        [HOOKS]: SESSION_START_HOOK,
      }),
      name: 'a hook runs a missing script',
    },
    {
      expected: [],
      files: withFiles({
        [HOOKS]: SESSION_START_HOOK,
        'hooks/session-start.sh': '#!/bin/sh\n',
      }),
      name: 'a hook runs a script that exists',
    },
    {
      expected: [
        {
          code: PluginCode.OffSchema,
          details: {
            field: 'hooks',
            reason: 'Invalid input: expected record, received string',
          },
          path: HOOKS,
        },
      ],
      files: withFiles({
        [HOOKS]: '{"hooks":"none"}',
      }),
      name: 'the hooks manifest has the wrong shape',
    },
  ])('should check the hooks manifest when $name', ({ expected, files }) => {
    // Arrange
    const input = checkInputOf(files);

    // Act
    const findings = pluginCheck(input);

    // Assert
    expect(findings).toStrictEqual(expected);
  });
});
