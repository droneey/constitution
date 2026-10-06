import { spawnSync } from 'node:child_process';

interface Branch {
  baseText: (path: string) => string;
  diff: string;
  untracked: readonly string[];
}

const MAINLINE = 'origin/main';

// Git reads paths from the folder and lists only its subtree, so a unit of a workspace checks its own
// changes.
const branchIn = (folder: string): Branch => {
  const git = (args: readonly string[]): string =>
    spawnSync('git', args, {
      cwd: folder,
      encoding: 'utf8',
    }).stdout;
  const base = git([
    'merge-base',
    'HEAD',
    MAINLINE,
  ]).trim();

  return {
    baseText: (path) =>
      git([
        'show',
        `${base}:./${path}`,
      ]),
    diff: git([
      'diff',
      '-U0',
      '--no-color',
      '--diff-filter=ACMR',
      '--relative',
      '--merge-base',
      MAINLINE,
    ]),
    untracked: git([
      'ls-files',
      '--others',
      '--exclude-standard',
    ])
      .split('\n')
      .filter((path) => path !== ''),
  };
};

export { branchIn };
