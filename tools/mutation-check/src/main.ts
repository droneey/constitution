#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { mutateTargets } from './changes.ts';

interface StrykerConfig {
  mutate?: readonly string[];
}

const BASE = 'origin/main';

const CONFIG_FILES = [
  'stryker.config.mjs',
  'stryker.config.js',
  'stryker.config.json',
];

const git = (args: readonly string[]): string =>
  spawnSync('git', args, {
    encoding: 'utf8',
  }).stdout;

const loadConfig = async (): Promise<StrykerConfig> => {
  const file = CONFIG_FILES.find((name) => existsSync(name));

  if (file === undefined) {
    throw new Error(
      `mutation-check: no Stryker configuration (${CONFIG_FILES.join(', ')})`,
    );
  }

  return file.endsWith('.json')
    ? (JSON.parse(readFileSync(file, 'utf8')) as StrykerConfig)
    : (
        (await import(pathToFileURL(resolve(file)).href)) as {
          default: StrykerConfig;
        }
      ).default;
};

const runStryker = (args: readonly string[]): number =>
  spawnSync(
    'stryker',
    [
      'run',
      ...args,
    ],
    {
      stdio: 'inherit',
    },
  ).status ?? 1;

if (process.argv.includes('all')) {
  process.exitCode = runStryker([]);
} else {
  const targets = mutateTargets({
    diff: git([
      'diff',
      '-U0',
      '--no-color',
      '--diff-filter=ACMR',
      BASE,
    ]),
    exists: existsSync,
    mutate: (await loadConfig()).mutate ?? [],
    untracked: git([
      'ls-files',
      '--others',
      '--exclude-standard',
    ])
      .split('\n')
      .filter((path) => path !== ''),
  });

  if (targets.length === 0) {
    process.stdout.write('mutation: no line to mutate changed\n');
  } else {
    process.exitCode = runStryker([
      '--mutate',
      targets.join(','),
    ]);
  }
}
