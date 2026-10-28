import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

import { toolEnvironment } from './package.fixtures';

const repository = join(import.meta.dir, '..', '..');

// mise finds its installs, its settings and the configs it trusts through these variables as well
// as through its files at home; a CI runner sets them in place of the files.
const MISE_VARIABLE = /^(MISE|XDG)_/u;

/** The machine's own variables mise reads, by their names. */
const miseVariables = (): ReadonlyMap<string, string> =>
  new Map(
    Object.entries(process.env).flatMap(([name, setting]) =>
      MISE_VARIABLE.test(name) && setting !== undefined
        ? [
            [
              name,
              setting,
            ] as const,
          ]
        : [],
    ),
  );

// mise pins the tool for this repository; its shim does not resolve in a
// temporary folder, so a check runs the binary it points to.
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
      env: toolEnvironment(miseVariables()),
    },
  );
  const binary = run.stdout.trim();

  if (binary === '') {
    throw new Error(
      `${tool} is not installed: run \`mise install\` in a trusted checkout\n${run.stderr}`,
    );
  }

  return binary;
};

export { miseBinary };
