import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { gitIn, toolEnvironment } from './package.fixtures';
import { linesOf, widestAppliedUnit } from './preset-load.fixtures';

const COMMENT = '#';
const VERBOSE_LINE = /^[^:]*:\d*:(.*)\t/;

const repositoryUnit = (): string => {
  const folder = widestAppliedUnit('git');

  gitIn(folder, [
    'init',
    '--quiet',
  ]);

  return folder;
};

const checkIgnore = (input: {
  args: readonly string[];
  folder: string;
  paths: readonly string[];
}): readonly string[] =>
  linesOf(
    spawnSync(
      'git',
      [
        '-c',
        'core.excludesFile=/dev/null',
        'check-ignore',
        '--no-index',
        ...input.args,
        '--stdin',
      ],
      {
        cwd: input.folder,
        encoding: 'utf8',
        env: toolEnvironment(),
        input: input.paths.join('\n'),
      },
    ).stdout,
  );

const ignoredOf = (paths: readonly string[]): readonly string[] =>
  checkIgnore({
    args: [],
    folder: repositoryUnit(),
    paths,
  });

const patternsMeetingNoPath = (paths: readonly string[]): readonly string[] => {
  const folder = repositoryUnit();
  const met = new Set(
    checkIgnore({
      args: [
        '--verbose',
      ],
      folder,
      paths,
    }).map((line) => VERBOSE_LINE.exec(line)?.[1]),
  );

  return linesOf(readFileSync(join(folder, '.gitignore'), 'utf8')).filter(
    (pattern) => !(pattern.startsWith(COMMENT) || met.has(pattern)),
  );
};

const STAGED_FILE = 'src/order.ts';
const INDEX_ENDING = /^i\/(\S+)/;

// Why: core.autocrlf off keeps the machine's own setting from converting the file, so only the
// attributes the presets write decide the ending the index stores.
const gitWithoutAutoCrlf = (input: { args: readonly string[]; folder: string }): string => {
  const run = spawnSync(
    'git',
    [
      '-c',
      'core.autocrlf=false',
      ...input.args,
    ],
    {
      cwd: input.folder,
      encoding: 'utf8',
      env: toolEnvironment(),
    },
  );

  if (run.status !== 0) {
    throw new Error(`git ${input.args.join(' ')} failed in ${input.folder}: ${run.stderr}`);
  }

  return run.stdout;
};

const storedEndingOf = (text: string): string | undefined => {
  const folder = repositoryUnit();

  mkdirSync(join(folder, dirname(STAGED_FILE)), {
    recursive: true,
  });
  writeFileSync(join(folder, STAGED_FILE), text);
  gitWithoutAutoCrlf({
    args: [
      'add',
      STAGED_FILE,
    ],
    folder,
  });

  return INDEX_ENDING.exec(
    gitWithoutAutoCrlf({
      args: [
        'ls-files',
        '--eol',
        STAGED_FILE,
      ],
      folder,
    }),
  )?.[1];
};

export { ignoredOf, patternsMeetingNoPath, storedEndingOf };
