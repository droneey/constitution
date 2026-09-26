import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const BASE = 'origin/main';
const LOGIC = /^src\/(?!entrypoints\/|root\/).+\.ts$/;
const SPEC = /^(.+)\/__tests__\/([^/]+?)(?:\.integration)?\.spec\.ts$/;
const TESTS = '/__tests__/';
const BUN_NODE = /bun-node-/;

const changed: readonly string[] = spawnSync(
  'git',
  [
    'diff',
    '--name-only',
    '--diff-filter=ACMR',
    BASE,
    '--',
    'src',
  ],
  {
    encoding: 'utf8',
  },
)
  .stdout.split('\n')
  .filter((path) => path !== '');

// A spec is named after the file it proves, so a changed spec mutates that
// file again: a weakened test must not pass unseen.
const proven = (path: string): readonly string[] => {
  const spec = SPEC.exec(path);

  if (spec !== null) {
    return [
      `${spec[1]}/${spec[2]}.ts`,
    ];
  }

  return path.includes(TESTS)
    ? []
    : [
        path,
      ];
};

const files = [
  ...new Set(changed.flatMap(proven)),
].filter((path) => LOGIC.test(path) && existsSync(path));
const everything = process.argv.includes('all');

// Stryker runs on Node: under Bun its code generator fails, and `bun run`
// puts a node that is Bun first on the PATH.
const env: NodeJS.ProcessEnv = {
  ...process.env,
};

env['PATH'] = (process.env['PATH'] ?? '')
  .split(':')
  .filter((entry) => !BUN_NODE.test(entry))
  .join(':');

if (!everything && files.length === 0) {
  process.stdout.write('mutation: no logic changed\n');
} else {
  const run = spawnSync(
    'stryker',
    everything
      ? [
          'run',
        ]
      : [
          'run',
          '--mutate',
          files.join(','),
        ],
    {
      env,
      stdio: 'inherit',
    },
  );

  process.exitCode = run.status ?? 1;
}
