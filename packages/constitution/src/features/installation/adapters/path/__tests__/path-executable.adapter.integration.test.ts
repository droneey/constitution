import { chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { createPathExecutable } from '../path-executable.adapter';

const PATH = 'PATH';

let folder = '';

const executable = (input: { name: string; script: string }): string => {
  const path = join(folder, input.name);

  writeFileSync(path, `#!/bin/sh\n${input.script}\n`);
  chmodSync(path, 0o755);

  return path;
};

beforeEach(() => {
  folder = mkdtempSync(join(tmpdir(), 'path-executable-'));
});

afterEach(() => {
  rmSync(folder, {
    force: true,
    recursive: true,
  });
});

describe('createPathExecutable', () => {
  it('should find the executable on PATH and read the version it answers', () => {
    // Arrange
    const path = executable({
      name: 'constitution',
      script: '[ "$1" = --version ] && echo 0.81.0',
    });
    const executables = createPathExecutable({
      env: {
        [PATH]: folder,
      },
      timeoutMs: 5000,
    });

    // Act
    const found = {
      found: executables.find('constitution'),
      version: executables.versionOf(path),
    };

    // Assert
    expect(found).toStrictEqual({
      found: path,
      version: '0.81.0',
    });
  });

  it('should find nothing when no executable of the name is on PATH', () => {
    // Arrange
    const executables = createPathExecutable({
      env: {
        [PATH]: folder,
      },
      timeoutMs: 5000,
    });

    // Act
    const found = executables.find('constitution');

    // Assert
    expect(found).toBeUndefined();
  });

  it.each([
    {
      condition: 'the executable fails',
      script: 'echo 0.81.0; exit 1',
      timeoutMs: 5000,
    },
    {
      condition: 'the executable answers nothing',
      script: 'exit 0',
      timeoutMs: 5000,
    },
    {
      condition: 'the executable does not answer within its time',
      script: '/bin/sleep 5; echo 0.81.0',
      timeoutMs: 200,
    },
  ])('should read no version when $condition', ({ script, timeoutMs }) => {
    // Arrange
    const path = executable({
      name: 'constitution',
      script,
    });
    const executables = createPathExecutable({
      env: {
        [PATH]: folder,
      },
      timeoutMs,
    });

    // Act
    const version = executables.versionOf(path);

    // Assert
    expect(version).toBeUndefined();
  });
});
