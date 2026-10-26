import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';

import { cliPath } from './cli.fixtures';
import { removePluginRoots } from './plugin-root.fixtures';
import {
  createLinkedProject,
  createPluginRootWithPresets,
  linesOf,
  MEMBER,
} from './presets-apply.fixtures';
import {
  ConfigKey,
  configOf,
  memberConfigOf,
  removeProjects,
  workspaceOf,
} from './project.fixtures';

interface Ran {
  readonly exitCode: number | undefined;
  readonly stdout: string;
}

// A member's own runner: a block of its pack whose entries give what the executable runs, each
// command leaving a mark, and a check of the project's own that the runner's check runs too.
const runnerPack = (check: string): Readonly<Record<string, string>> => ({
  [`${MEMBER}/pack/blocks/implementations/own-runner/own-runner.md`]: linesOf(
    '---',
    'id: own-runner',
    "summary: The package's own runner.",
    'requires: []',
    'extends: null',
    'abstract: false',
    'languages: []',
    'governs: []',
    '---',
    '',
    '# own-runner',
  ),
  [`${MEMBER}/pack/presets/own-runner/foundation.yaml`]: linesOf(
    'own-runner:',
    "  '*':",
    "    '*':",
    '      own-runner.json:',
    '        strict: true',
    '      ${constitution.run}:',
    '        check:',
    `          - ${check}`,
    '          - echo own > checked-own.txt',
    '        fix:',
    '          - echo fixed > fixed.txt',
  ),
});

let root = '';

beforeAll(() => {
  root = createPluginRootWithPresets();
});

afterEach(() => {
  removeProjects();
});

afterAll(() => {
  removePluginRoots();
});

const projectOf = (check = 'echo checked > checked.txt'): string =>
  createLinkedProject({
    layout: {
      config: configOf({}),
      files: {
        ...workspaceOf({
          [MEMBER]: memberConfigOf({
            [ConfigKey.Implementations]: '[own-runner]',
            [ConfigKey.Packs]: '[pack]',
          }),
        }),
        ...runnerPack(check),
      },
    },
    root,
  });

const runIn = (input: { args: readonly string[]; folder: string }): Ran => {
  const ran = spawnSync(
    cliPath,
    [
      ...input.args,
      '--plain',
    ],
    {
      cwd: input.folder,
      encoding: 'utf8',
      env: Object.fromEntries([
        [
          'PATH',
          '/usr/bin:/bin',
        ],
      ]),
    },
  );

  return {
    exitCode: ran.status ?? undefined,
    stdout: ran.stdout,
  };
};

const marksOf = (project: string): readonly string[] =>
  [
    'checked.txt',
    'checked-own.txt',
    'fixed.txt',
  ].filter((mark) => existsSync(join(project, MEMBER, mark)));

describe('constitution run', () => {
  it("should run from the root every unit's commands its runners give, a pack's runner among them, each written before it runs", () => {
    // Arrange
    const project = projectOf();

    // Act
    const ran = runIn({
      args: [
        'run',
        'check',
      ],
      folder: project,
    });

    // Assert
    expect({
      exitCode: ran.exitCode,
      marks: marksOf(project),
      stdout: ran.stdout,
    }).toStrictEqual({
      exitCode: 0,
      marks: [
        'checked.txt',
        'checked-own.txt',
      ],
      stdout: `$ (${MEMBER}) echo checked > checked.txt\n$ (${MEMBER}) echo own > checked-own.txt\n`,
    });
  });

  it('should stop at the first command that fails and end the run as failed', () => {
    // Arrange
    const project = projectOf('exit 3');

    // Act
    const ran = runIn({
      args: [
        'run',
        'check',
      ],
      folder: join(project, MEMBER),
    });

    // Assert
    expect({
      exitCode: ran.exitCode,
      marks: marksOf(project),
    }).toStrictEqual({
      exitCode: 1,
      marks: [],
    });
  });

  it.each<{
    args: readonly string[];
    condition: string;
    marks: readonly string[];
  }>([
    {
      args: [],
      condition: 'apply writes the files',
      marks: [
        'fixed.txt',
      ],
    },
    {
      args: [
        '--no-fix',
      ],
      condition: 'apply is asked for no fix',
      marks: [],
    },
  ])('should run the fix of each unit apply wrote a file of when $condition', ({ args, marks }) => {
    // Arrange
    const project = projectOf();

    // Act
    const ran = runIn({
      args: [
        'presets',
        'apply',
        ...args,
      ],
      folder: project,
    });

    // Assert
    expect({
      exitCode: ran.exitCode,
      marks: marksOf(project),
      settings: readFileSync(join(project, MEMBER, 'own-runner.json'), 'utf8').includes('strict'),
    }).toStrictEqual({
      exitCode: 0,
      marks,
      settings: true,
    });
  });
});
