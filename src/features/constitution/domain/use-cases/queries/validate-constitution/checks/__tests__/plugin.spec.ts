import { describe, expect, it } from 'bun:test';

import type { Files } from '#/features/constitution/__tests__/fixtures';
import {
  checkInputOf,
  without,
} from '#/features/constitution/__tests__/fixtures';
import { validFiles } from '#/features/constitution/__tests__/valid-files';

import { pluginCheck } from '../plugin';

const PLUGIN = '.claude-plugin/plugin.json';
const MARKETPLACE = '.claude-plugin/marketplace.json';
const HOOKS = 'hooks/hooks.json';
const NO_PLUGIN_ENTRY = {
  message: 'does not list the plugin "" with source "./"',
  path: MARKETPLACE,
};

interface SkillCase {
  expected: string[];
  extra: Files;
  name: string;
}

interface HooksCase {
  expected: string[];
  files: Files;
  name: string;
}

const withFiles = (extra: Readonly<Files>): Files => ({
  ...validFiles(),
  ...extra,
});

describe('pluginCheck', () => {
  it('should find nothing when the constitution is valid', () => {
    // Arrange
    const input = checkInputOf(validFiles());

    // Act
    const findings = pluginCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it.each([
    {
      expected:
        'is missing; the constitution ships as a plugin and needs its manifest',
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
      expected:
        'does not match its schema: <root>: Invalid input: expected object, received array',
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
        NO_PLUGIN_ENTRY,
      ]);
    },
  );

  it.each<SkillCase>([
    {
      expected: [
        'lists the skills directory "./skills/", which holds no <skill>/SKILL.md',
      ],
      extra: {
        [PLUGIN]: '{"name":"constitution","skills":"./skills/"}',
      },
      name: 'a listed directory holds no skill',
    },
    {
      expected: [
        'does not list "./skills/", which holds skills',
      ],
      extra: {
        'skills/ratify/SKILL.md': '---\nname: ratify\n---\n',
      },
      name: 'a skill sits in an unlisted directory',
    },
    {
      expected: [],
      extra: {
        '.claude/skills/local/SKILL.md': '---\nname: local\n---\n',
      },
      name: 'a skill sits in a hidden folder',
    },
    {
      expected: [],
      extra: {
        [PLUGIN]: '{"name":"constitution","skills":["./skills/"]}',
        'skills/ratify/SKILL.md': '---\nname: ratify\n---\n',
      },
      name: 'every listed directory holds its skills',
    },
  ])(
    'should compare the listed and the present skills when $name',
    ({ expected, extra }) => {
      // Arrange
      const input = checkInputOf(withFiles(extra));

      // Act
      const findings = pluginCheck(input);

      // Assert
      expect(findings.map((finding) => finding.message)).toStrictEqual(
        expected,
      );
    },
  );

  it.each([
    {
      expected:
        'is missing; the constitution ships as a plugin and needs its marketplace',
      files: without({
        files: validFiles(),
        path: MARKETPLACE,
      }),
      name: 'missing',
    },
    {
      expected: 'does not list the plugin "constitution" with source "./"',
      files: withFiles({
        [MARKETPLACE]:
          '{"name":"droneey","plugins":[{"name":"constitution","source":"./plugin/"}]}',
      }),
      name: 'serving the plugin from another folder',
    },
    {
      expected:
        'does not match its schema: plugins: Too small: expected array to have >=1 items',
      files: withFiles({
        [MARKETPLACE]: '{"name":"droneey","plugins":[]}',
      }),
      name: 'listing no plugin',
    },
  ])(
    'should report the marketplace when it is $name',
    ({ expected, files }) => {
      // Arrange
      const input = checkInputOf(files);

      // Act
      const findings = pluginCheck(input);

      // Assert
      expect(findings).toStrictEqual([
        {
          message: expected,
          path: MARKETPLACE,
        },
      ]);
    },
  );

  it.each<HooksCase>([
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
        'runs "hooks/session-start.sh", which is missing',
      ],
      files: withFiles({
        [HOOKS]:
          '{"hooks":{"SessionStart":[{"hooks":[{"type":"command","command":"sh \\"${CLAUDE_PLUGIN_ROOT}/hooks/session-start.sh\\""}]}]}}',
      }),
      name: 'a hook runs a missing script',
    },
    {
      expected: [],
      files: withFiles({
        [HOOKS]:
          '{"hooks":{"SessionStart":[{"hooks":[{"type":"command","command":"sh \\"${CLAUDE_PLUGIN_ROOT}/hooks/session-start.sh\\""}]}]}}',
        'hooks/session-start.sh': '#!/bin/sh\n',
      }),
      name: 'a hook runs a script that exists',
    },
    {
      expected: [
        'does not match its schema: hooks: Invalid input: expected record, received string',
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
    expect(findings.map((finding) => finding.message)).toStrictEqual(expected);
  });
});
