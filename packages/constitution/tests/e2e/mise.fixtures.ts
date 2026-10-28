import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

import { toolEnvironment } from './package.fixtures';

const repository = join(import.meta.dir, '..', '..');

// mise pins the tool for this repository; its shim does not resolve in a
// temporary folder, so a check runs the binary it points to.
const miseBinary = (tool: string): string => {
  const binary = spawnSync(
    'mise',
    [
      'which',
      tool,
    ],
    {
      cwd: repository,
      encoding: 'utf8',
      env: toolEnvironment(),
    },
  ).stdout.trim();

  if (binary === '') {
    throw new Error(`${tool} is not installed: run \`mise install\` in a trusted checkout`);
  }

  return binary;
};

export { miseBinary };
