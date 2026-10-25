import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';

import { cliPath } from './cli.fixtures';
import {
  archiveOf,
  createPluginRoot,
  linkArchive,
  removePluginRoots,
} from './plugin-root.fixtures';
import { ConfigKey, configOf, createProject, removeProjects } from './project.fixtures';

interface Run {
  exitCode: number | undefined;
  stderr: string;
  stdout: string;
}

const packageVersion: string = JSON.parse(
  readFileSync(join(import.meta.dir, '..', '..', 'package.json'), 'utf8'),
).version;
// A proxy that refuses every call: doctor finds GitHub unreachable at once, and no spec reaches it.
const NO_NETWORK = 'http://127.0.0.1:9';

// A run as a pipeline runs the program: no terminal, a clean environment.
const runProgram = (input: {
  args: readonly string[];
  cwd: string;
  env?: Readonly<Record<string, string>>;
}): Run => {
  const ran = spawnSync(cliPath, input.args, {
    cwd: input.cwd,
    encoding: 'utf8',
    env: Object.fromEntries([
      [
        'HTTPS_PROXY',
        NO_NETWORK,
      ],
      [
        'PATH',
        '/usr/bin:/bin',
      ],
      ...Object.entries(input.env ?? {}),
    ]),
  });

  return {
    exitCode: ran.status ?? undefined,
    stderr: ran.stderr,
    stdout: ran.stdout,
  };
};

let root = '';
let elsewhere = '';

beforeAll(() => {
  root = createPluginRoot();
  elsewhere = mkdtempSync(join(tmpdir(), 'constitution-elsewhere-'));
});

afterEach(() => {
  removeProjects();
});

afterAll(() => {
  removePluginRoots();
  rmSync(elsewhere, {
    force: true,
    recursive: true,
  });
});

const linkedProject = (config: string): string => {
  const project = createProject({
    config,
  });

  linkArchive({
    archive: archiveOf(root),
    project,
  });

  return project;
};

describe('the constitution program', () => {
  it('should print its version and exit 0 when asked for it', () => {
    // Arrange
    const args = [
      '--version',
    ];

    // Act
    const ran = runProgram({
      args,
      cwd: elsewhere,
    });

    // Assert
    expect(ran).toStrictEqual({
      exitCode: 0,
      stderr: '',
      stdout: `${packageVersion}\n`,
    });
  });

  it.each([
    {
      args: [
        '--help',
      ],
    },
    {
      args: [
        'check',
        '--base',
        'x',
        '-h',
      ],
    },
    {
      args: [
        'presets',
        'plan',
        '--help',
      ],
    },
  ])('should print help that opens with examples, and exit 0, when asked by $args', ({ args }) => {
    // Arrange
    const asked = args;

    // Act
    const ran = runProgram({
      args: asked,
      cwd: elsewhere,
    });

    // Assert
    expect({
      exitCode: ran.exitCode,
      opensWithExamples: ran.stdout.indexOf('Examples') < ran.stdout.indexOf('Usage'),
      stderr: ran.stderr,
    }).toStrictEqual({
      exitCode: 0,
      opensWithExamples: true,
      stderr: '',
    });
  });

  it.each([
    {
      args: [
        'chek',
      ],
      condition: 'the command is unknown',
      named: 'check',
    },
    {
      args: [
        'check',
        '--bse',
      ],
      condition: 'the flag is unknown',
      named: '--base',
    },
    {
      args: [
        'hook',
      ],
      condition: 'a group is given no command',
      named: 'session-start',
    },
  ])('should name the closest match and exit 2 when $condition', ({ args, named }) => {
    // Arrange
    const asked = args;

    // Act
    const ran = runProgram({
      args: asked,
      cwd: elsewhere,
    });

    // Assert
    expect({
      exitCode: ran.exitCode,
      named: ran.stderr.includes(named),
      stdout: ran.stdout,
    }).toStrictEqual({
      exitCode: 2,
      named: true,
      stdout: '',
    });
  });

  it('should pass, its steps on standard error and nothing on standard output, when the project is sound', () => {
    // Arrange
    const project = linkedProject(configOf({}));

    // Act
    const ran = runProgram({
      args: [
        'check',
      ],
      cwd: project,
    });

    // Assert
    expect({
      exitCode: ran.exitCode,
      steps: ran.stderr.split('\n').map((line) => line.split(' — ')[0]),
      stdout: ran.stdout,
    }).toStrictEqual({
      exitCode: 0,
      steps: [
        '• Blocks',
        '✓ Presets',
        '',
      ],
      stdout: '',
    });
  });

  it('should print the warnings of the project and exit 1 when it has some', () => {
    // Arrange
    const project = linkedProject(
      configOf({
        [ConfigKey.Domains]: '[nonesuch]',
      }),
    );

    // Act
    const ran = runProgram({
      args: [
        'presets',
        'check',
      ],
      cwd: project,
    });

    // Assert
    expect({
      exitCode: ran.exitCode,
      named: ran.stdout.includes('blocks: nonesuch'),
    }).toStrictEqual({
      exitCode: 1,
      named: true,
    });
  });

  it.each([
    {
      args: [
        'blocks',
        'check',
      ],
      condition: 'the blocks are checked in a folder that holds none',
    },
    {
      args: [
        'presets',
        'check',
      ],
      condition: 'the presets are checked outside any project',
    },
  ])('should exit 1 when $condition', ({ args }) => {
    // Arrange
    const asked = args;

    // Act
    const ran = runProgram({
      args: asked,
      cwd: elsewhere,
    });

    // Assert
    expect(ran.exitCode).toBe(1);
  });

  it('should write the failure block, and exit 1, when the plan finds no project', () => {
    // Arrange
    const asked = [
      'presets',
      'plan',
    ];

    // Act
    const ran = runProgram({
      args: asked,
      cwd: elsewhere,
    });

    // Assert
    expect({
      exitCode: ran.exitCode,
      stderr: ran.stderr,
    }).toStrictEqual({
      exitCode: 1,
      stderr:
        '✗ no constitution.yaml in this folder or above it\n  → run /constitution:ratify in a Claude Code session to write one\n',
    });
  });

  it('should report every part of the installation, the release skipped offline, and exit 1 when a part is broken', () => {
    // Arrange
    const project = linkedProject(configOf({}));

    // Act
    const ran = runProgram({
      args: [
        'doctor',
      ],
      cwd: project,
      env: Object.fromEntries([
        [
          'CLAUDE_CONFIG_DIR',
          elsewhere,
        ],
      ]),
    });

    // Assert
    expect({
      exitCode: ran.exitCode,
      parts: ran.stdout
        .split('\n')
        .filter((line) => line.includes(' — '))
        .map((line) => line.split(' — ')[0]),
    }).toStrictEqual({
      exitCode: 1,
      parts: [
        '✓ Program',
        '⚠ Claude Code plugin',
        '• Latest release',
        '✗ constitution on PATH',
        '⚠ Release link',
        '• Git hooks',
      ],
    });
  });
});
