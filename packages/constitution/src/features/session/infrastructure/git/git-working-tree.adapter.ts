import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

import type { AbsolutePath } from '#/kernel/value-objects';
import { RepositoryRelativePath } from '#/kernel/value-objects';
import type { ChildProcessSettings } from '#/libs/child-process';

import type { TreeState, WorkingTree } from '../../application/contracts';
import { TreeStateStatus } from '../../application/contracts';
import { TreeFingerprint } from '../../domain/value-objects';
import { gitEndedMessage } from './git-working-tree.messages';

// Why: a diff of a large tree runs past the 1 MiB that spawnSync keeps by default.
const OUTPUT_LIMIT_BYTES = 268_435_456;

// Why: git words what it finds in no repository so, in the C locale it is run in.
const NO_REPOSITORY = 'fatal: not a git repository';
const cLocale: Readonly<Record<string, string>> = Object.fromEntries([
  [
    'LC_ALL',
    'C',
  ],
]);

interface GitRun {
  readonly failure?: string;
  readonly output: Uint8Array;
}

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
  // Why: Bun leaves stdout and stderr undefined when git cannot start, which make empty arrays.
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

const createGitWorkingTree = (input: ChildProcessSettings): WorkingTree => ({
  changedAndUntrackedFiles: (
    repositoryFolderPath: AbsolutePath,
  ): readonly RepositoryRelativePath[] =>
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
