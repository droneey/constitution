import { spawnSync } from 'node:child_process';

import type { WorkingTree } from '../../domain/contracts';

// A diff of a large tree runs past the 1 MiB that spawnSync keeps by default.
const OUTPUT_LIMIT_BYTES = 268_435_456;
const TIMEOUT_MS = 30_000;

// git's output, or nothing when it fails or finds no repository: the hooks read a tree as git
// reports it, and a tree it cannot report is the empty one.
const runGit = (input: {
  args: readonly string[];
  env: Readonly<Record<string, string>>;
  project: string;
}): {
  isDone: boolean;
  output: Uint8Array;
} => {
  const run = spawnSync('git', input.args, {
    cwd: input.project,
    env: input.env,
    maxBuffer: OUTPUT_LIMIT_BYTES,
    timeout: TIMEOUT_MS,
  });

  return {
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

const stateOf = (input: { env: Readonly<Record<string, string>>; project: string }): Uint8Array => {
  const { env, project } = input;
  const status = runGit({
    env,
    args: [
      'status',
      '--porcelain=v1',
      '--untracked-files=all',
    ],
    project,
  });

  if (!status.isDone) {
    return status.output;
  }

  const diff = runGit({
    env,
    args: [
      'diff',
      'HEAD',
    ],
    project,
  });
  const both = new Uint8Array(status.output.length + diff.output.length);

  both.set(status.output);
  both.set(diff.output, status.output.length);

  return both;
};

// env is the environment git runs in, built for it by the root.
const createGitWorkingTree = (input: { env: Readonly<Record<string, string>> }): WorkingTree => ({
  changedFiles: (project: string): readonly string[] => [
    ...linesOf(
      runGit({
        env: input.env,
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
        env: input.env,
        args: [
          'ls-files',
          '--others',
          '--exclude-standard',
        ],
        project,
      }).output,
    ),
  ],
  stateOf: (project: string): Uint8Array =>
    stateOf({
      env: input.env,
      project,
    }),
  trackedFiles: (tracked: { names: readonly string[]; project: string }): readonly string[] =>
    linesOf(
      runGit({
        env: input.env,
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
