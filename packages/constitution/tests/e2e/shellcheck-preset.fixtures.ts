import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

import { z } from 'zod';

import { miseBinary } from './mise.fixtures';

interface Analysis {
  codes: readonly number[];
  exitCode: number | undefined;
}

const SHELLCHECK_REPORT = z.array(
  z.object({
    code: z.number(),
  }),
);

const REPOSITORY = join(import.meta.dir, '..', '..');
const SHELLCHECK_RC = join(
  REPOSITORY,
  'presets',
  'shell',
  'shellcheck',
  'foundation',
  'self.shellcheckrc',
);
const SHELLCHECK = miseBinary('shellcheck');

// The project copies the archive's rc to .shellcheckrc; the spec points at it.
const analyseScript = (text: string): Analysis => {
  const run = spawnSync(
    SHELLCHECK,
    [
      '--rcfile',
      SHELLCHECK_RC,
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
      ...new Set(SHELLCHECK_REPORT.parse(JSON.parse(run.stdout)).map(({ code }) => code)),
    ].toSorted((left, right) => left - right),
    exitCode: run.status ?? undefined,
  };
};

export { analyseScript };
