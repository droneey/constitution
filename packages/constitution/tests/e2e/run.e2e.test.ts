import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';

import { appliedUnit } from './applied-unit.fixtures';
import { cliPath } from './cli.fixtures';
import { environmentOf, installedIn, toolEnvironment, writeFiles } from './package.fixtures';
import { removePluginRoots } from './plugin-root.fixtures';
import {
  createLinkedProject,
  createPluginRootWithPresets,
  linesOf,
  MEMBER,
} from './presets-apply.fixtures';
import { ConfigKey, configOf, removeProjects, workspaceOf } from './project.fixtures';

interface Ran {
  readonly exitCode: number | undefined;
  readonly stdout: string;
}

const runnerPack = (check: string): Readonly<Record<string, string>> => ({
  'DECISIONS.md': linesOf(
    '# Decision Log',
    '',
    '## ADR-0001 — The package runs its own checks',
    '**Date:** 2026-10-17 · **Status:** Accepted',
  ),
  [`${MEMBER}/pack/blocks/implementations/own-runner/own-runner.md`]: linesOf(
    '---',
    'id: own-runner',
    "summary: The package's own runner.",
    'requires: []',
    'languages: []',
    'governs: []',
    '---',
    '',
    '# own-runner',
    '',
    "> The package's own runner.",
  ),
  [`${MEMBER}/pack/presets/own-runner/@foundation.yaml`]: linesOf(
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

const seamWithCorePath = `${MEMBER}/pack/blocks/implementations/own-runner/@foundation/with/core.md`;

const seamWithCore: Readonly<Record<string, string>> = {
  [seamWithCorePath]: linesOf(
    '# Core',
    '',
    '> Governs the runner beside core.',
    '',
    '## General',
    '',
    '### own-runner-runs-every-check · MUST',
    '',
    'Every check runs through the own runner.',
    '',
    '#### Why',
    '',
    'a check run apart is skipped.',
    '',
    '#### Examples',
    '',
    '```sh title="Prefer"',
    'constitution run check',
    '```',
  ),
};

const projectOf = (
  check = 'echo checked > checked.txt',
  extra: Readonly<Record<string, string>> = {},
): string =>
  createLinkedProject({
    layout: {
      config: configOf({}),
      files: {
        ...workspaceOf({
          [MEMBER]: configOf({
            [ConfigKey.Implementations]: '[own-runner]',
            [ConfigKey.Packs]: '[pack]',
          }),
        }),
        ...runnerPack(check),
        ...extra,
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
      env: environmentOf(
        new Map([
          [
            'PATH',
            '/usr/bin:/bin',
          ],
        ]),
      ),
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

  it("should fail on a pack's finding of a MUST and run no unit's command", () => {
    // Arrange
    const project = projectOf(undefined, seamWithCore);

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
      named: ran.stdout.includes(
        `${seamWithCorePath}: [seam-never-pairs-with-core-or-a-related-block]`,
      ),
    }).toStrictEqual({
      exitCode: 1,
      marks: [],
      named: true,
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

  it.each([
    {
      condition: 'they pass',
      exitCode: 0,
      reported: '(pass) should hold when run',
      spec: "test('should hold when run', () => {\n  expect(true).toBeTrue();\n});",
    },
    {
      condition: 'one fails',
      exitCode: 1,
      reported: '(fail) should fail when run',
      spec: "test('should fail when run', () => {\n  expect(false).toBeTrue();\n});",
    },
  ])(
    "should run a Bun unit's specs for its test when $condition",
    ({ exitCode, reported, spec }) => {
      // Arrange
      const unit = installedIn(
        appliedUnit({
          implementations: [
            'js-runtime/bun',
            'task-runner',
            'bun-test',
          ],
          languages: [
            'typescript',
          ],
        }),
      );

      writeFiles({
        files: {
          'src/__tests__/hold.test.ts': `import { expect, test } from 'bun:test';\n\n${spec}\n`,
        },
        folder: unit,
      });

      // Act
      const ran = spawnSync(
        cliPath,
        [
          'run',
          'test',
          '--plain',
        ],
        {
          cwd: unit,
          encoding: 'utf8',
          env: toolEnvironment(),
        },
      );

      // Assert
      expect({
        exitCode: ran.status,
        ran: ran.stdout.split('\n')[0],
        reported: ran.stderr.includes(reported),
      }).toStrictEqual({
        exitCode,
        ran: '$ bun run test',
        reported: true,
      });
    },
  );

  it.each([
    {
      args: [],
      condition: 'alone',
      whys: [],
    },
    {
      args: [
        '--why',
      ],
      condition: 'with its Why when asked',
      whys: [
        '  Why: An `any` switches the checks off for whatever it touches and spreads to every value derived from it, so one written in a corner reaches code that never named it.',
        '  Why: A debug print left in code that reaches its users leaks what it prints to whoever reads the output, and a breakpoint halts the program for a user who has no debugger.',
      ],
    },
  ])(
    "should name under the failed step each rule a tool's diagnostics show broken, $condition",
    ({ args, whys }) => {
      // Arrange
      const unit = installedIn(
        appliedUnit({
          implementations: [
            'js-runtime/bun',
            'task-runner',
            'biome',
          ],
          languages: [
            'typescript',
          ],
        }),
      );

      writeFiles({
        files: {
          'src/doubled.ts': linesOf(
            'export const doubled = (count: any): number => {',
            '  const twice = count + count;',
            '',
            '  debugger;',
            '',
            '  return twice;',
            '};',
          ),
        },
        folder: unit,
      });

      // Act
      const ran = spawnSync(
        cliPath,
        [
          'run',
          'check',
          ...args,
          '--plain',
        ],
        {
          cwd: unit,
          encoding: 'utf8',
          env: toolEnvironment(),
        },
      );

      // Assert
      expect({
        exitCode: ran.status,
        named: ran.stderr
          .split('\n')
          .filter((line) => line.includes(' · ') || line.startsWith('  Why: ')),
      }).toStrictEqual({
        exitCode: 1,
        named: [
          'any-never-written · MUST — In a typed file, no code spells `any` or leaves the compiler to infer it. No annotation, assertion or type argument spells it, such as `: any`, `as any`, `Record<string, any>` or `Promise<any>`, and no parameter is left without a type for the compiler to read as `any`.',
          ...whys.slice(0, 1),
          "debug-output-never-ships · MUST — All code that reaches its users is free of every debug output and breakpoint. Debug output is output written only to follow a run while the code is developed, such as a printed value or a dump. Exempt: a diagnostic written through the diagnostic handles at a level the program's settings can turn off.",
          ...whys.slice(1),
        ],
      });
    },
  );
});
