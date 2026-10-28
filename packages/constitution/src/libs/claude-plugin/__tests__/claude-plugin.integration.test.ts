import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { pluginFingerprintOf } from '../claude-plugin';

const SHA_256_HEX = /^[0-9a-f]{64}$/u;

let folder = '';

const write = (input: { path: string; root: string; text: string }): void => {
  mkdirSync(dirname(join(input.root, input.path)), {
    recursive: true,
  });
  writeFileSync(join(input.root, input.path), input.text);
};

const pluginOf = (input: {
  files?: Readonly<Record<string, string | undefined>>;
  name: string;
}): string => {
  const root = join(folder, input.name);
  const files = Object.entries({
    '.claude-plugin/plugin.json':
      '{"name":"constitution","author":{"name":"Dmytro"},"version":"1.0.0"}\n',
    'agents/reviewer.md': '# Reviewer\n',
    'hooks/hook.sh': 'exit 0\n',
    'hooks/hooks.json': '{}\n',
    'skills/ratify/SKILL.md': '# Ratify\n',
    'src/main.ts': 'export {};\n',
    ...input.files,
  }).flatMap(([path, text]) =>
    text === undefined
      ? []
      : [
          {
            path,
            text,
          },
        ],
  );

  for (const { path, text } of files) {
    write({
      path,
      root,
      text,
    });
  }

  return root;
};

const fingerprintAfterOutside = (input: { root: string; text: string }): string | undefined => {
  write({
    path: 'outside/x.md',
    root: folder,
    text: input.text,
  });
  write({
    path: 'src/main.ts',
    root: input.root,
    text: input.text,
  });

  return pluginFingerprintOf(input.root);
};

beforeEach(() => {
  folder = mkdtempSync(join(tmpdir(), 'claude-plugin-'));
});

afterEach(() => {
  rmSync(folder, {
    force: true,
    recursive: true,
  });
});

describe('pluginFingerprintOf', () => {
  it.each([
    {
      condition: 'two copies hold the same files',
      files: {},
    },
    {
      condition: 'a file that is none of its parts differs',
      files: {
        'src/main.ts': 'export const changed = true;\n',
      },
    },
  ])('should give one fingerprint of its glue when $condition', ({ files }) => {
    // Arrange
    const first = pluginOf({
      name: 'first',
    });
    const second = pluginOf({
      files,
      name: 'second',
    });

    // Act
    const fingerprints = [
      pluginFingerprintOf(first),
      pluginFingerprintOf(second),
    ];

    // Assert
    expect({
      isHash: SHA_256_HEX.test(fingerprints[0] ?? ''),
      isSame: fingerprints[0] === fingerprints[1],
    }).toStrictEqual({
      isHash: true,
      isSame: true,
    });
  });

  it("should read nothing beyond its glue when its manifest names the plugin's root and paths that leave it", () => {
    // Arrange
    const root = pluginOf({
      files: {
        '.claude-plugin/plugin.json':
          '{"name":"constitution","skills":["./skills/","../outside/","/elsewhere","."]}\n',
      },
      name: 'plugin',
    });

    // Act
    const fingerprints = [
      fingerprintAfterOutside({
        root,
        text: 'one\n',
      }),
      fingerprintAfterOutside({
        root,
        text: 'two\n',
      }),
    ];

    // Assert
    expect(fingerprints[0] === fingerprints[1]).toBe(true);
  });

  it.each([
    {
      condition: 'a skill changed',
      files: {
        'skills/ratify/SKILL.md': '# Ratify, changed\n',
      },
    },
    {
      condition: 'the hook script changed',
      files: {
        'hooks/hook.sh': 'exit 1\n',
      },
    },
    {
      condition: 'an agent was added',
      files: {
        'agents/writer.md': '# Writer\n',
      },
    },
    {
      condition: 'a file moved to another path',
      files: {
        'agents/reviewer.md': '',
        'agents/review.md': '# Reviewer\n',
      },
    },
    {
      condition: 'the manifest changed',
      files: {
        '.claude-plugin/plugin.json':
          '{"name":"constitution","skills":["./skills/"],"version":"1"}\n',
      },
    },
    {
      condition: 'a file Claude Code reads a part from changed',
      files: {
        '.mcp.json': '{}\n',
      },
    },
    {
      condition: "Claude Code's other file of a part changed",
      files: {
        '.lsp.json': '{}\n',
      },
    },
    {
      condition: 'a command was added',
      files: {
        'commands/check.md': '# Check\n',
      },
    },
    {
      condition: 'an output style was added',
      files: {
        'output-styles/terse.md': '# Terse\n',
      },
    },
  ])('should give another fingerprint when $condition', ({ files }) => {
    // Arrange
    const first = pluginOf({
      name: 'first',
    });
    const second = pluginOf({
      files,
      name: 'second',
    });

    // Act
    const fingerprints = [
      pluginFingerprintOf(first),
      pluginFingerprintOf(second),
    ];

    // Assert
    expect(fingerprints[0] === fingerprints[1]).toBe(false);
  });

  it.each([
    {
      changed: 'cmds/check.md',
      condition: 'a folder a field of the manifest names changed',
    },
    {
      changed: 'team/lead.md',
      condition: 'a folder a list of the manifest names changed',
    },
  ])('should give another fingerprint when $condition', ({ changed }) => {
    // Arrange
    const named = {
      '.claude-plugin/plugin.json':
        '{"name":"constitution","commands":"./cmds/","agents":["./team/"]}\n',
      'cmds/check.md': '# Check\n',
      'team/lead.md': '# Lead\n',
    };
    const first = pluginOf({
      files: named,
      name: 'first',
    });
    const second = pluginOf({
      files: {
        ...named,
        [changed]: '# Changed\n',
      },
      name: 'second',
    });

    // Act
    const fingerprints = [
      pluginFingerprintOf(first),
      pluginFingerprintOf(second),
    ];

    // Assert
    expect(fingerprints[0] === fingerprints[1]).toBe(false);
  });

  it.each([
    {
      condition: 'it holds no manifest',
      files: {
        '.claude-plugin/plugin.json': undefined,
      },
    },
    {
      condition: 'its manifest is no JSON',
      files: {
        '.claude-plugin/plugin.json': '{',
      },
    },
  ])('should give none when $condition', ({ files }) => {
    // Arrange
    const root = pluginOf({
      files,
      name: 'plugin',
    });

    // Act
    const fingerprint = pluginFingerprintOf(root);

    // Assert
    expect(fingerprint).toBeUndefined();
  });

  it.each([
    {
      condition: 'it holds as many files as a glue may',
      extra: 1995,
      isFingerprinted: true,
    },
    {
      condition: 'it holds one file more than a glue may',
      extra: 1996,
      isFingerprinted: false,
    },
  ])(
    'should give a fingerprint only within the bound when $condition',
    ({ extra, isFingerprinted }) => {
      // Arrange
      const root = pluginOf({
        files: Object.fromEntries(
          Array.from(
            {
              length: extra,
            },
            (_, index) => [
              `skills/many/${String(index)}.md`,
              '',
            ],
          ),
        ),
        name: 'plugin',
      });

      // Act
      const fingerprint = pluginFingerprintOf(root);

      // Assert
      expect(fingerprint !== undefined).toBe(isFingerprinted);
    },
  );

  it('should fail when the root is no path the system takes', () => {
    // Arrange
    const root = join(folder, 'a\0b');

    // Act
    const act = (): unknown => pluginFingerprintOf(root);

    // Assert
    expect(act).toThrow(TypeError);
  });
});
