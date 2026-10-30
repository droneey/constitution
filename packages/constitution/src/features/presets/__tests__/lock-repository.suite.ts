import { describe, expect, it } from 'bun:test';

import type { AbsolutePath } from '#/kernel/value-objects';

import type { LockQueryRepository } from '../application/contracts/repositories/queries';
import type { Lock } from '../domain/lock/entities';
import { LockReadStatus, RecordKind } from '../domain/lock/entities';
import { lockOf } from './presets.fixtures';

interface LockWorld {
  readonly locks: Readonly<Record<string, Lock>>;
  readonly unparsed: readonly string[];
}

interface LockRepositorySuiteInput {
  readonly name: string;
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
    everMetDefaults: [],
    isCreatedByApply: true,
    kind: RecordKind.Settings,
    leaves: [
      'abc',
    ],
  },
  'knip.jsonc': {
    addresses: [],
    everMetDefaults: [
      'def',
    ],
    isCreatedByApply: false,
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
