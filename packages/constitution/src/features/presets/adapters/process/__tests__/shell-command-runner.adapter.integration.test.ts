import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { AbsolutePath } from '#/kernel/value-objects';

import { createShellCommandRunner } from '../shell-command-runner.adapter';

let folder = '';

beforeEach(() => {
  folder = mkdtempSync(join(tmpdir(), 'command-runner-'));
});

afterEach(() => {
  rmSync(folder, {
    force: true,
    recursive: true,
  });
});

describe('createShellCommandRunner', () => {
  it('should run the command through the shell in the folder and give its exit code', () => {
    // Act
    const code = createShellCommandRunner().run({
      command: 'pwd > where.txt && exit 3',
      folderPath: AbsolutePath.create(folder),
    });

    // Assert
    expect({
      code,
      where: readFileSync(join(folder, 'where.txt'), 'utf8')
        .trim()
        .endsWith(folder.split('/').at(-1) ?? ''),
    }).toStrictEqual({
      code: 3,
      where: true,
    });
  });

  it('should count a command a signal ends as failed', () => {
    // Act
    const code = createShellCommandRunner().run({
      command: 'kill -TERM $$',
      folderPath: AbsolutePath.create(folder),
    });

    // Assert
    expect(code).toBe(1);
  });
});
