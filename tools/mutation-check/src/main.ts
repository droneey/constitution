#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { mutateTargets } from './changes.ts';

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

const mutatePatterns = (config: unknown): readonly string[] => {
  const mutate =
    typeof config === 'object' && config !== null && 'mutate' in config
      ? config.mutate
      : undefined;

  return Array.isArray(mutate) &&
    mutate.every((pattern) => typeof pattern === 'string')
    ? mutate
    : [];
};

const loadConfig = async (): Promise<unknown> => {
  const file = CONFIG_FILES.find((name) => existsSync(name));

  if (file === undefined) {
    throw new Error(
      `mutation-check: no Stryker configuration (${CONFIG_FILES.join(', ')})`,
    );
  }

  if (file.endsWith('.json')) {
    return JSON.parse(readFileSync(file, 'utf8'));
  }

  const module: unknown = await import(pathToFileURL(resolve(file)).href);

  return typeof module === 'object' && module !== null && 'default' in module
    ? module.default
    : undefined;
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
    mutate: mutatePatterns(await loadConfig()),
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
