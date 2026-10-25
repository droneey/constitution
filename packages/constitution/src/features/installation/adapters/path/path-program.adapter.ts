import { spawnSync } from 'node:child_process';

import type { ChildProcessSettings } from '#/libs/child-process';

import type { ProgramPath } from '../../domain/contracts';

const OUTPUT_LIMIT_BYTES = 65_536;

/** env's PATH is searched; a program that does not answer within timeoutMs answers nothing. */
const createPathProgram = (input: ChildProcessSettings): ProgramPath => ({
  find: (name: string): string | undefined => Bun.which(name, input.env) ?? undefined,
  versionOf: (path: string): string | undefined => {
    const run = spawnSync(
      path,
      [
        '--version',
      ],
      {
        encoding: 'utf8',
        env: input.env,
        maxBuffer: OUTPUT_LIMIT_BYTES,
        timeout: input.timeoutMs,
      },
    );
    const answer = run.status === 0 ? run.stdout.trim() : '';

    return answer === '' ? undefined : answer;
  },
});

export { createPathProgram };
