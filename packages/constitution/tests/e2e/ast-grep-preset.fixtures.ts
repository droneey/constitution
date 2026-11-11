import { spawnSync } from 'node:child_process';

import { miseBinary } from './mise.fixtures';
import { toolEnvironment } from './package.fixtures';
import { widestAppliedUnit } from './preset-load.fixtures';

interface Scan {
  readonly errors: string;
  readonly status: number | undefined;
}

const astGrep = miseBinary('ast-grep');
// Why: a scan that hangs fails its own case, before the runner's limit of the case, instead of the
// whole run.
const SCAN_TIMEOUT_MS = 20_000;
// Why: the presets leave a manifest's own fields to the unit, which the rules of a manifest ask for.
const MANIFEST = '{ "type": "module", "engines": { "bun": ">=1.3" } }\n';

const scanOfWidestUnit = (): Scan => {
  const scanning = spawnSync(
    astGrep,
    [
      'scan',
    ],
    {
      cwd: widestAppliedUnit('ast-grep', {
        files: {
          'package.json': MANIFEST,
        },
      }),
      encoding: 'utf8',
      env: toolEnvironment(),
      timeout: SCAN_TIMEOUT_MS,
    },
  );

  return {
    errors: scanning.stderr,
    status: scanning.status ?? undefined,
  };
};

export { scanOfWidestUnit };
