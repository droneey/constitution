import { chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { createPathProgram } from '../path-program.adapter';

const PATH = 'PATH';

let folder = '';

const program = (input: { name: string; script: string }): string => {
  const path = join(folder, input.name);

  writeFileSync(path, `#!/bin/sh\n${input.script}\n`);
  chmodSync(path, 0o755);

  return path;
};

beforeEach(() => {
  folder = mkdtempSync(join(tmpdir(), 'path-program-'));
});

afterEach(() => {
  rmSync(folder, {
    force: true,
    recursive: true,
  });
});

describe('createPathProgram', () => {
  it('should find the program on PATH and read the version it answers', () => {
    // Arrange
    const path = program({
      name: 'constitution',
      script: '[ "$1" = --version ] && echo 0.81.0',
    });
    const programs = createPathProgram({
      env: {
        [PATH]: folder,
      },
      timeoutMs: 5000,
    });

    // Act
    const found = {
      found: programs.find('constitution'),
      version: programs.versionOf(path),
    };

    // Assert
    expect(found).toStrictEqual({
      found: path,
      version: '0.81.0',
    });
  });

  it('should find nothing when no program of the name is on PATH', () => {
    // Arrange
    const programs = createPathProgram({
      env: {
        [PATH]: folder,
      },
      timeoutMs: 5000,
    });

    // Act
    const found = programs.find('constitution');

    // Assert
    expect(found).toBeUndefined();
  });

  it.each([
    {
      condition: 'the program fails',
      script: 'echo 0.81.0; exit 1',
      timeoutMs: 5000,
    },
    {
      condition: 'the program answers nothing',
      script: 'exit 0',
      timeoutMs: 5000,
    },
    {
      condition: 'the program does not answer within its time',
      script: '/bin/sleep 5; echo 0.81.0',
      timeoutMs: 200,
    },
  ])('should read no version when $condition', ({ script, timeoutMs }) => {
    // Arrange
    const path = program({
      name: 'constitution',
      script,
    });
    const programs = createPathProgram({
      env: {
        [PATH]: folder,
      },
      timeoutMs,
    });

    // Act
    const version = programs.versionOf(path);

    // Assert
    expect(version).toBeUndefined();
  });
});
