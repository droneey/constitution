import { spawnSync } from 'node:child_process';

import type { TreeState, WorkingTree } from '#/kernel/contracts';
import { TreeStateStatus } from '#/kernel/contracts';
import { WorkingTreeError, WorkingTreeFailure } from '#/kernel/errors';

// A diff of a large tree runs past the 1 MiB that spawnSync keeps by default.
const OUTPUT_LIMIT_BYTES = 268_435_456;

interface Git {
  readonly env: Readonly<Record<string, string>>;
  readonly timeoutMs: number;
}

interface GitRun {
  /** why git gave no answer: the failure to start or to finish it, or what it wrote of its error */
  readonly cause: unknown;
  readonly isDone: boolean;
  readonly output: Uint8Array;
}

// git's output, empty when it fails, finds no repository or does not answer within its time.
const runGit = (
  input: Git & {
    args: readonly string[];
    project: string;
  },
): GitRun => {
  const run = spawnSync('git', input.args, {
    cwd: input.project,
    env: input.env,
    maxBuffer: OUTPUT_LIMIT_BYTES,
    timeout: input.timeoutMs,
  });

  return {
    cause:
      run.error ??
      new WorkingTreeError({
        code: WorkingTreeFailure.GitFailed,
        details: {
          stderr: new TextDecoder().decode(new Uint8Array(run.stderr)),
        },
      }),
    isDone: run.status === 0,
    // Bun leaves stdout undefined when git cannot start, which makes an empty array
    output: new Uint8Array(run.stdout),
  };
};

const linesOf = (output: Uint8Array): readonly string[] =>
  new TextDecoder()
    .decode(output)
    .split('\n')
    .filter((line) => line !== '');

// The status, then the diff from HEAD, which a repository with no commit yet lacks.
const stateOf = (
  input: Git & {
    project: string;
  },
): TreeState => {
  const { project } = input;
  const status = runGit({
    ...input,
    args: [
      'status',
      '--porcelain=v1',
      '--untracked-files=all',
    ],
    project,
  });

  if (!status.isDone) {
    return {
      cause: status.cause,
      status: TreeStateStatus.Unavailable,
    };
  }

  const diff = runGit({
    ...input,
    args: [
      'diff',
      'HEAD',
    ],
    project,
  });
  const both = new Uint8Array(status.output.length + diff.output.length);

  both.set(status.output);
  both.set(diff.output, status.output.length);

  return {
    bytes: both,
    status: TreeStateStatus.Read,
  };
};

/** timeoutMs bounds each run of git. */
const createGitWorkingTree = (input: Git): WorkingTree => ({
  changedFiles: (project: string): readonly string[] => [
    ...linesOf(
      runGit({
        ...input,
        args: [
          'diff',
          '--name-only',
          'HEAD',
        ],
        project,
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
        project,
      }).output,
    ),
  ],
  stateOf: (project: string): TreeState =>
    stateOf({
      ...input,
      project,
    }),
  trackedFiles: (tracked: { names: readonly string[]; project: string }): readonly string[] =>
    linesOf(
      runGit({
        ...input,
        args: [
          '-c',
          'core.quotePath=false',
          'ls-files',
          '--cached',
          '--',
          ...tracked.names.map((name) => `:(glob)**/${name}`),
        ],
        project: tracked.project,
      }).output,
    ),
});

export { createGitWorkingTree };
