#!/usr/bin/env bun
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { branchIn } from './branch.ts';
import { mutateTargets } from './changes.ts';
import { importsOf, loaderOf } from './imports.ts';

const CONFIG_FILES = [
  'stryker.config.mjs',
  'stryker.config.js',
  'stryker.config.json',
];

// A change that only reformats leaves the transpiled code as it was, so it gives no mutant.
const codeChanged = (input: { baseText: (path: string) => string; path: string }): boolean => {
  const loader = loaderOf(input.path);

  if (loader === undefined) {
    return true;
  }

  const transpiler = new Bun.Transpiler({
    loader,
  });

  return (
    transpiler.transformSync(input.baseText(input.path)) !==
    transpiler.transformSync(readFileSync(input.path, 'utf8'))
  );
};

const mutatePatterns = (config: unknown): readonly string[] => {
  const mutate =
    typeof config === 'object' && config !== null && 'mutate' in config ? config.mutate : undefined;

  return Array.isArray(mutate) && mutate.every((pattern) => typeof pattern === 'string')
    ? mutate
    : [];
};

const loadConfig = async (): Promise<unknown> => {
  const file = CONFIG_FILES.find((name) => existsSync(name));

  if (file === undefined) {
    throw new Error(`mutation-check: no Stryker configuration (${CONFIG_FILES.join(', ')})`);
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
  const branch = branchIn(process.cwd());
  const targets = mutateTargets({
    codeChanged: (path) =>
      codeChanged({
        baseText: branch.baseText,
        path,
      }),
    diff: branch.diff,
    exists: existsSync,
    importsOf,
    mutate: mutatePatterns(await loadConfig()),
    untracked: branch.untracked,
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
