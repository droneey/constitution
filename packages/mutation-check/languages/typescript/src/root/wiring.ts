import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { mutateTargets } from '#/features/targets';
import { branchIn } from '#/libs/git';
import { codeChanged } from '#/libs/imports';

import { strykerConfigurationIn } from './configuration.ts';
import { ExitCode } from './exit-codes.ts';

const GIT_TIMEOUT_MS = 60_000;
// Three hours: a whole mutation run is one command, so the bound is the longest run a project may take.
const STRYKER_TIMEOUT_MS = 10_800_000;

interface MutationCheckInput {
  readonly args: readonly string[];
  // the environment git and Stryker run with, built for them
  readonly env: Readonly<Record<string, string>>;
  readonly folder: string;
  readonly write: (text: string) => void;
}

/**
 * Runs Stryker on the lines a change touches, or on everything given `all`.
 *
 * @throws {@link GitError} when git does not give the change.
 * @throws {@link ConfigurationError} when the Stryker configuration is missing or malformed.
 */
const runMutationCheck = async (input: MutationCheckInput): Promise<number> => {
  const runStryker = (args: readonly string[]): number =>
    spawnSync(
      'stryker',
      [
        'run',
        ...args,
      ],
      {
        cwd: input.folder,
        env: input.env,
        stdio: 'inherit',
        timeout: STRYKER_TIMEOUT_MS,
      },
    ).status ?? ExitCode.Stopped;

  if (input.args.includes('all')) {
    return runStryker([]);
  }

  const { mutate } = await strykerConfigurationIn(input.folder);
  const branch = branchIn({
    env: input.env,
    folder: input.folder,
    timeoutMs: GIT_TIMEOUT_MS,
  });
  const targets = mutateTargets({
    codeChanged: (path) =>
      codeChanged({
        after: readFileSync(join(input.folder, path), 'utf8'),
        before: branch.baseText(path),
        path,
      }),
    diff: branch.diff,
    mutate,
    untracked: branch.untracked,
  });

  if (targets.length === 0) {
    input.write('mutation: no line to mutate changed\n');

    return ExitCode.Success;
  }

  return runStryker([
    '--mutate',
    targets.join(','),
  ]);
};

export type { MutationCheckInput };
export { runMutationCheck };
