import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { miseBinary } from './mise.fixtures';
import { toolEnvironment } from './package.fixtures';
import { widestAppliedUnit } from './preset-load.fixtures';

const shellcheck = miseBinary('shellcheck');

const RC_FILE = '.shellcheckrc';
const ENABLED = /^enable=(.+)$/gm;
const OPTIONAL = /^name:\s+(\S+)$/gm;

const unknownChecks = (): readonly string[] => {
  const listed = new Set(
    [
      ...spawnSync(
        shellcheck,
        [
          '--list-optional',
        ],
        {
          encoding: 'utf8',
          env: toolEnvironment(),
        },
      ).stdout.matchAll(OPTIONAL),
    ].map(([, name]) => name),
  );

  return [
    ...readFileSync(join(widestAppliedUnit('shellcheck'), RC_FILE), 'utf8').matchAll(ENABLED),
  ]
    .map(([, name]) => String(name))
    .filter((name) => !listed.has(name));
};

export { unknownChecks };
