import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { goldenFileText, goldenOf } from '#/__tests__/golden.fixtures';
import { AbsolutePath } from '#/kernel/value-objects';

import { runAppliedFilesRepositorySuite } from '../../../__tests__/applied-files-repository.suite';
import { runLockRepositorySuite } from '../../../__tests__/lock-repository.suite';
import { lockOf } from '../../../__tests__/presets.fixtures';
import type { Lock } from '../../../domain/entities';
import { LockReadStatus, RecordKind } from '../../../domain/entities';
import { ApplyError } from '../../../domain/errors';
import { createFileAppliedFilesRepository } from '../file-applied-files.repository';
import { createFileLockRepository } from '../file-lock.repository';

let folder = '';

const at = (path: string): AbsolutePath => AbsolutePath.create(join(folder, path));

const LOCKED = 0o555;
const LOCK_FILE = 'constitution.lock';

const writeFiles = (files: Readonly<Record<string, string>>): void => {
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(join(folder, path, '..'), {
      recursive: true,
    });
    writeFileSync(at(path), text);
  }
};

const textOf = (path: string): string | undefined =>
  existsSync(at(path)) ? readFileSync(at(path), 'utf8') : undefined;

// A unit's lock as the lock repository reads it, where the unit holds one.
const lockAt = (unitPath: string): Lock | undefined => {
  const read = createFileLockRepository().read(at(unitPath));

  return existsSync(at(join(unitPath, LOCK_FILE))) && read.status === LockReadStatus.Read
    ? read.lock
    : undefined;
};

const writeLocks = (locks: Readonly<Record<string, Lock>>): void => {
  createFileAppliedFilesRepository().write({
    deletedFilePaths: [],
    files: [],
    locks: Object.entries(locks).map(([unitPath, lock]) => ({
      lock,
      unitFolderPath: at(unitPath),
    })),
  });
};

// The code of what the system failed with, which the failure of a write keeps as its cause.
const causeCodeOf = (act: () => unknown): unknown => {
  try {
    act();
  } catch (error) {
    if (error instanceof ApplyError && error.cause instanceof Error && 'code' in error.cause) {
      return error.cause.code;
    }

    throw error;
  }

  return undefined;
};

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
  it.each([
    {
      condition: 'it holds the markers a merge conflict leaves',
      text: '{\n<<<<<<< ours\n}\n',
    },
    {
      condition: 'it holds a field no lock writes',
      text: '{"biome.json": {"hashes": []}}\n',
    },
    {
      condition: 'it names a file by an absolute path',
      text: '{"/biome.json": {}}\n',
    },
  ])('should read the lock as unparsed when $condition', ({ text }) => {
    // Arrange
    writeFileSync(at(LOCK_FILE), text);

    // Act
    const read = createFileLockRepository().read(at(''));

    // Assert
    expect(read).toStrictEqual({
      status: LockReadStatus.Unparsed,
    });
  });

  it('should read the lock as unparsed when it cannot be read', () => {
    // Arrange
    mkdirSync(at(LOCK_FILE));

    // Act
    const read = createFileLockRepository().read(at(''));

    // Assert
    expect(read).toStrictEqual({
      status: LockReadStatus.Unparsed,
    });
  });
});

describe('createFileAppliedFilesRepository', () => {
  it('should write a lock one file to a line, in the order of their paths, as its golden file shows', async () => {
    // Act
    writeLocks({
      '': lockOf({
        'src/sandbox.ts': {
          kind: RecordKind.Whole,
        },
        'tsconfig.json': {
          addresses: [],
          defaults: [],
          isCreated: true,
          kind: RecordKind.Settings,
          leaves: [],
        },
        'biome.json': {
          addresses: [
            'name',
          ],
          defaults: [
            'def',
          ],
          isCreated: true,
          kind: RecordKind.Settings,
          leaves: [
            'abc',
          ],
        },
      }),
      empty: {},
    });

    const written = goldenOf({
      'a lock of three files': textOf(LOCK_FILE),
      'an empty lock': textOf(join('empty', LOCK_FILE)),
    });

    // Assert
    expect(written).toBe(
      await goldenFileText(new URL('lock.golden.txt', import.meta.url), written),
    );
  });

  it('should keep what the system failed with as the cause when a file cannot be written', () => {
    // Arrange
    mkdirSync(at('locked'), {
      mode: LOCKED,
    });

    // Act
    const causeCode = causeCodeOf(() => {
      createFileAppliedFilesRepository().write({
        deletedFilePaths: [],
        files: [
          {
            filePath: at('locked/file.txt'),
            text: 'refused\n',
          },
        ],
        locks: [],
      });
    });

    // Assert
    expect(causeCode).toBe('EACCES');
  });
});

runLockRepositorySuite({
  name: 'createFileLockRepository',
  repositoryOf: (world) => {
    writeLocks(world.locks);

    for (const unitPath of world.unparsed) {
      writeFiles({
        [join(unitPath, LOCK_FILE)]: '{\n<<<<<<< ours\n}\n',
      });
    }

    return {
      folderOf: at,
      repository: createFileLockRepository(),
    };
  },
});

runAppliedFilesRepositorySuite({
  name: 'createFileAppliedFilesRepository',
  repositoryOf: (world) => {
    writeFiles(world.files);

    if (world.unwritable !== undefined) {
      mkdirSync(join(folder, world.unwritable, '..'), {
        mode: LOCKED,
      });
    }

    return {
      projectFolderPath: at(''),
      repository: createFileAppliedFilesRepository(),
      state: {
        lockOf: lockAt,
        textOf,
      },
    };
  },
});
