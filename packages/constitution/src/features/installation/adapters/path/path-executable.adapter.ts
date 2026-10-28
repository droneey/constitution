import { spawnSync } from 'node:child_process';

import { AbsolutePath } from '#/kernel/value-objects';
import type { ChildProcessSettings } from '#/libs/child-process';

import type { ExecutablePath } from '../../domain/contracts';

const OUTPUT_LIMIT_BYTES = 65_536;

const createPathExecutable = (input: ChildProcessSettings): ExecutablePath => ({
  find: (name: string): AbsolutePath | undefined => {
    const found = Bun.which(name, input.env);

    return found === null ? undefined : AbsolutePath.create(found);
  },
  versionOf: (path: AbsolutePath): string | undefined => {
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

export { createPathExecutable };
