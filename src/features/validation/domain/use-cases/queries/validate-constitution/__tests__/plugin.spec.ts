import { describe, expect, it } from 'bun:test';

import {
  loadFiles,
  validFiles,
  without,
} from '#/features/constitution/__tests__/fixtures';

import { pluginCheck } from '../checks/plugin';

const PLUGIN = '.claude-plugin/plugin.json';
const MARKETPLACE = '.claude-plugin/marketplace.json';
const HOOKS = 'hooks/hooks.json';

const hooksRunning = (command: string): string =>
  `{"hooks":{"SessionStart":[{"hooks":[{"command":${JSON.stringify(command)},"type":"command"}]}]}}`;

describe('pluginCheck', () => {
  it('should accept the plugin files of the valid constitution', () => {
    // Act
    const findings = pluginCheck(loadFiles(validFiles()));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report a missing plugin manifest and then a marketplace without it', () => {
    // Act
    const findings = pluginCheck(loadFiles(without(validFiles(), PLUGIN)));

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'is missing; the constitution ships as a plugin and needs its manifest',
        path: PLUGIN,
      },
      {
        message: 'does not list the plugin "" with source "./"',
        path: MARKETPLACE,
      },
    ]);
  });

  it('should report a manifest that is not JSON and one that breaks its schema', () => {
    // Arrange
    const files = validFiles();
    files[PLUGIN] = '{ not json';
    files[MARKETPLACE] = JSON.stringify({
      name: 'droneey',
      plugins: [],
    });

    // Act
    const findings = pluginCheck(loadFiles(files));

    // Assert
    expect(findings.map((finding) => finding.message)).toStrictEqual([
      expect.stringMatching(/^is not valid JSON:/),
      expect.stringMatching(/^does not match its schema: plugins:/),
    ]);
  });

  it('should report a listed skills directory without skills, as a string or a list', () => {
    // Arrange
    const files = validFiles();
    files[PLUGIN] = JSON.stringify({
      name: 'constitution',
      skills: './extra/',
    });
    files['skills/check/SKILL.md'] = '---\nname: check\n---\n';
    files['SKILL.md'] = 'not a skill folder';

    // Act
    const findings = pluginCheck(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'lists the skills directory "./extra/", which holds no <skill>/SKILL.md',
        path: PLUGIN,
      },
    ]);
  });

  it('should accept a listed skills directory that holds a skill', () => {
    // Arrange
    const files = validFiles();
    files[PLUGIN] = JSON.stringify({
      name: 'constitution',
      skills: [
        './skills/',
      ],
    });
    files['skills/check/SKILL.md'] = '---\nname: check\n---\n';

    // Act
    const findings = pluginCheck(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report a missing or broken marketplace', () => {
    // Arrange
    const broken = validFiles();
    broken[MARKETPLACE] = '[';

    // Act
    const findings = [
      ...pluginCheck(loadFiles(without(validFiles(), MARKETPLACE))),
      ...pluginCheck(loadFiles(broken)),
    ];

    // Assert
    expect(findings.map((finding) => finding.message)).toStrictEqual([
      'is missing; the constitution ships as a plugin and needs its marketplace',
      expect.stringMatching(/^is not valid JSON:/),
    ]);
  });

  it('should report a hook command that runs a missing file, and accept one that exists', () => {
    // Arrange
    const missing = validFiles();
    missing[HOOKS] = hooksRunning(
      'bash "${CLAUDE_PLUGIN_ROOT}/hooks/session-start.sh"',
    );
    const present = validFiles();
    present[HOOKS] = hooksRunning(
      'bash "${CLAUDE_PLUGIN_ROOT}/hooks/session-start.sh"',
    );
    present['hooks/session-start.sh'] = '#!/bin/sh\n';

    // Act
    const findings = [
      ...pluginCheck(loadFiles(missing)),
      ...pluginCheck(loadFiles(present)),
    ];

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'runs "hooks/session-start.sh", which is missing',
        path: HOOKS,
      },
    ]);
  });

  it('should accept absent and commandless hooks and report a broken manifest', () => {
    // Arrange
    const commandless = validFiles();
    commandless[HOOKS] = '{"hooks":{"SessionStart":[{"hooks":[{}]}]}}';
    const invalid = validFiles();
    invalid[HOOKS] = JSON.stringify({
      hooks: 'none',
    });

    // Act
    const findings = [
      ...pluginCheck(loadFiles(without(validFiles(), HOOKS))),
      ...pluginCheck(loadFiles(commandless)),
      ...pluginCheck(loadFiles(invalid)),
    ];

    // Assert
    expect(findings.map((finding) => finding.message)).toStrictEqual([
      expect.stringMatching(/^does not match its schema: hooks:/),
    ]);
  });
});
