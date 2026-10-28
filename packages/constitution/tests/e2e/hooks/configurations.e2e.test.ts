import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';

import { z } from 'zod';

import { cliPath } from '../cli.fixtures';
import { contextOf, HookEvent, runHook, warningLinesOf } from '../hook.fixtures';
import { toolEnvironment } from '../package.fixtures';
import {
  createRealPluginRoot,
  distributionOf,
  linkDistribution,
  removePluginRoots,
} from '../plugin-root.fixtures';
import { ConfigKey, configOf, createProject, removeProjects } from '../project.fixtures';

const repository = join(import.meta.dir, '..', '..', '..');
const CONFIGURATIONS = '- configurations: ';

let root = '';

// A project of TypeScript checked by Biome and run by Bun, whose biome.jsonc holds the files given.
const projectOf = (files: Readonly<Record<string, string>>): string =>
  createProject({
    config: configOf({
      [ConfigKey.Implementations]: '[biome, bun]',
      [ConfigKey.Languages]: '[typescript, json]',
    }),
    files,
  });

const configurationLinesOf = (project: string): readonly string[] =>
  warningLinesOf(
    contextOf(
      runHook({
        event: HookEvent.Startup,
        project,
        root,
      }),
    ),
  ).filter((line) => line.startsWith(CONFIGURATIONS));

/** @throws Error when the apply fails. */
const apply = (project: string): void => {
  linkDistribution({
    distribution: distributionOf(root),
    project,
  });

  const run = spawnSync(
    cliPath,
    [
      'presets',
      'apply',
      '--no-fix',
      '--plain',
    ],
    {
      cwd: project,
      encoding: 'utf8',
      env: toolEnvironment(),
    },
  );

  if (run.status !== 0) {
    throw new Error(`presets apply failed: ${run.stdout}${run.stderr}`);
  }
};

const distributionMap = z.record(z.string(), z.unknown());

// The release's distribution holds the presets beside the blocks, and the files its map packs,
// which stand empty here.
beforeAll(() => {
  root = createRealPluginRoot();
  cpSync(join(repository, 'presets'), join(distributionOf(root), 'presets'), {
    recursive: true,
  });

  const distributed = distributionMap.parse(
    JSON.parse(readFileSync(join(repository, 'distribution.json'), 'utf8')),
  );

  for (const file of Object.keys(distributed)) {
    mkdirSync(dirname(join(distributionOf(root), file)), {
      recursive: true,
    });
    writeFileSync(join(distributionOf(root), file), '');
  }
});

afterEach(() => {
  removeProjects();
});

afterAll(() => {
  removePluginRoots();
});

describe('the configurations of a project at session start', () => {
  it.each([
    {
      code: '[missing]',
      condition: 'its biome.jsonc lacks the settings the presets give',
      text: '{}\n',
    },
    {
      code: '[file-unparsed]',
      condition: 'its biome.jsonc does not parse',
      text: '{',
    },
  ])('should warn of biome.jsonc by $code when $condition', ({ code, text }) => {
    // Arrange
    const project = projectOf({
      'biome.jsonc': text,
    });

    // Act
    const lines = configurationLinesOf(project);

    // Assert
    expect(lines.some((line) => line.includes('biome.jsonc') && line.endsWith(code))).toBeTrue();
  });

  it('should warn of nothing in the presets when apply has written what the presets give', () => {
    // Arrange
    const project = projectOf({});

    apply(project);

    // Act
    const lines = configurationLinesOf(project);

    // Assert
    expect(lines).toStrictEqual([]);
  });
});
