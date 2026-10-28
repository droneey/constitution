import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { gitIn, toolEnvironment } from './package.fixtures';
import { linesOf, widestAppliedUnit } from './preset-load.fixtures';

const COMMENT = '#';
// git's verbose answer: the ignore file, the line and the pattern that met the path, a tab, the path.
const VERBOSE_LINE = /^[^:]*:\d*:(.*)\t/;

// The widest unit made a repository, which git's check of its ignore files needs.
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
        // the machine's own ignore file aside, as a project's checkout on another machine reads none
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

/** Of the paths given, those git ignores by the .gitignore of the widest unit. */
const ignoredOf = (paths: readonly string[]): readonly string[] =>
  checkIgnore({
    args: [],
    folder: repositoryUnit(),
    paths,
  });

/** The patterns of the .gitignore of the widest unit that meet none of the paths given. */
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
