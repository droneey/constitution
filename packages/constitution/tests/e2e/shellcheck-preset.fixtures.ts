import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

import { z } from 'zod';

import { miseBinary } from './mise.fixtures';

interface Analysis {
  codes: readonly number[];
  exitCode: number | undefined;
}

const shellcheckReport = z.array(
  z.object({
    code: z.number(),
  }),
);

const repository = join(import.meta.dir, '..', '..');
const shellcheckRc = join(
  repository,
  'presets',
  'shell',
  'shellcheck',
  'foundation',
  'self.shellcheckrc',
);
const shellcheck = miseBinary('shellcheck');

// The project copies the archive's rc to .shellcheckrc; the spec points at it.
const analyseScript = (text: string): Analysis => {
  const run = spawnSync(
    shellcheck,
    [
      '--rcfile',
      shellcheckRc,
      '--format=json',
      '-',
    ],
    {
      encoding: 'utf8',
      input: text,
    },
  );

  return {
    codes: [
      ...new Set(shellcheckReport.parse(JSON.parse(run.stdout)).map(({ code }) => code)),
    ].toSorted((left, right) => left - right),
    exitCode: run.status ?? undefined,
  };
};

export { analyseScript };
