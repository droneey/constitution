import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';

import { z } from 'zod';

import { cliPath } from '../cli.fixtures';
import { contextOf, HookEvent, runHook, warningLinesOf } from '../hook.fixtures';
import {
  archiveOf,
  createRealPluginRoot,
  linkArchive,
  removePluginRoots,
} from '../plugin-root.fixtures';
import { ConfigKey, configOf, createProject, removeProjects } from '../project.fixtures';

const repository = join(import.meta.dir, '..', '..', '..');
const CONFIGURATIONS = '- configurations: ';

let root = '';

// A project of TypeScript checked by Biome and run by Bun, whose biome.json holds the files given.
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
  linkArchive({
    archive: archiveOf(root),
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
      env: Object.fromEntries([
        [
          'PATH',
          process.env['PATH'],
        ],
      ]),
    },
  );

  if (run.status !== 0) {
    throw new Error(`presets apply failed: ${run.stdout}${run.stderr}`);
  }
};

const manifest = z.looseObject({
  release: z.record(z.string(), z.unknown()),
});

// The release's archive holds the presets beside the blocks, and the files its build makes, which
// stand empty here.
beforeAll(() => {
  root = createRealPluginRoot();
  cpSync(join(repository, 'presets'), join(archiveOf(root), 'presets'), {
    recursive: true,
  });

  const { release } = manifest.parse(
    JSON.parse(readFileSync(join(repository, 'package.json'), 'utf8')),
  );

  for (const file of Object.keys(release)) {
    mkdirSync(dirname(join(archiveOf(root), file)), {
      recursive: true,
    });
    writeFileSync(join(archiveOf(root), file), '');
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
      condition: 'its biome.json lacks the settings the presets give',
      text: '{}\n',
    },
    {
      code: '[file-unparsed]',
      condition: 'its biome.json does not parse',
      text: '{',
    },
  ])('should warn of biome.json by $code when $condition', ({ code, text }) => {
    // Arrange
    const project = projectOf({
      'biome.json': text,
    });

    // Act
    const lines = configurationLinesOf(project);

    // Assert
    expect(lines.some((line) => line.includes('biome.json') && line.endsWith(code))).toBeTrue();
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
