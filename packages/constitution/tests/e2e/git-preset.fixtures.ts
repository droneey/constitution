import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

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

export { ignoredOf, patternsMeetingNoPath };
