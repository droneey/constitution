import { describe, expect, it } from 'bun:test';

import { pluginRule } from '../rules/plugin.rule';
import { loadFiles, validFiles, without } from './fixtures';

const PLUGIN = '.claude-plugin/plugin.json';
const MARKETPLACE = '.claude-plugin/marketplace.json';
const HOOKS = 'hooks/hooks.json';

describe('pluginRule', () => {
  it('should accept a plugin whose manifests, skills and hook scripts line up', () => {
    // Act
    const findings = pluginRule(loadFiles(validFiles()));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report the missing manifests', () => {
    // Arrange
    const files = without(validFiles(), PLUGIN, MARKETPLACE);

    // Act
    const findings = pluginRule(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'is missing; the constitution ships as a plugin and needs its manifest',
        path: PLUGIN,
      },
      {
        message:
          'is missing; the constitution ships as a plugin and needs its marketplace',
        path: MARKETPLACE,
      },
    ]);
  });

  it('should report a manifest that is not JSON and a marketplace off the schema', () => {
    // Arrange
    const files = validFiles();
    files[PLUGIN] = '{ "name": ';
    files[MARKETPLACE] = JSON.stringify({
      name: 'droneey',
    });

    // Act
    const findings = pluginRule(loadFiles(files));

    // Assert
    expect(findings).toHaveLength(2);
    expect(findings[0]?.message).toStartWith('is not valid JSON');
    expect(findings[1]?.message).toStartWith(
      'does not match the manifest schema',
    );
  });

  it('should report a skills directory without skills and a skills directory left unlisted', () => {
    // Arrange
    const files = validFiles();
    files[PLUGIN] = JSON.stringify({
      name: 'constitution',
      skills: './blocks/spheres/web/skills/',
    });

    // Act
    const findings = pluginRule(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'lists the skills directory "./blocks/spheres/web/skills/", which holds no <skill>/SKILL.md',
        path: PLUGIN,
      },
      {
        message: 'does not list "./blocks/core/skills/", which holds skills',
        path: PLUGIN,
      },
    ]);
  });

  it('should report a marketplace that does not serve the plugin from the root', () => {
    // Arrange
    const files = validFiles();
    files[MARKETPLACE] = JSON.stringify({
      name: 'droneey',
      plugins: [
        {
          name: 'constitution',
          source: './plugin/',
        },
      ],
    });

    // Act
    const findings = pluginRule(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'does not list the plugin "constitution" with source "./"',
        path: MARKETPLACE,
      },
    ]);
  });

  it('should report a hook that runs a script the plugin does not carry', () => {
    // Arrange
    const files = without(validFiles(), 'hooks/session-start.sh');

    // Act
    const findings = pluginRule(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'runs "hooks/session-start.sh", which is missing',
        path: HOOKS,
      },
    ]);
  });

  it('should accept a plugin without hooks and report hooks that are not JSON', () => {
    // Arrange
    const silent = without(validFiles(), HOOKS);
    const broken = validFiles();
    broken[HOOKS] = 'not json';

    // Act
    const silentFindings = pluginRule(loadFiles(silent));
    const brokenFindings = pluginRule(loadFiles(broken));

    // Assert
    expect(silentFindings).toStrictEqual([]);
    expect(brokenFindings).toHaveLength(1);
    expect(brokenFindings[0]?.path).toBe(HOOKS);
  });
});
