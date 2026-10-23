import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';

import { CLI_PATH } from './cli.fixtures';
import {
  archiveOf,
  createPluginRoot,
  linkArchive,
  removePluginRoots,
} from './plugin-root.fixtures';
import { CLI, createProject, removeProjects } from './project.fixtures';

interface CheckRun {
  exitCode: number | undefined;
  stderr: string;
  stdout: string;
}

// What a project of its own that uses bunli keeps in its folder: each file, once loaded, leaves a
// mark beside it.
const BUNLI_CONFIG = 'bunli.config.ts';
const BUNLI_GENERATED = '.bunli/commands.gen.ts';
const CONFIG_MARK = 'bunli-config-loaded';
const GENERATED_MARK = 'bunli-generated-loaded';

const markingModule = (input: { mark: string; project: string }): string =>
  [
    `await Bun.write(${JSON.stringify(join(input.project, input.mark))}, 'loaded');`,
    "export default { name: 'theirs', version: '9.9.9', plugins: [] };",
    '',
  ].join('\n');

const check = (project: string): CheckRun => {
  const run = spawnSync(
    CLI_PATH,
    [
      'check',
    ],
    {
      cwd: project,
      encoding: 'utf8',
      env: Object.fromEntries([
        [
          'PATH',
          process.env['PATH'] ?? '',
        ],
      ]),
    },
  );

  return {
    exitCode: run.status ?? undefined,
    stderr: run.stderr,
    stdout: run.stdout,
  };
};

let root = '';

beforeAll(() => {
  root = createPluginRoot();
});

afterEach(() => {
  removeProjects();
});

afterAll(() => {
  removePluginRoots();
});

describe('constitution check', () => {
  it('should check a project the same way and load none of its files when the project keeps a bunli configuration of its own', () => {
    // Arrange
    const project = createProject(CLI);

    linkArchive({
      archive: archiveOf(root),
      project,
    });

    const plain = check(project);

    mkdirSync(join(project, '.bunli'));
    writeFileSync(
      join(project, BUNLI_CONFIG),
      markingModule({
        mark: CONFIG_MARK,
        project,
      }),
    );
    writeFileSync(
      join(project, BUNLI_GENERATED),
      markingModule({
        mark: GENERATED_MARK,
        project,
      }),
    );

    // Act
    const beside = check(project);

    // Assert
    expect({
      marks: [
        existsSync(join(project, CONFIG_MARK)),
        existsSync(join(project, GENERATED_MARK)),
      ],
      run: beside,
    }).toStrictEqual({
      marks: [
        false,
        false,
      ],
      run: plain,
    });
  });
});
