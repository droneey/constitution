import { spawnSync } from 'node:child_process';

interface Branch {
  baseText: (path: string) => string;
  diff: string;
  untracked: readonly string[];
}

const MAINLINE = 'origin/main';

// A branch that rewrites many files has a diff far past the 1 MiB that spawnSync keeps by default, and
// output cut at that size would read as no change at all.
const GIT_OUTPUT_LIMIT_BYTES = 268_435_456;

// Git reads paths from the folder and lists only its subtree, so a unit of a workspace checks its own
// changes.
const branchIn = (folder: string): Branch => {
  const git = (args: readonly string[]): string => {
    const run = spawnSync('git', args, {
      cwd: folder,
      encoding: 'utf8',
      maxBuffer: GIT_OUTPUT_LIMIT_BYTES,
    });

    if (run.error !== undefined) {
      throw new Error(`git ${args.join(' ')} failed in ${folder}`, {
        cause: run.error,
      });
    }

    return run.stdout;
  };
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
