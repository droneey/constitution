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

const seamWithCorePath = `${MEMBER}/pack/blocks/implementations/own-runner/foundation/with/core.md`;

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
    '| Why |',
    '|---|',
    '| a check run apart is skipped. |',
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
        "  Why: a naming rule left to review is broken as soon as nobody reads for it; a list of words is what a lint can hold of the rule, and the suppression is where the code says it knows nothing of the value's shape.",
        "  Why: output written past the logger escapes the one place that decides where diagnostics go and what they may carry, so it lands where nobody looks, mixes into its user's output and can leak what it prints.",
      ],
    },
  ])(
    "should name under the failed step each rule a tool's diagnostics show broken, $condition",
    ({ args, whys }) => {
      // Arrange
      const unit = installedIn(
        appliedUnit({
          implementations: [
            'bun',
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
            'export const doubled = (count: number): number => {',
            '  const data = count + count;',
            '',
            '  debugger;',
            '',
            '  return data;',
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
          "biome-refuses-empty-names · SHOULD — Biome's lint refuses a variable named only by an empty word. A variable, a parameter or a destructured field named only `data`, `result`, `temp`, `info`, `item`, `value`, `obj`, `arr`, `stuff` or `thing` fails the lint wherever its setting reaches; one that holds a value whose shape the code does not know takes a suppression that says so.",
          ...whys.slice(0, 1),
          "diagnostics-written-through-a-logger · MUST — Diagnostics are written only through a logger. The logger is the program's one **logging facade**{#logging-facade}, the language’s standard one where its ecosystem commonly uses it, and its sink may be a standard stream; code writes to a console or a standard stream directly only a command-line program’s output to its user or a protocol the program speaks over it, and no debug output or breakpoint ships.",
          ...whys.slice(1),
        ],
      });
    },
  );
});
