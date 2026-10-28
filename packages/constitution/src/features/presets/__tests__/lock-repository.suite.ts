import { describe, expect, it } from 'bun:test';

import type { AbsolutePath } from '#/kernel/value-objects';

import type { LockQueryRepository } from '../domain/contracts/repositories/queries';
import type { Lock } from '../domain/entities';
import { LockReadStatus, RecordKind } from '../domain/entities';
import { lockOf } from './presets.fixtures';

/** A project whose units hold these locks, and one whose lock does not parse. */
interface LockWorld {
  readonly locks: Readonly<Record<string, Lock>>;
  readonly unparsed: readonly string[];
}

interface LockRepositorySuiteInput {
  readonly name: string;
  /** a repository over a project that holds the world, and the folder of a unit by its path */
  readonly repositoryOf: (world: LockWorld) => {
    readonly folderOf: (unitPath: string) => AbsolutePath;
    readonly repository: LockQueryRepository;
  };
}

const lock = lockOf({
  'biome.json': {
    addresses: [
      'name',
    ],
    defaults: [],
    isCreated: true,
    kind: RecordKind.Settings,
    leaves: [
      'abc',
    ],
  },
  'knip.jsonc': {
    addresses: [],
    defaults: [
      'def',
    ],
    isCreated: false,
    kind: RecordKind.Settings,
    leaves: [],
  },
  'src/sandbox.ts': {
    kind: RecordKind.Whole,
  },
});

const runLockRepositorySuite = (input: LockRepositorySuiteInput): void => {
  describe(`${input.name}: the LockQueryRepository contract`, () => {
    it('should read the lock a unit holds', () => {
      // Arrange
      const { folderOf, repository } = input.repositoryOf({
        locks: {
          apps: lock,
        },
        unparsed: [],
      });

      // Act
      const read = repository.read(folderOf('apps'));

      // Assert
      expect(read).toStrictEqual({
        lock,
        status: LockReadStatus.Read,
      });
    });

    it('should read a unit without a lock as holding an empty one', () => {
      // Arrange
      const { folderOf, repository } = input.repositoryOf({
        locks: {
          apps: lock,
        },
        unparsed: [],
      });

      // Act
      const read = repository.read(folderOf('packages'));

      // Assert
      expect(read).toStrictEqual({
        lock: {},
        status: LockReadStatus.Read,
      });
    });

    it('should read a lock that does not parse as unparsed', () => {
      // Arrange
      const { folderOf, repository } = input.repositoryOf({
        locks: {},
        unparsed: [
          'apps',
        ],
      });

      // Act
      const read = repository.read(folderOf('apps'));

      // Assert
      expect(read).toStrictEqual({
        status: LockReadStatus.Unparsed,
      });
    });
  });
};

export { runLockRepositorySuite };
