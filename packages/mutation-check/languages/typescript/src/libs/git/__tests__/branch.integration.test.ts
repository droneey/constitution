import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterAll, describe, expect, test } from 'bun:test';

import { branchIn } from '../branch.ts';
import { GitFailure, isGitError } from '../git.error.ts';

type Files = Readonly<Record<string, string>>;

const UNIT = 'packages/api';

const orderPath = `${UNIT}/src/order.utils.ts`;
const BASE_ORDER = 'export const total = 1;\n';

const WORKSPACE: Files = {
  '.gitignore': 'dist/\n',
  [orderPath]: BASE_ORDER,
  'packages/web/src/order.utils.ts': BASE_ORDER,
} as const;

const git = (input: { args: readonly string[]; folder: string }): void => {
  spawnSync('git', input.args, {
    cwd: input.folder,
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
      '-c',
      'commit.gpgsign=false',
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
    if (isGitError(error)) {
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

afterAll(() => {
  for (const folder of [
    workspace,
    lone,
  ]) {
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
});

describe('branchIn', () => {
  test("should diff only the unit's files against the main line, by paths from the unit", () => {
    // Arrange
    const unit = join(workspace, UNIT);

    // Act
    const { diff } = branchIn(unit);

    // Assert
    expect(diff.match(HEADERS)).toStrictEqual([
      '+++ b/src/order.utils.ts',
      '@@ -1 +1 @@',
    ]);
  });

  test("should list only the unit's new files, by paths from the unit", () => {
    // Arrange
    const unit = join(workspace, UNIT);

    // Act
    const { untracked } = branchIn(unit);

    // Assert
    expect(untracked).toStrictEqual([
      'src/line.utils.ts',
    ]);
  });

  test('should read the text a file of the unit had where the branch left the main line', () => {
    // Arrange
    const { baseText } = branchIn(join(workspace, UNIT));

    // Act
    const text = baseText('src/order.utils.ts');

    // Assert
    expect(text).toBe(BASE_ORDER);
  });

  test('should read the text a file had where the branch left the main line when run from the root', () => {
    // Arrange
    const { baseText } = branchIn(workspace);

    // Act
    const text = baseText(orderPath);

    // Assert
    expect(text).toBe(BASE_ORDER);
  });

  test('should read no text for a file the main line never had', () => {
    // Arrange
    const { baseText } = branchIn(join(workspace, UNIT));

    // Act
    const text = baseText('src/line.utils.ts');

    // Assert
    expect(text).toBe('');
  });

  test("should fail with git's reason when the repository has no main line", () => {
    // Arrange
    const folder = lone;

    // Act
    const failure = failureOf(() => branchIn(folder));

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

  test('should fail when git cannot run in the folder', () => {
    // Arrange
    const missing = join(workspace, 'missing');

    // Act
    const failure = failureOf(() => branchIn(missing));

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
});
