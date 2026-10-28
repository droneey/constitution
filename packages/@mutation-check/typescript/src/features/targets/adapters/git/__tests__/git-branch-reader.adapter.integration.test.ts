import { spawnSync } from 'node:child_process';
import {
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

import { causeCodeOf, failureOf } from '#/__tests__/failure.fixtures.ts';
import { AbsolutePath, UnitRelativePath } from '#/kernel/value-objects';

import { BRANCH_SCENARIO, branchReaderSuite } from '../../../__tests__/branch-reader.suite.ts';
import { BranchError, BranchFailure } from '../../../domain/errors';
import { LineRange } from '../../../domain/value-objects';
import { gitBranchReader } from '../git-branch-reader.adapter.ts';

type Files = Readonly<Record<string, string>>;

// A folder past ASCII, which git writes escaped in quotes unless told otherwise.
const UNIT = 'packages/апі';

const OUTPUT_LIMIT_BYTES = 1_048_576;
const TIMEOUT_MS = 30_000;

const outerFolderPath = realpathSync(mkdtempSync(join(tmpdir(), 'mutation-check-branch-')));

afterAll(() => {
  rmSync(outerFolderPath, {
    force: true,
    recursive: true,
  });
});

// git sees no configuration of the machine's: its home is a temporary folder, and the system's is off.
const gitEnv: Readonly<Record<string, string>> = Object.fromEntries([
  [
    'GIT_CONFIG_NOSYSTEM',
    '1',
  ],
  [
    'HOME',
    outerFolderPath,
  ],
  [
    'PATH',
    process.env['PATH'] ?? '',
  ],
]);

const git = (folderPath: string, ...args: readonly string[]): string =>
  spawnSync('git', args, {
    cwd: folderPath,
    encoding: 'utf8',
    env: gitEnv,
    timeout: TIMEOUT_MS,
  }).stdout;

const writeFiles = (input: { files: Files; folderPath: string }): void => {
  for (const [filePath, text] of Object.entries(input.files)) {
    mkdirSync(dirname(join(input.folderPath, filePath)), {
      recursive: true,
    });
    writeFileSync(join(input.folderPath, filePath), text);
  }
};

const commit = (folderPath: string): void => {
  git(folderPath, 'add', '.');
  git(
    folderPath,
    '-c',
    'user.name=test',
    '-c',
    'user.email=test@example.com',
    'commit',
    '--quiet',
    '--no-verify',
    '-m',
    'change',
  );
};

interface Repository {
  readonly base: Files;
  /** the changes the branch leaves in the working tree */
  readonly branch: Files;
  readonly isCommitted?: boolean;
  /** what the main line changes after the branch left it */
  readonly mainline?: Files;
  readonly removedFolderPath?: string;
}

const repositoryOf = (repository: Repository): string => {
  const folderPath = mkdtempSync(join(outerFolderPath, 'repository-'));

  git(folderPath, 'init', '--quiet');
  writeFiles({
    files: repository.base,
    folderPath,
  });
  commit(folderPath);

  if (repository.mainline !== undefined) {
    writeFiles({
      files: repository.mainline,
      folderPath,
    });
    commit(folderPath);
  }

  git(folderPath, 'update-ref', 'refs/remotes/origin/main', 'HEAD');

  if (repository.mainline !== undefined) {
    git(folderPath, 'reset', '--quiet', '--hard', 'HEAD~1');
  }

  if (repository.removedFolderPath !== undefined) {
    rmSync(join(folderPath, repository.removedFolderPath), {
      recursive: true,
    });
  }

  writeFiles({
    files: repository.branch,
    folderPath,
  });

  if (repository.isCommitted === true) {
    commit(folderPath);
  }

  return folderPath;
};

const readerIn = (folderPath: string, scratchFolderPath: string = outerFolderPath) =>
  gitBranchReader({
    env: gitEnv,
    outputLimitBytes: OUTPUT_LIMIT_BYTES,
    scratchFolderPath: AbsolutePath.create(scratchFolderPath),
    timeoutMs: TIMEOUT_MS,
    unitFolderPath: AbsolutePath.create(folderPath),
  });

const linesOf = (startLine: number, endLine: number): LineRange =>
  LineRange.create({
    endLine,
    startLine,
  });

const pathOf = UnitRelativePath.create;

// The branch changes and adds a file of the unit, of a neighbour unit and an ignored one, while the
// main line changes another file of the unit after the branch left it.
const workspaceFolderPath = repositoryOf({
  base: {
    '.gitignore': 'dist/\n',
    [`${UNIT}/src/order.ts`]: BRANCH_SCENARIO.baseOrderText,
    [`${UNIT}/src/rate.ts`]: 'export const rate = 1;\n',
    'packages/web/src/order.ts': BRANCH_SCENARIO.baseOrderText,
  },
  branch: {
    [`${UNIT}/dist/main.js`]: 'export {};\n',
    [`${UNIT}/src/line.ts`]: BRANCH_SCENARIO.newLineText,
    [`${UNIT}/src/order.ts`]: BRANCH_SCENARIO.orderText,
    'packages/web/src/line.ts': BRANCH_SCENARIO.newLineText,
    'packages/web/src/order.ts': BRANCH_SCENARIO.orderText,
  },
  mainline: {
    [`${UNIT}/src/rate.ts`]: 'export const rate = 2;\n',
  },
});

branchReaderSuite({
  implementationName: 'gitBranchReader',
  readerOfScenario: () => readerIn(join(workspaceFolderPath, UNIT)),
});

// A file moved into the unit from another folder, two of its lines changed, one of them reading like
// a diff's header; beside it a file of the unit changed to a line that reads like a move's, a new one
// whose name does, and a binary one.
const UNCHANGED_TAIL =
  'export const fifth = 5;\nexport const sixth = 6;\nexport const seventh = 7;\n';
const movedBase = `export const first = 1;\nexport const second = 2;\nexport const third = 3;\nexport const fourth = 4;\n${UNCHANGED_TAIL}`;

const movedRepositoryOf = ({ isCommitted }: { isCommitted: boolean }): string =>
  repositoryOf({
    base: {
      [`${UNIT}/src/logo.bin`]: 'logo\0',
      [`${UNIT}/src/order.ts`]: BRANCH_SCENARIO.baseOrderText,
      'packages/old/src/kept.ts': UNCHANGED_TAIL,
      'packages/old/src/moved.ts': movedBase,
    },
    branch: {
      [`${UNIT}/src/kept.ts`]: UNCHANGED_TAIL,
      [`${UNIT}/src/logo.bin`]: 'logo\0\0',
      [`${UNIT}/src/moved.ts`]: `export const first = 1;\nexport const second = 'diff --git new file mode x';\nexport const third = 3;\nexport const fourth = 44;\n${UNCHANGED_TAIL}`,
      [`${UNIT}/src/order.ts`]: "export const total = 'rename from elsewhere';\n",
      [`${UNIT}/src/rename to line.ts`]: BRANCH_SCENARIO.newLineText,
    },
    isCommitted,
    removedFolderPath: 'packages/old',
  });

// A file changed to a text of the same size, with the time it had, in a repository that compares only
// sizes and times, and an index written in that same second: only its text tells the change.
const racyUnitFolderPath = (): string => {
  const folderPath = repositoryOf({
    base: {
      [`${UNIT}/src/order.ts`]: BRANCH_SCENARIO.baseOrderText,
    },
    branch: {},
  });
  const orderFilePath = join(folderPath, UNIT, 'src/order.ts');
  // an hour before now, so git records the file's time apart from the index's and smudges nothing
  const hourAgoSeconds =
    Temporal.Now.instant().subtract({
      hours: 1,
    }).epochMilliseconds / 1000;

  git(folderPath, 'config', 'core.checkStat', 'minimal');
  utimesSync(orderFilePath, hourAgoSeconds, hourAgoSeconds);
  git(folderPath, 'update-index', '--refresh');
  writeFileSync(orderFilePath, BRANCH_SCENARIO.orderText);
  utimesSync(orderFilePath, hourAgoSeconds, hourAgoSeconds);
  utimesSync(join(folderPath, '.git', 'index'), hourAgoSeconds, hourAgoSeconds);

  return join(folderPath, UNIT);
};

describe('gitBranchReader', () => {
  it.each([
    {
      isCommitted: false,
      newFiles: [],
      untrackedPaths: [
        pathOf('src/rename to line.ts'),
      ],
    },
    {
      isCommitted: true,
      newFiles: [
        {
          filePath: pathOf('src/rename to line.ts'),
          lineRanges: [
            linesOf(1, 1),
          ],
        },
      ],
      untrackedPaths: [],
    },
  ])(
    'should compare a file moved into the unit with the file it left when the change is committed: $isCommitted',
    ({ isCommitted, newFiles, untrackedPaths }) => {
      // Arrange
      const reader = readerIn(
        join(
          movedRepositoryOf({
            isCommitted,
          }),
          UNIT,
        ),
      );

      // Act
      const branch = reader.read();

      // Assert
      expect({
        changedFiles: branch.changedFiles,
        untrackedPaths: branch.untrackedPaths,
      }).toStrictEqual({
        changedFiles: [
          {
            filePath: pathOf('src/kept.ts'),
            lineRanges: [],
          },
          {
            filePath: pathOf('src/moved.ts'),
            lineRanges: [
              linesOf(2, 2),
              linesOf(4, 4),
            ],
          },
          {
            filePath: pathOf('src/order.ts'),
            lineRanges: [
              linesOf(1, 1),
            ],
          },
          ...newFiles,
        ],
        untrackedPaths,
      });
    },
  );

  it('should read the text a moved file had in the file it left, and none for a file the main line never had', () => {
    // Arrange
    const branch = readerIn(
      join(
        movedRepositoryOf({
          isCommitted: false,
        }),
        UNIT,
      ),
    ).read();

    // Act
    const baseTexts = branch.baseTextsOf([
      pathOf('src/kept.ts'),
      // a name that reads like the header of an object
      pathOf('src/a 1 2.ts'),
      pathOf('src/moved.ts'),
      pathOf('src/order.ts'),
    ]);

    // Assert
    expect(baseTexts).toStrictEqual(
      new Map([
        [
          pathOf('src/kept.ts'),
          UNCHANGED_TAIL,
        ],
        [
          pathOf('src/moved.ts'),
          movedBase,
        ],
        [
          pathOf('src/order.ts'),
          BRANCH_SCENARIO.baseOrderText,
        ],
      ]),
    );
  });

  it("should list a file whose change only its text tells, as git's own index does", () => {
    // Arrange
    const reader = readerIn(racyUnitFolderPath());

    // Act
    const branch = reader.read();

    // Assert
    expect(branch.changedFiles).toStrictEqual([
      {
        filePath: pathOf('src/order.ts'),
        lineRanges: [
          linesOf(1, 1),
        ],
      },
    ]);
  });

  it("should leave no scratch folder behind and the project's index as it was", () => {
    // Arrange
    const scratchFolderPath = mkdtempSync(join(outerFolderPath, 'scratch-'));
    const unitFolderPath = join(workspaceFolderPath, UNIT);

    // Act
    readerIn(unitFolderPath, scratchFolderPath).read();

    // Assert
    expect({
      scratchFiles: readdirSync(scratchFolderPath),
      untrackedText: git(unitFolderPath, 'ls-files', '--others', '--exclude-standard'),
    }).toStrictEqual({
      scratchFiles: [],
      untrackedText: 'src/line.ts\n',
    });
  });

  it.each([
    {
      causeCode: undefined,
      code: BranchFailure.ToolFailed,
      outputLimitBytes: OUTPUT_LIMIT_BYTES,
      timeoutMs: TIMEOUT_MS,
      toolFailedDetails: {
        mainlineName: 'origin/main',
        stderr: 'fatal: no main line',
      },
      toolFileName: 'git',
      toolScript: '#!/bin/sh\necho "fatal: no main line " >&2\nexit 128\n',
    },
    {
      causeCode: 'ENOENT',
      code: BranchFailure.ToolNotRun,
      outputLimitBytes: OUTPUT_LIMIT_BYTES,
      timeoutMs: TIMEOUT_MS,
      toolFailedDetails: {},
      toolFileName: 'not-git',
      toolScript: '#!/bin/sh\n',
    },
    {
      causeCode: 'ETIMEDOUT',
      code: BranchFailure.ToolTimedOut,
      outputLimitBytes: OUTPUT_LIMIT_BYTES,
      timeoutMs: 200,
      toolFailedDetails: {},
      toolFileName: 'git',
      toolScript: '#!/bin/sh\n/bin/sleep 5\n',
    },
    {
      causeCode: 'ENOBUFS',
      code: BranchFailure.OutputPastLimit,
      outputLimitBytes: 16,
      timeoutMs: TIMEOUT_MS,
      toolFailedDetails: {},
      toolFileName: 'git',
      toolScript: '#!/bin/sh\nprintf "%040d" 0\n',
    },
  ])(
    'should fail with its own code and the reason beneath when git ends as $code',
    async ({
      causeCode,
      code,
      outputLimitBytes,
      timeoutMs,
      toolFailedDetails,
      toolFileName,
      toolScript,
    }) => {
      // Arrange
      const binFolderPath = mkdtempSync(join(outerFolderPath, 'bin-'));

      writeFileSync(join(binFolderPath, toolFileName), toolScript, {
        mode: 0o755,
      });

      // Act
      const failure = await failureOf({
        call: () =>
          gitBranchReader({
            env: Object.fromEntries([
              [
                'PATH',
                binFolderPath,
              ],
            ]),
            outputLimitBytes,
            scratchFolderPath: AbsolutePath.create(outerFolderPath),
            timeoutMs,
            unitFolderPath: AbsolutePath.create(workspaceFolderPath),
          }).read(),
        kind: BranchError,
      });

      // Assert
      expect({
        causeCode: causeCodeOf(failure?.cause),
        details: failure?.details,
      }).toStrictEqual({
        causeCode,
        details: {
          code,
          command: {
            args: [
              'merge-base',
              'HEAD',
              'origin/main',
            ],
            folderPath: workspaceFolderPath,
            toolName: 'git',
          },
          ...toolFailedDetails,
        },
      });
    },
  );
});
