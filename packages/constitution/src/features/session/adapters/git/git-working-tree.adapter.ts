import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

import type { AbsolutePath } from '#/kernel/value-objects';
import { RepositoryRelativePath } from '#/kernel/value-objects';
import type { ChildProcessSettings } from '#/libs/child-process';

import type { TreeState, WorkingTree } from '../../domain/contracts';
import { TreeStateStatus } from '../../domain/contracts';
import { TreeFingerprint } from '../../domain/value-objects';
import { gitEndedMessage } from './git-working-tree.messages';

// A diff of a large tree runs past the 1 MiB that spawnSync keeps by default.
const OUTPUT_LIMIT_BYTES = 268_435_456;

// git words what it finds in no repository so, in the C locale it is run in.
const NO_REPOSITORY = 'fatal: not a git repository';
const cLocale: Readonly<Record<string, string>> = Object.fromEntries([
  [
    'LC_ALL',
    'C',
  ],
]);

interface GitRun {
  /**
   * why git gave no answer: the failure to start or to finish it, what it wrote of its error, or
   * the status it ended with; absent when it answered
   */
  readonly failure?: string;
  readonly output: Uint8Array;
}

// git's output, empty when it fails, finds no repository or does not answer within its time.
const runGit = (
  input: ChildProcessSettings & {
    args: readonly string[];
    repositoryFolderPath: AbsolutePath;
  },
): GitRun => {
  const run = spawnSync('git', input.args, {
    cwd: input.repositoryFolderPath,
    env: {
      ...input.env,
      ...cLocale,
    },
    maxBuffer: OUTPUT_LIMIT_BYTES,
    timeout: input.timeoutMs,
  });
  // Bun leaves stdout and stderr undefined when git cannot start, which make empty arrays
  const output = new Uint8Array(run.stdout);

  if (run.status === 0) {
    return {
      output,
    };
  }

  const said = run.error?.message ?? new TextDecoder().decode(new Uint8Array(run.stderr)).trim();

  return {
    failure: said === '' ? gitEndedMessage(String(run.status ?? run.signal)) : said,
    output,
  };
};

const linesOf = (output: Uint8Array): readonly string[] =>
  new TextDecoder()
    .decode(output)
    .split('\n')
    .filter((line) => line !== '');

// The status, then the diff from HEAD, which a repository with no commit yet lacks.
const stateOf = (
  input: ChildProcessSettings & {
    repositoryFolderPath: AbsolutePath;
  },
): TreeState => {
  const { repositoryFolderPath } = input;
  const status = runGit({
    ...input,
    args: [
      'status',
      '--porcelain=v1',
      '--untracked-files=all',
    ],
    repositoryFolderPath,
  });

  if (status.failure?.startsWith(NO_REPOSITORY) === true) {
    return {
      status: TreeStateStatus.NoRepository,
    };
  }

  if (status.failure !== undefined) {
    return {
      reason: status.failure,
      status: TreeStateStatus.Failed,
    };
  }

  const diff = runGit({
    ...input,
    args: [
      'diff',
      'HEAD',
    ],
    repositoryFolderPath,
  });

  return {
    fingerprint: TreeFingerprint.create(
      createHash('sha256').update(status.output).update(diff.output).digest('hex'),
    ),
    status: TreeStateStatus.Read,
  };
};

/** timeoutMs bounds each run of git. */
const createGitWorkingTree = (input: ChildProcessSettings): WorkingTree => ({
  changedFiles: (repositoryFolderPath: AbsolutePath): readonly RepositoryRelativePath[] =>
    [
      ...linesOf(
        runGit({
          ...input,
          args: [
            'diff',
            '--name-only',
            'HEAD',
          ],
          repositoryFolderPath,
        }).output,
      ),
      ...linesOf(
        runGit({
          ...input,
          args: [
            'ls-files',
            '--others',
            '--exclude-standard',
          ],
          repositoryFolderPath,
        }).output,
      ),
    ].map(RepositoryRelativePath.create),
  stateOf: (repositoryFolderPath: AbsolutePath): TreeState =>
    stateOf({
      ...input,
      repositoryFolderPath,
    }),
});

export { createGitWorkingTree };
