import { spawnSync } from 'node:child_process';

import type { AbsolutePath } from '#/kernel/value-objects';
import type { ChildProcessSettings } from '#/libs/child-process';

import { gitEndedMessage } from './git-working-tree.messages';

// Why: the index's listing of a large tree runs past the 1 MiB that spawnSync keeps by default.
const OUTPUT_LIMIT_BYTES = 268_435_456;

const cLocale: Readonly<Record<string, string>> = Object.fromEntries([
  [
    'LC_ALL',
    'C',
  ],
]);
// Why: a status refreshes the index under its lock, which fails the user's own git commands that
// write the index meanwhile, unless optional locks are off.
const NO_OPTIONAL_LOCKS = '--no-optional-locks';

enum GitRunStatus {
  Ran = 'ran',
  Failed = 'failed',
}

type GitRun =
  | {
      readonly output: Uint8Array;
      readonly status: GitRunStatus.Ran;
    }
  | {
      readonly exitCode: number | undefined;
      readonly failure: string;
      readonly status: GitRunStatus.Failed;
    };

type GitRunInput = ChildProcessSettings & {
  readonly repositoryFolderPath: AbsolutePath;
};

interface GitArguments {
  readonly args: readonly string[];
  readonly stdin?: string;
}

const runGit = (input: GitRunInput & GitArguments): GitRun => {
  const run = spawnSync(
    'git',
    [
      NO_OPTIONAL_LOCKS,
      ...input.args,
    ],
    {
      cwd: input.repositoryFolderPath,
      env: {
        ...input.env,
        ...cLocale,
      },
      input: input.stdin,
      maxBuffer: OUTPUT_LIMIT_BYTES,
      timeout: input.timeoutMs,
    },
  );

  if (run.status === 0) {
    return {
      output: run.stdout,
      status: GitRunStatus.Ran,
    };
  }

  const said = run.error?.message ?? new TextDecoder().decode(run.stderr).trim();

  return {
    exitCode: run.status ?? undefined,
    failure: said === '' ? gitEndedMessage(String(run.status ?? run.signal)) : said,
    status: GitRunStatus.Failed,
  };
};

export type { GitRunInput };
export { GitRunStatus, runGit };
