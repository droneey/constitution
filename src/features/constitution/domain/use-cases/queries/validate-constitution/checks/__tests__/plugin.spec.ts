import { describe, expect, it } from 'bun:test';

import type { Finding } from '#/kernel';

import type { Files } from '../../../../../../__tests__/constitution.fixtures';
import {
  checkInputOf,
  without,
} from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { pluginCheck } from '../plugin';

const PLUGIN = '.claude-plugin/plugin.json';
const MARKETPLACE = '.claude-plugin/marketplace.json';
const HOOKS = 'hooks/hooks.json';
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
        {
          message: 'does not list the plugin "" with source "./"',
          path: MARKETPLACE,
        },
      ]);
    },
  );

  it.each<ManifestCase>([
    {
      expected: [
        {
          message:
            'lists the skills directory "./skills/", which holds no <skill>/SKILL.md',
          path: PLUGIN,
        },
      ],
      files: withFiles({
        [PLUGIN]: '{"name":"constitution","skills":"./skills/"}',
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
        'skills/ratify/SKILL.md': '---\nname: ratify\n---\n',
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
        'skills/ratify/SKILL.md.orig': '---\nname: ratify\n---\n',
      }),
      name: 'a file only begins with SKILL.md',
    },
    {
      expected: [],
      files: withFiles({
        [PLUGIN]: '{"name":"constitution","skills":["./tools/skills/"]}',
        'tools/skills/ratify/SKILL.md': '---\nname: ratify\n---\n',
      }),
      name: 'a listed nested directory holds its skills',
    },
  ])(
    'should compare the listed and the present skills when $name',
    ({ expected, files }) => {
      // Arrange
      const input = checkInputOf(files);

      // Act
      const findings = pluginCheck(input);

      // Assert
      expect(findings).toStrictEqual(expected);
    },
  );

  it.each<ManifestCase>([
    {
      expected: [
        {
          message:
            'is missing; the constitution ships as a plugin and needs its marketplace',
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
          message: 'does not list the plugin "constitution" with source "./"',
          path: MARKETPLACE,
        },
      ],
      files: withFiles({
        [MARKETPLACE]:
          '{"name":"droneey","plugins":[{"name":"constitution","source":"./plugin/"}]}',
      }),
      name: 'serving the plugin from another folder',
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
          '{"name":"droneey","plugins":[{"name":"constitution","source":"./"},{"name":"devkit","source":"./devkit/"}]}',
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
