import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import type { Lock } from '../../../domain/entities';
import { LockReadStatus } from '../../../domain/entities';
import { ApplyError, ApplyFailure } from '../../../domain/errors';
import { createFileAppliedFilesRepository } from '../file-applied-files.repository';
import { createFileLockRepository } from '../file-lock.repository';

let folder = '';

const at = (path: string): string => join(folder, path);

const textOf = (path: string): string => readFileSync(at(path), 'utf8');

const LOCKED = 0o555;

// What the write fails with: its failure, the file it names and the code of what the system failed
// with.
const failureOf = (act: () => unknown): unknown => {
  try {
    act();
  } catch (error) {
    if (error instanceof ApplyError) {
      return {
        causeCode:
          error.cause instanceof Error && 'code' in error.cause ? error.cause.code : undefined,
        code: error.code,
        path: error.details.path,
      };
    }

    throw error;
  }

  return undefined;
};

// Its files out of their paths' order, which the lock's text puts them in.
const lock: Lock = {
  'src/sandbox.ts': {
    addresses: [],
    defaults: [
      'def',
    ],
    isWhole: true,
    leaves: [],
  },
  'biome.json': {
    addresses: [
      'name',
    ],
    defaults: [],
    isWhole: false,
    leaves: [
      'abc',
    ],
  },
};

const LOCK_TEXT =
  '{\n  "biome.json": {"leaves":["abc"],"addresses":["name"]},\n  "src/sandbox.ts": {"defaults":["def"],"whole":true}\n}\n';

beforeEach(() => {
  folder = mkdtempSync(join(tmpdir(), 'presets-files-'));
});

afterEach(() => {
  rmSync(at('locked'), {
    force: true,
    recursive: true,
  });
  rmSync(folder, {
    force: true,
    recursive: true,
  });
});

describe('createFileLockRepository', () => {
  it('should read a unit without a lock as holding an empty one', () => {
    // Act
    const read = createFileLockRepository().read(folder);

    // Assert
    expect(read).toStrictEqual({
      lock: {},
      status: LockReadStatus.Read,
    });
  });

  it('should read the lock the applied files write', () => {
    // Arrange
    writeFileSync(at('constitution.lock'), LOCK_TEXT);

    // Act
    const read = createFileLockRepository().read(folder);

    // Assert
    expect(read).toStrictEqual({
      lock,
      status: LockReadStatus.Read,
    });
  });

  it.each([
    {
      condition: 'it holds the markers a merge conflict leaves',
      text: '{\n<<<<<<< ours\n}\n',
    },
    {
      condition: 'it holds a field no lock writes',
      text: '{"biome.json": {"hashes": []}}\n',
    },
  ])('should read the lock as unparsed when $condition', ({ text }) => {
    // Arrange
    writeFileSync(at('constitution.lock'), text);

    // Act
    const read = createFileLockRepository().read(folder);

    // Assert
    expect(read).toStrictEqual({
      status: LockReadStatus.Unparsed,
    });
  });

  it('should read the lock as unparsed when it cannot be read', () => {
    // Arrange
    mkdirSync(at('constitution.lock'));

    // Act
    const read = createFileLockRepository().read(folder);

    // Assert
    expect(read).toStrictEqual({
      status: LockReadStatus.Unparsed,
    });
  });
});

describe('createFileAppliedFilesRepository', () => {
  it('should write every file, the folders it needs and each lock, one file of the lock to a line', () => {
    // Arrange
    writeFileSync(at('biome.json'), 'old\n');

    // Act
    createFileAppliedFilesRepository().write({
      files: [
        {
          path: at('biome.json'),
          text: 'new\n',
        },
        {
          path: at('src/sandbox.ts'),
          text: 'export {};\n',
        },
      ],
      locks: [
        {
          folder,
          lock,
        },
        {
          folder: at('src'),
          lock: {},
        },
      ],
    });

    // Assert
    expect([
      textOf('biome.json'),
      textOf('src/sandbox.ts'),
      textOf('constitution.lock'),
      textOf('src/constitution.lock'),
    ]).toStrictEqual([
      'new\n',
      'export {};\n',
      LOCK_TEXT,
      '{}\n',
    ]);
  });

  it('should put back what it wrote, and fail naming the file, when a file cannot be written', () => {
    // Arrange
    writeFileSync(at('biome.json'), 'old\n');
    mkdirSync(at('locked'), {
      mode: LOCKED,
    });

    // Act
    const failure = failureOf(() => {
      createFileAppliedFilesRepository().write({
        files: [
          {
            path: at('biome.json'),
            text: 'new\n',
          },
          {
            path: at('new/file.txt'),
            text: 'new\n',
          },
          {
            path: at('locked/file.txt'),
            text: 'refused\n',
          },
        ],
        locks: [],
      });
    });

    // Assert
    expect(failure).toStrictEqual({
      causeCode: 'EACCES',
      code: ApplyFailure.NotWritten,
      path: at('locked/file.txt'),
    });
    expect([
      textOf('biome.json'),
      Bun.file(at('new/file.txt')).size,
    ]).toStrictEqual([
      'old\n',
      0,
    ]);
  });
});
