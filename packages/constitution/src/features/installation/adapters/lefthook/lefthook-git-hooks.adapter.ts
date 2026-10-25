import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import type { GitHooks } from '../../domain/contracts';
import { HooksState } from '../../domain/entities';

const configFiles: readonly string[] = [
  '',
  '.',
  '.config/',
].flatMap((prefix) =>
  [
    'yml',
    'yaml',
    'json',
    'jsonc',
    'toml',
  ].map((extension) => `${prefix}lefthook.${extension}`),
);

/** A lefthook that cannot start, or does not answer within timeoutMs, is unavailable. */
const createLefthookGitHooks = (input: {
  env: Readonly<Record<string, string>>;
  timeoutMs: number;
}): GitHooks => ({
  stateOf: (project: string): HooksState => {
    if (!configFiles.some((name) => existsSync(join(project, name)))) {
      return HooksState.Unconfigured;
    }

    const run = spawnSync(
      'lefthook',
      [
        'check-install',
      ],
      {
        cwd: project,
        env: input.env,
        timeout: input.timeoutMs,
      },
    );

    if (run.error !== undefined) {
      return HooksState.Unavailable;
    }

    return run.status === 0 ? HooksState.Installed : HooksState.Missing;
  },
});

export { createLefthookGitHooks };
