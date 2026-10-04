import { describe, expect, it } from 'bun:test';

import type { Finding } from '#/kernel';

import type { Files } from '../../../../../../__tests__/constitution.fixtures';
import { checkInputOf, without } from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { pluginCheck } from '../plugin.check';

const PLUGIN = '.claude-plugin/plugin.json';
const MARKETPLACE = '.claude-plugin/marketplace.json';
const UNSERVED = (repo: string): string =>
  `does not list the plugin "constitution" from the GitHub repository its manifest names (${repo}) at a release tag v<major>.<minor>.<patch>`;
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
const GITHUB = {
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
  expected: Finding[];
  files: Files;
  name: string;
}

const withFiles = (extra: Readonly<Files>): Files => ({
  ...validFiles(),
  ...extra,
});

describe('pluginCheck', () => {
  it.each([
    {
      expected: 'is missing; the constitution ships as a plugin and needs its manifest',
      files: without({
        files: validFiles(),
        path: PLUGIN,
      }),
      name: 'missing',
    },
    {
      expected: "is not valid JSON: JSON Parse error: Expected '}'",
      files: withFiles({
        [PLUGIN]: '{',
      }),
      name: 'not JSON',
    },
    {
      expected: 'does not match its schema: <root>: Invalid input: expected object, received array',
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
        {
          message: expected,
          path: PLUGIN,
        },
        {
          message:
            'does not list the plugin "" from the GitHub repository its manifest names (none) at a release tag v<major>.<minor>.<patch>',
          path: MARKETPLACE,
        },
      ]);
    },
  );

  it.each<ManifestCase>([
    {
      expected: [
        {
          message: 'lists the skills directory "./skills/", which holds no <skill>/SKILL.md',
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
          message: 'does not list "./skills/", which holds skills',
          path: PLUGIN,
        },
      ],
      files: withFiles({
        'skills/ratify/SKILL.md': RATIFY,
      }),
      name: 'a skill sits in an unlisted directory',
    },
    {
      expected: [],
      files: withFiles({
        '.claude/skills/local/SKILL.md': '---\nname: local\n---\n',
      }),
      name: 'a skill sits in a hidden folder',
    },
    {
      expected: [],
      files: withFiles({
        [PLUGIN]:
          '{"name":"constitution","repository":"https://github.com/droneey/constitution","skills":["./tools/skills/"]}',
        'tools/skills/ratify/SKILL.md': RATIFY,
      }),
      name: 'a listed nested directory holds its skills',
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
          message: 'holds no SKILL.md; a skill is a folder with SKILL.md in it',
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
          message: 'holds no SKILL.md; a skill is a folder with SKILL.md in it',
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
    messages: readonly string[];
    name: string;
    skill: string;
  }>([
    {
      messages: [
        'has no front matter; a skill names itself and says when to use it there',
      ],
      name: 'it has no front matter',
      skill: '# Ratify\n',
    },
    {
      messages: [
        'front matter is not valid YAML: Flow sequence in block collection must be sufficiently indented and end with a ]',
      ],
      name: 'its front matter is not YAML',
      skill: '---\nname: ratify\ndescription: [a\n---\n',
    },
    {
      messages: [
        'front matter lacks "name"; a skill declares its name and description',
      ],
      name: 'it has no name',
      skill: '---\ndescription: Writes constitution.yaml.\n---\n',
    },
    {
      messages: [
        'front matter lacks "description"; a skill declares its name and description',
      ],
      name: 'its description is blank',
      skill: '---\nname: ratify\ndescription: ""\n---\n',
    },
    {
      messages: [
        'front matter lacks "name"; a skill declares its name and description',
        'front matter lacks "description"; a skill declares its name and description',
      ],
      name: 'its front matter is empty',
      skill: '---\n---\n',
    },
    {
      messages: [],
      name: 'it has a name and a description',
      skill: RATIFY,
    },
  ])('should check what a SKILL.md declares when $name', ({ messages, skill }) => {
    // Arrange
    const input = checkInputOf(
      withFiles({
        [PLUGIN]: LISTING_SKILLS,
        'skills/ratify/SKILL.md': skill,
      }),
    );

    // Act
    const findings = pluginCheck(input);

    // Assert
    expect(findings).toStrictEqual(
      messages.map((message) => ({
        message,
        path: 'skills/ratify/SKILL.md',
      })),
    );
  });

  it.each<{
    agent: string;
    messages: readonly string[];
    name: string;
  }>([
    {
      agent: 'You review.\n',
      messages: [
        'has no front matter; an agent names itself and says when to use it there',
      ],
      name: 'it has no front matter',
    },
    {
      agent: '---\nname: reviewer\ndescription: [a\n---\n',
      messages: [
        'front matter is not valid YAML: Flow sequence in block collection must be sufficiently indented and end with a ]',
      ],
      name: 'its front matter is not YAML',
    },
    {
      agent: '---\ndescription: Reviews files.\n---\n',
      messages: [
        'front matter lacks "name"; an agent declares its name and description',
      ],
      name: 'it has no name',
    },
    {
      agent: '---\nname: reviewer\n---\n',
      messages: [
        'front matter lacks "description"; an agent declares its name and description',
      ],
      name: 'it has no description',
    },
    {
      agent: '---\nname: critic\ndescription: Reviews files.\n---\n',
      messages: [
        'is named "critic" in its front matter; an agent is named after its file, reviewer',
      ],
      name: 'its name is not its file',
    },
    {
      agent: '---\nname: reviewer\ndescription: Reviews files.\n---\n',
      messages: [],
      name: 'it is named after its file and says what it does',
    },
  ])('should check what an agent declares when $name', ({ agent, messages }) => {
    // Arrange
    const input = checkInputOf(
      withFiles({
        'agents/reviewer.md': agent,
      }),
    );

    // Act
    const findings = pluginCheck(input);

    // Assert
    expect(findings).toStrictEqual(
      messages.map((message) => ({
        message,
        path: 'agents/reviewer.md',
      })),
    );
  });

  it.each([
    'templates/PROJECT.md',
    'templates/block.md',
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
        message: 'is missing; /ratify writes a project from the templates',
        path,
      },
    ]);
  });

  it.each<ManifestCase>([
    {
      expected: [
        {
          message: 'is missing; the constitution ships as a plugin and needs its marketplace',
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
        {
          message: UNSERVED('droneey/constitution'),
          path: MARKETPLACE,
        },
      ],
      files: withFiles({
        [MARKETPLACE]: listed('./'),
      }),
      name: 'serving the plugin from its own folder',
    },
    {
      expected: [
        {
          message: UNSERVED('droneey/constitution'),
          path: MARKETPLACE,
        },
      ],
      files: withFiles({
        [MARKETPLACE]: listed({
          ...GITHUB,
          repo: 'someone/constitution',
          ref: 'v1.0.0',
        }),
      }),
      name: 'serving the plugin from another repository',
    },
    ...[
      'main',
      'v1.0.0-rc.1',
      'release-v1.0.0',
      undefined,
    ].map((ref) => ({
      expected: [
        {
          message: UNSERVED('droneey/constitution'),
          path: MARKETPLACE,
        },
      ],
      files: withFiles({
        [MARKETPLACE]: listed({
          ...GITHUB,
          ref,
        }),
      }),
      name: `serving the plugin at ${ref ?? 'no ref'}`,
    })),
    {
      expected: [
        {
          message: UNSERVED('none'),
          path: MARKETPLACE,
        },
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
        {
          message: UNSERVED('none'),
          path: MARKETPLACE,
        },
      ],
      files: withFiles({
        '.claude-plugin/plugin.json':
          '{"name":"constitution","repository":"https://gitlab.com/droneey/constitution"}',
        [MARKETPLACE]: listed({
          ...GITHUB,
          ref: 'v1.0.0',
        }),
      }),
      name: 'listed while the plugin manifest names a repository off GitHub',
    },
    {
      expected: [
        {
          message: UNSERVED('droneey/constitution'),
          path: MARKETPLACE,
        },
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
          message:
            'does not match its schema: plugins: Too small: expected array to have >=1 items',
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
          message: 'runs "hooks/session-start.sh", which is missing',
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
          message:
            'does not match its schema: hooks: Invalid input: expected record, received string',
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
