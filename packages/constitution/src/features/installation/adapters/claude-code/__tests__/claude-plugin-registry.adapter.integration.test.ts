import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { Version } from '#/kernel/value-objects';
import { pluginFingerprintOf } from '#/libs/claude-plugin';

import { createClaudePluginRegistry } from '../claude-plugin-registry.adapter';

let root = '';

const write = (input: { path: string; text: string }): void => {
  mkdirSync(join(root, input.path, '..'), {
    recursive: true,
  });
  writeFileSync(join(root, input.path), input.text);
};

// <root> in a file's text stands for the folder the spec writes in.
const writeAll = (files: Readonly<Record<string, string>>): void => {
  for (const [path, text] of Object.entries(files)) {
    write({
      path,
      text: text.replaceAll('<root>', root),
    });
  }
};

const installed = (installPath: string): string =>
  JSON.stringify({
    plugins: {
      'constitution@droneey': [
        {
          installPath,
        },
      ],
    },
  });

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'claude-plugin-registry-'));
});

afterEach(() => {
  rmSync(root, {
    force: true,
    recursive: true,
  });
});

describe('createClaudePluginRegistry', () => {
  it('should read the version and the fingerprint of the plugin Claude Code recorded when no plugin root is named', () => {
    // Arrange
    write({
      path: 'claude/plugins/installed_plugins.json',
      text: installed(join(root, 'cache/constitution')),
    });
    write({
      path: 'cache/constitution/package.json',
      text: '{"version": "0.80.0"}',
    });
    write({
      path: 'cache/constitution/.claude-plugin/plugin.json',
      text: '{"name": "constitution"}',
    });

    const registry = createClaudePluginRegistry({
      configFolder: join(root, 'claude'),
      pluginRoot: undefined,
    });

    // Act
    const plugin = registry.installed();

    // Assert
    expect({
      fingerprint: plugin?.fingerprint,
      version: plugin?.version,
    }).toStrictEqual({
      fingerprint: pluginFingerprintOf(join(root, 'cache/constitution')),
      version: Version.create('0.80.0'),
    });
  });

  it('should read the version alone under the plugin root when one is named and holds no manifest', () => {
    // Arrange
    write({
      path: 'running/package.json',
      text: '{"version": "0.81.0"}',
    });

    const registry = createClaudePluginRegistry({
      configFolder: join(root, 'claude'),
      pluginRoot: join(root, 'running'),
    });

    // Act
    const plugin = registry.installed();

    // Assert
    expect(plugin).toStrictEqual({
      version: Version.create('0.81.0'),
    });
  });

  it.each([
    {
      condition: 'Claude Code keeps no record',
      files: {},
    },
    {
      condition: 'the record is no JSON',
      files: {
        'claude/plugins/installed_plugins.json': '{',
      },
    },
    {
      condition: 'the record names another plugin only',
      files: {
        'claude/plugins/installed_plugins.json': JSON.stringify({
          plugins: {
            'other@droneey': [],
          },
        }),
      },
    },
    {
      condition: "the plugin's folder holds no manifest",
      files: {
        'claude/plugins/installed_plugins.json': installed('<root>/cache/constitution'),
      },
    },
    {
      condition: "the plugin's manifest names no version",
      files: {
        'cache/constitution/package.json': '{}',
        'claude/plugins/installed_plugins.json': installed('<root>/cache/constitution'),
      },
    },
    {
      condition: 'the record lists no installation of the plugin',
      files: {
        'claude/plugins/installed_plugins.json': JSON.stringify({
          plugins: {
            'constitution@droneey': [],
          },
        }),
      },
    },
    {
      condition: "the record's path is no text",
      files: {
        'claude/plugins/installed_plugins.json': JSON.stringify({
          plugins: {
            'constitution@droneey': [
              {
                installPath: 7,
              },
            ],
          },
        }),
      },
    },
    {
      condition: "the plugin's version is no text",
      files: {
        'cache/constitution/package.json': '{"version": 7}',
        'claude/plugins/installed_plugins.json': installed('<root>/cache/constitution'),
      },
    },
    {
      condition: "the plugin's version is no release version",
      files: {
        'cache/constitution/package.json': '{"version": "latest"}',
        'claude/plugins/installed_plugins.json': installed('<root>/cache/constitution'),
      },
    },
  ])('should find no plugin when $condition', ({ files }) => {
    // Arrange
    writeAll(files);

    const registry = createClaudePluginRegistry({
      configFolder: join(root, 'claude'),
      pluginRoot: undefined,
    });

    // Act
    const plugin = registry.installed();

    // Assert
    expect(plugin).toBeUndefined();
  });
});
