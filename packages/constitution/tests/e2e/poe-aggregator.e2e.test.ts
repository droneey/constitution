import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'bun:test';

import { appliedUnit } from './applied-unit.fixtures';
import { searchPathWith, toolEnvironment } from './package.fixtures';
import { uvBinary, uvEnvironment } from './uv.fixtures';

const MARKS = 'ran.txt';

const appliedProject = appliedUnit({
  implementations: [
    'poe',
  ],
  languages: [
    'python',
    'toml',
  ],
});

const created: string[] = [];

afterEach(() => {
  for (const folder of created.splice(0)) {
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
});

const projectWith = (tasks: Readonly<Record<string, string>>): string => {
  const folder = mkdtempSync(join(tmpdir(), 'poe-aggregator-'));

  created.push(folder);
  cpSync(join(appliedProject, 'pyproject.toml'), join(folder, 'pyproject.toml'));
  writeFileSync(
    join(folder, 'pyproject.toml'),
    `${readFileSync(join(folder, 'pyproject.toml'), 'utf8')}\n${Object.entries(tasks)
      .map(([name, command]) => `[tool.poe.tasks."${name}"]\nshell = "${command}"\n`)
      .join('\n')}`,
  );

  return folder;
};

const poeIn = (folder: string, task: string) =>
  spawnSync(
    uvBinary('poe'),
    [
      task,
    ],
    {
      cwd: folder,
      encoding: 'utf8',
      env: toolEnvironment(
        new Map([
          [
            'PATH',
            searchPathWith(join(uvEnvironment, 'bin')),
          ],
        ]),
      ),
    },
  );

const marksIn = (folder: string): string => {
  try {
    return readFileSync(join(folder, MARKS), 'utf8');
  } catch {
    return '';
  }
};

describe("poe's task that runs an action", () => {
  it('should run every task of its prefix in the order of their names, and none of another action', () => {
    // Arrange
    const folder = projectWith({
      'check:b': `echo b >> ${MARKS}`,
      'check:a': `echo a >> ${MARKS}`,
      'fix:c': `echo c >> ${MARKS}`,
      'test:d': `echo d >> ${MARKS}`,
    });

    // Act
    const run = poeIn(folder, 'check');

    // Assert
    expect({
      marks: marksIn(folder),
      status: run.status,
    }).toStrictEqual({
      marks: 'a\nb\n',
      status: 0,
    });
  });

  it('should stop at the first task that fails', () => {
    // Arrange
    const folder = projectWith({
      'check:a': 'exit 3',
      'check:b': `echo b >> ${MARKS}`,
    });

    // Act
    const run = poeIn(folder, 'check');

    // Assert
    expect({
      failed: run.status !== 0,
      marks: marksIn(folder),
    }).toStrictEqual({
      failed: true,
      marks: '',
    });
  });

  it('should run nothing and pass where no task has its prefix', () => {
    // Arrange
    const folder = projectWith({
      'check:a': `echo a >> ${MARKS}`,
    });

    // Act
    const run = poeIn(folder, 'fix');

    // Assert
    expect({
      marks: marksIn(folder),
      status: run.status,
    }).toStrictEqual({
      marks: '',
      status: 0,
    });
  });
});
