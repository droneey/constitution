import type { SpawnSyncReturns } from 'node:child_process';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { z } from 'zod';

import { compareText } from '#/kernel/utils';

import { miseBinary } from './mise.fixtures';
import {
  gitIn,
  linkRelease,
  release,
  searchPathWith,
  toolEnvironment,
  writeFiles,
} from './package.fixtures';
import { widestAppliedUnit } from './preset-load.fixtures';

interface Analysis {
  readonly codes: readonly number[];
  readonly exitCode: number | undefined;
}

interface UnitTask {
  readonly run: string;
  readonly task: string;
}

const shellcheckReport = z.array(
  z.object({
    code: z.number(),
  }),
);

const shellcheck = miseBinary('shellcheck');
const shfmt = miseBinary('shfmt');
const RC_FILE = '.shellcheckrc';

const manifest = z.object({
  scripts: z.record(z.string(), z.string()),
});

const analysisOf = (run: SpawnSyncReturns<string>): Analysis => ({
  codes: [
    ...new Set(shellcheckReport.parse(JSON.parse(run.stdout)).map(({ code }) => code)),
  ].toSorted((left, right) => left - right),
  exitCode: run.status ?? undefined,
});

const analyseScript = (text: string): Analysis =>
  analysisOf(
    spawnSync(
      shellcheck,
      [
        '--rcfile',
        join(widestAppliedUnit('shellcheck'), RC_FILE),
        '--format=json',
        '-',
      ],
      {
        encoding: 'utf8',
        env: toolEnvironment(),
        input: text,
      },
    ),
  );

const shippedScripts = (): readonly string[] =>
  [
    ...new Bun.Glob('presets/**/*.sh').scanSync({
      cwd: release,
    }),
  ].toSorted((left, right) => left.localeCompare(right));

const strictAnalysisOf = (script: string): Analysis =>
  analysisOf(
    spawnSync(
      shellcheck,
      [
        '--enable=all',
        '--severity=style',
        '--format=json',
        join(release, script),
      ],
      {
        encoding: 'utf8',
        env: toolEnvironment(),
      },
    ),
  );

interface FormatCheck {
  readonly difference: string;
  readonly exitCode: number | undefined;
}

const formatCheckOf = (script: string): FormatCheck => {
  const run = spawnSync(
    shfmt,
    [
      '--diff',
      '--simplify',
      '--indent=2',
      '--case-indent',
      join(release, script),
    ],
    {
      encoding: 'utf8',
      env: toolEnvironment(),
    },
  );

  return {
    difference: run.stdout,
    exitCode: run.status ?? undefined,
  };
};

const unitScripts = (): Readonly<Record<string, string>> =>
  manifest.parse(
    JSON.parse(readFileSync(join(widestAppliedUnit('js-runtime/bun'), 'package.json'), 'utf8')),
  ).scripts;

const poeTasks = z.object({
  tool: z.object({
    poe: z.object({
      tasks: z.record(z.string(), z.unknown()),
    }),
  }),
});

const shellTask = z.object({
  shell: z.string(),
});

const unitShellTasks = (): Readonly<Record<string, string>> =>
  Object.fromEntries(
    Object.entries(
      poeTasks.parse(
        Bun.TOML.parse(
          readFileSync(join(widestAppliedUnit('task-runner/poe'), 'pyproject.toml'), 'utf8'),
        ),
      ).tool.poe.tasks,
    ).flatMap(([task, declared]) => {
      const parsed = shellTask.safeParse(declared);

      return parsed.success
        ? [
            [
              task,
              parsed.data.shell,
            ],
          ]
        : [];
    }),
  );

const shellScriptOf = (task: string, run: string): UnitTask => ({
  run: `#!/bin/sh\n${run}\n`,
  task,
});

const unitTasks = (): readonly UnitTask[] => [
  ...Object.entries(unitScripts()).map(([task, run]) => shellScriptOf(task, run)),
  ...Object.entries(unitShellTasks()).map(([task, run]) => shellScriptOf(`poe ${task}`, run)),
];

interface ToolCommand {
  readonly task: string;
  readonly tool: string;
}

// Why: a task of one kind runs every tool of that kind, one command after another, so the case
// runs the one command of the tool it is about.
const COMMAND_SEPARATOR = ' && ';

const exitCodeBesideDeletedFile = ({ task, tool }: ToolCommand): number | undefined => {
  const script = unitScripts()
    [task]?.split(COMMAND_SEPARATOR)
    .find((command) => command.includes(` ${tool} `));

  if (script === undefined) {
    throw new Error(`the package.json the presets give a unit holds no ${tool} in script ${task}`);
  }

  const folder = mkdtempSync(join(tmpdir(), 'constitution-deleted-shell-'));
  const shellFile = '#!/bin/sh\nset -eu\n\nprintf \'%s\\n\' "kept"\n';

  try {
    writeFileSync(join(folder, 'kept.sh'), shellFile);
    writeFileSync(join(folder, 'gone.sh'), shellFile);
    gitIn(folder, [
      'init',
      '--quiet',
    ]);
    gitIn(folder, [
      'add',
      '.',
    ]);
    gitIn(folder, [
      'commit',
      '--quiet',
      '--no-verify',
      '-m',
      'base',
    ]);
    rmSync(join(folder, 'gone.sh'));
    linkRelease(folder);

    return (
      spawnSync(
        'sh',
        [
          '-c',
          script,
        ],
        {
          cwd: folder,
          env: toolEnvironment(
            new Map([
              [
                'PATH',
                searchPathWith(dirname(shellcheck), dirname(shfmt)),
              ],
            ]),
          ),
        },
      ).status ?? undefined
    );
  } finally {
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
};

interface FileKind {
  readonly extension: string;
  readonly otherExtension: string;
  readonly patterns: readonly string[];
}

const FILES_RUNNER = '.droneey/constitution/presets/plugins/shell/run-on-files.sh';

const FILE_KINDS = {
  shell: {
    extension: '.sh',
    otherExtension: '.bash',
    patterns: [
      '*.sh',
      '*.bash',
    ],
  },
  yaml: {
    extension: '.yaml',
    otherExtension: '.yml',
    patterns: [
      '*.yaml',
      '*.yml',
    ],
  },
} as const satisfies Readonly<Record<string, FileKind>>;

interface MemberFiles {
  readonly kind: keyof typeof FILE_KINDS;
  readonly member: string;
}

const filesHandedBesideMember = (input: MemberFiles): readonly string[] => {
  const { extension, otherExtension, patterns } = FILE_KINDS[input.kind];
  const { member } = input;
  const folder = mkdtempSync(join(tmpdir(), 'constitution-member-files-'));
  const text = '#!/bin/sh\n';

  try {
    writeFiles({
      files: {
        '.gitignore': `ignored${extension}\n`,
        [`ignored${extension}`]: text,
        [`kept${extension}`]: text,
        [`${member}/skipped${extension}`]: text,
        [`untracked${otherExtension}`]: text,
      },
      folder,
    });
    gitIn(folder, [
      'init',
      '--quiet',
    ]);
    gitIn(folder, [
      'add',
      '.gitignore',
      `kept${extension}`,
      member,
    ]);
    linkRelease(folder);

    return spawnSync(
      FILES_RUNNER,
      [
        ...patterns,
        '--',
        'printf',
        String.raw`%s\n`,
        '--',
        member,
      ],
      {
        cwd: folder,
        encoding: 'utf8',
        env: toolEnvironment(),
      },
    )
      .stdout.split('\n')
      .filter((line) => line !== '')
      .toSorted(compareText);
  } finally {
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
};

export {
  analyseScript,
  COMMAND_SEPARATOR,
  exitCodeBesideDeletedFile,
  filesHandedBesideMember,
  formatCheckOf,
  shippedScripts,
  strictAnalysisOf,
  unitTasks,
};
