import { spawnSync } from 'node:child_process';

import type { CommandRunner } from '../../application/contracts';

const SHELL = 'sh';
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
