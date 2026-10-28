import { spawnSync } from 'node:child_process';

import type { CommandRunner } from '../../domain/contracts';

const SHELL = 'sh';
// A command a signal ended gives no code of its own; it counts as failed.
const NO_CODE = 1;

const createShellCommandRunner = (): CommandRunner => ({
  run: ({ command, folderPath }) =>
    spawnSync(
      SHELL,
      [
        '-c',
        command,
      ],
      {
        cwd: folderPath,
        // Stryker disable next-line StringLiteral: the output goes to the user's terminal, which no spec reads
        stdio: 'inherit',
      },
    ).status ?? NO_CODE,
});

export { createShellCommandRunner };
