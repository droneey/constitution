import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  realpathSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterAll, describe, expect, it } from 'bun:test';

import { branchIn } from '../branch.ts';
import { GitError, GitFailure } from '../git.error.ts';

type Files = Readonly<Record<string, string>>;

const UNIT = 'packages/api';

const orderPath = `${UNIT}/src/order.utils.ts`;
const BASE_ORDER = 'export const total = 1;\n';
const namePath = `${UNIT}/src/name.utils.ts`;
// more bytes than characters, so a reader that counts characters loses its place after it
const BASE_NAME = "export const name = 'Дмитро';\n";

const WORKSPACE: Files = {
  '.gitignore': 'dist/\n',
  [namePath]: BASE_NAME,
  [orderPath]: BASE_ORDER,
  'packages/web/src/order.utils.ts': BASE_ORDER,
} as const;

// git sees no configuration of the machine's: its home is a temporary folder, and the system's is off.
const home = realpathSync(mkdtempSync(join(tmpdir(), 'mutation-check-home-')));

const gitEnv: Readonly<Record<string, string>> = Object.fromEntries([
  [
    'GIT_CONFIG_NOSYSTEM',
    '1',
  ],
  [
    'HOME',
    home,
  ],
  [
    'PATH',
    process.env['PATH'] ?? '',
  ],
]);

const branchOf = (folder: string): ReturnType<typeof branchIn> =>
  branchIn({
    env: gitEnv,
    folder,
    timeoutMs: 30_000,
  });

const git = (input: { args: readonly string[]; folder: string }): void => {
  spawnSync('git', input.args, {
    cwd: input.folder,
    env: gitEnv,
  });
};

const writeFiles = (input: { files: Files; folder: string }): void => {
  for (const [path, text] of Object.entries(input.files)) {
    mkdirSync(dirname(join(input.folder, path)), {
      recursive: true,
    });
    writeFileSync(join(input.folder, path), text);
  }
};

const commit = (input: { files: Files; folder: string }): void => {
  writeFiles(input);
  git({
    args: [
      'add',
      '.',
    ],
    folder: input.folder,
  });
  git({
    args: [
      '-c',
      'user.name=test',
      '-c',
      'user.email=test@example.com',
      'commit',
      '--quiet',
      '--no-verify',
      '-m',
      'change',
    ],
    folder: input.folder,
  });
};

// The branch and the main line each move on from the workspace, and the branch then changes the
// files of both units and adds a file to each, one of them ignored.
const workspaceOf = (folder: string): void => {
  git({
    args: [
      'init',
      '--quiet',
    ],
    folder,
  });
  commit({
    files: WORKSPACE,
    folder,
  });
  commit({
    files: {
      [orderPath]: 'export const total = 5;\n',
    },
    folder,
  });
  git({
    args: [
      'update-ref',
      'refs/remotes/origin/main',
      'HEAD',
    ],
    folder,
  });
  git({
    args: [
      'reset',
      '--quiet',
      '--hard',
      'HEAD~1',
    ],
    folder,
  });
  commit({
    files: {
      [orderPath]: 'export const total = 2;\n',
    },
    folder,
  });
  writeFiles({
    files: {
      [`${UNIT}/dist/main.js`]: 'export {};\n',
      [`${UNIT}/src/line.utils.ts`]: 'export const line = 1;\n',
      [orderPath]: 'export const total = 3;\n',
      'packages/web/src/line.utils.ts': 'export const line = 1;\n',
      'packages/web/src/order.utils.ts': 'export const total = 3;\n',
    },
    folder,
  });
};

const HEADERS = /^(?:\+\+\+|@@) .*$/gm;

interface Failure {
  readonly causeCode: unknown;
  readonly code: GitFailure;
  readonly details: unknown;
}

// What a caller can tell of a failure of git: its code, what it ran, and the system's code beneath it.
const failureOf = (read: () => unknown): Failure | undefined => {
  try {
    read();
  } catch (error) {
    if (error instanceof GitError) {
      return {
        causeCode:
          error.cause instanceof Error && 'code' in error.cause ? error.cause.code : undefined,
        code: error.code,
        details: error.details,
      };
    }
  }

  return undefined;
};

const workspace = realpathSync(mkdtempSync(join(tmpdir(), 'mutation-check-branch-')));

workspaceOf(workspace);

// a repository that never fetched the main line
const lone = realpathSync(mkdtempSync(join(tmpdir(), 'mutation-check-lone-')));

git({
  args: [
    'init',
    '--quiet',
  ],
  folder: lone,
});
commit({
  files: WORKSPACE,
  folder: lone,
});

// A file the branch moved into the unit from another folder, changing two of its lines, one that reads
// like a diff's header; beside it a file of the unit changed to a line that reads like a move's, a new
// one whose name does, and a binary one. The change is left in the working tree, or committed.
const unchangedTail = [
  'fifth',
  'sixth',
  'seventh',
  'eighth',
  'ninth',
  'tenth',
]
  .map((name, at) => `export const ${name} = ${at + 5};\n`)
  .join('');
const movedBase = `export const first = 1;\nexport const second = 2;\nexport const third = 3;\nexport const fourth = 4;\n${unchangedTail}`;
const movedText = `export const first = 1;\nexport const second = 'diff --git new file mode x';\nexport const third = 3;\nexport const fourth = 44;\n${unchangedTail}`;
const moving = realpathSync(mkdtempSync(join(tmpdir(), 'mutation-check-moving-')));

const movedOf = (isCommitted: boolean): string => {
  const folder = join(moving, String(isCommitted));

  mkdirSync(folder);
  git({
    args: [
      'init',
      '--quiet',
    ],
    folder,
  });
  commit({
    files: {
      ...WORKSPACE,
      [`${UNIT}/src/logo.bin`]: 'logo\0',
      'packages/old/src/kept.utils.ts': unchangedTail,
      'packages/old/src/moved.utils.ts': movedBase,
    },
    folder,
  });
  git({
    args: [
      'update-ref',
      'refs/remotes/origin/main',
      'HEAD',
    ],
    folder,
  });
  rmSync(join(folder, 'packages/old'), {
    recursive: true,
  });
  writeFiles({
    files: {
      [`${UNIT}/src/kept.utils.ts`]: unchangedTail,
      [`${UNIT}/src/rename to line.utils.ts`]: 'export const line = 1;\n',
      [`${UNIT}/src/logo.bin`]: 'logo\0\0',
      [`${UNIT}/src/moved.utils.ts`]: movedText,
      [orderPath]: "export const total = 'rename from elsewhere';\n",
    },
    folder,
  });

  if (isCommitted) {
    commit({
      files: {},
      folder,
    });
  }

  return join(folder, UNIT);
};

// A file changed to a text of the same size, with the time it had, in a repository that compares only
// sizes and times, and an index written in that same second: only its text tells the change.
const racy = realpathSync(mkdtempSync(join(tmpdir(), 'mutation-check-racy-')));

// an hour before now, so git records the file's time apart from the index's and smudges nothing
const hourAgo = new Date(Date.now() - 3_600_000);

const racyUnit = (): string => {
  git({
    args: [
      'init',
      '--quiet',
    ],
    folder: racy,
  });
  git({
    args: [
      'config',
      'core.checkStat',
      'minimal',
    ],
    folder: racy,
  });
  writeFiles({
    files: WORKSPACE,
    folder: racy,
  });

  const file = join(racy, orderPath);

  utimesSync(file, hourAgo, hourAgo);
  commit({
    files: {},
    folder: racy,
  });
  git({
    args: [
      'update-ref',
      'refs/remotes/origin/main',
      'HEAD',
    ],
    folder: racy,
  });
  writeFileSync(file, 'export const total = 9;\n');
  utimesSync(file, hourAgo, hourAgo);
  utimesSync(join(racy, '.git', 'index'), hourAgo, hourAgo);

  return join(racy, UNIT);
};

const SKELETON = /^(?:diff --git|\+\+\+|@@) .*$/gm;

afterAll(() => {
  for (const folder of [
    workspace,
    lone,
    moving,
    racy,
    home,
  ]) {
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
});

describe('branchIn', () => {
  it("should diff only the unit's files against the main line, by paths from the unit", () => {
    // Arrange
    const unit = join(workspace, UNIT);

    // Act
    const { diff } = branchOf(unit);

    // Assert
    expect(diff.match(HEADERS)).toStrictEqual([
      '+++ b/src/order.utils.ts',
      '@@ -1 +1 @@',
    ]);
  });

  it("should list only the unit's new files, by paths from the unit", () => {
    // Arrange
    const unit = join(workspace, UNIT);

    // Act
    const { untracked } = branchOf(unit);

    // Assert
    expect(untracked).toStrictEqual([
      'src/line.utils.ts',
    ]);
  });

  it('should read the texts the files of the unit had where the branch left the main line, and none for a new one', () => {
    // Arrange
    const { baseTexts } = branchOf(join(workspace, UNIT));

    // Act
    const texts = baseTexts([
      'src/name.utils.ts',
      'src/line.utils.ts',
      // a new file whose name holds what reads like the header of an object
      'src/a 1 2.ts',
      'src/order.utils.ts',
    ]);

    // Assert
    expect(texts).toStrictEqual(
      new Map([
        [
          'src/name.utils.ts',
          BASE_NAME,
        ],
        [
          'src/line.utils.ts',
          '',
        ],
        [
          'src/a 1 2.ts',
          '',
        ],
        [
          'src/order.utils.ts',
          BASE_ORDER,
        ],
      ]),
    );
  });

  it('should read the text a file had where the branch left the main line when run from the root', () => {
    // Arrange
    const { baseTexts } = branchOf(workspace);

    // Act
    const texts = baseTexts([
      orderPath,
    ]);

    // Assert
    expect(texts).toStrictEqual(
      new Map([
        [
          orderPath,
          BASE_ORDER,
        ],
      ]),
    );
  });

  it.each([
    {
      isCommitted: false,
      newFiles: [],
      untracked: [
        'src/rename to line.utils.ts',
      ],
    },
    {
      isCommitted: true,
      newFiles: [
        'diff --git a/packages/api/src/rename to line.utils.ts b/packages/api/src/rename to line.utils.ts',
        '+++ b/src/rename to line.utils.ts\t',
        '@@ -0,0 +1 @@',
      ],
      untracked: [],
    },
  ])(
    'should diff a file moved into the unit against the file it left, and read its text there, when the change is committed: $isCommitted',
    ({ isCommitted, newFiles, untracked }) => {
      // Arrange
      const unit = movedOf(isCommitted);

      // Act
      const branch = branchOf(unit);

      // Assert
      expect({
        base: branch.baseTexts([
          'src/kept.utils.ts',
          'src/moved.utils.ts',
          'src/order.utils.ts',
        ]),
        skeleton: branch.diff.match(SKELETON),
        untracked: branch.untracked,
      }).toStrictEqual({
        base: new Map([
          [
            'src/kept.utils.ts',
            unchangedTail,
          ],
          [
            'src/moved.utils.ts',
            movedBase,
          ],
          [
            'src/order.utils.ts',
            BASE_ORDER,
          ],
        ]),
        skeleton: [
          'diff --git a/packages/old/src/kept.utils.ts b/packages/api/src/kept.utils.ts',
          'diff --git a/packages/old/src/moved.utils.ts b/packages/api/src/moved.utils.ts',
          '+++ b/src/moved.utils.ts',
          '@@ -2 +2 @@ export const first = 1;',
          '@@ -4 +4 @@ export const third = 3;',
          'diff --git a/packages/api/src/order.utils.ts b/packages/api/src/order.utils.ts',
          '+++ b/src/order.utils.ts',
          '@@ -1 +1 @@',
          ...newFiles,
        ],
        untracked,
      });
    },
  );

  it("should diff a file whose change only its text tells, as git's own index does", () => {
    // Arrange
    const unit = racyUnit();

    // Act
    const { diff } = branchOf(unit);

    // Assert
    expect(diff.match(HEADERS)).toStrictEqual([
      '+++ b/src/order.utils.ts',
      '@@ -1 +1 @@',
    ]);
  });

  it('should leave no scratch folder behind', () => {
    // Arrange
    const scratch = realpathSync(mkdtempSync(join(tmpdir(), 'mutation-check-scratch-')));
    const before = process.env['TMPDIR'];

    process.env['TMPDIR'] = scratch;

    // Act
    try {
      branchOf(join(workspace, UNIT));
    } finally {
      process.env['TMPDIR'] = before;
    }

    // Assert
    expect(readdirSync(scratch)).toStrictEqual([]);
  });

  it("should fail with git's reason when the repository has no main line", () => {
    // Arrange
    const folder = lone;

    // Act
    const failure = failureOf(() => branchOf(folder));

    // Assert
    expect(failure).toStrictEqual({
      causeCode: undefined,
      code: GitFailure.Failed,
      details: {
        args: [
          'merge-base',
          'HEAD',
          'origin/main',
        ],
        folder: lone,
        stderr: expect.stringMatching(/\S$/),
      },
    });
  });

  it('should fail when git cannot run in the folder', () => {
    // Arrange
    const missing = join(workspace, 'missing');

    // Act
    const failure = failureOf(() => branchOf(missing));

    // Assert
    expect(failure).toStrictEqual({
      causeCode: 'ENOENT',
      code: GitFailure.NotRun,
      details: {
        args: [
          'merge-base',
          'HEAD',
          'origin/main',
        ],
        folder: missing,
      },
    });
  });

  it('should fail with its own code when git answers past its time', () => {
    // Arrange
    const bin = join(home, 'slow-bin');

    mkdirSync(bin);
    writeFileSync(join(bin, 'git'), '#!/bin/sh\n/bin/sleep 5\n');
    chmodSync(join(bin, 'git'), 0o755);

    // Act
    const failure = failureOf(() =>
      branchIn({
        env: Object.fromEntries([
          [
            'PATH',
            bin,
          ],
        ]),
        folder: workspace,
        timeoutMs: 200,
      }),
    );

    // Assert
    expect(failure).toStrictEqual({
      causeCode: 'ETIMEDOUT',
      code: GitFailure.TimedOut,
      details: {
        args: [
          'merge-base',
          'HEAD',
          'origin/main',
        ],
        folder: workspace,
      },
    });
  });
});
