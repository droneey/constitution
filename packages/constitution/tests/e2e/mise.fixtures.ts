import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

import { machineVariables, toolEnvironment } from './package.fixtures';

const repository = join(import.meta.dir, '..', '..');

// Why: mise finds its installs and the configs it trusts through these variables as well as through
// its files at home; a CI runner sets them in place of the files.
const MISE_VARIABLES = [
  'MISE_CACHE_DIR',
  'MISE_CONFIG_DIR',
  'MISE_DATA_DIR',
  'MISE_STATE_DIR',
  'MISE_TRUSTED_CONFIG_PATHS',
  'XDG_CACHE_HOME',
  'XDG_CONFIG_HOME',
  'XDG_DATA_HOME',
  'XDG_STATE_HOME',
] as const;

// Why: mise's shim does not resolve in a temporary folder, so a check runs the binary it points to.
const miseBinary = (tool: string): string => {
  const run = spawnSync(
    'mise',
    [
      'which',
      tool,
    ],
    {
      cwd: repository,
      encoding: 'utf8',
      env: toolEnvironment(machineVariables(MISE_VARIABLES)),
    },
  );

  if (run.error !== undefined || run.status !== 0) {
    throw new Error(`mise which ${tool} failed: ${run.error?.message ?? run.stderr}`);
  }

  return run.stdout.trim();
};

export { miseBinary };
