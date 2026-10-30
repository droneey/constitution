import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import type { AbsolutePath } from '#/kernel/value-objects';
import type { ChildProcessSettings } from '#/libs/child-process';

import type { GitHooks } from '../../application/contracts';
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

const createLefthookGitHooks = (input: ChildProcessSettings): GitHooks => ({
  stateOf: (repositoryFolderPath: AbsolutePath): HooksState => {
    if (!configFiles.some((name) => existsSync(join(repositoryFolderPath, name)))) {
      return HooksState.Unconfigured;
    }

    const run = spawnSync(
      'lefthook',
      [
        'check-install',
      ],
      {
        cwd: repositoryFolderPath,
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
