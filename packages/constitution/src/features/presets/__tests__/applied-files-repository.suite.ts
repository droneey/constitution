import { describe, expect, it } from 'bun:test';

import { AbsolutePath } from '#/kernel/value-objects';

import type { AppliedFilesCommandRepository } from '../domain/contracts/repositories/commands';
import type { Lock } from '../domain/entities';
import { RecordKind } from '../domain/entities';
import { ApplyError, ApplyFailure } from '../domain/errors';
import { lockOf } from './presets.fixtures';

interface AppliedFilesWorld {
  readonly files: Readonly<Record<string, string>>;
  readonly unwritable?: string;
}

interface AppliedFilesState {
  readonly lockOf: (unitPath: string) => Lock | undefined;
  readonly textOf: (filePath: string) => string | undefined;
}

interface AppliedFilesRepositorySuiteInput {
  readonly name: string;
  readonly repositoryOf: (world: AppliedFilesWorld) => {
    readonly projectFolderPath: AbsolutePath;
    readonly repository: AppliedFilesCommandRepository;
    readonly state: AppliedFilesState;
  };
}

const lock = lockOf({
  'biome.json': {
    addresses: [],
    everMetDefaults: [],
    isCreatedByApply: true,
    kind: RecordKind.Settings,
    leaves: [
      'abc',
    ],
  },
});

const failureOf = (act: () => unknown): unknown => {
  try {
    act();
  } catch (error) {
    if (error instanceof ApplyError) {
      return {
        code: error.code,
        filePath: error.details.filePath,
      };
    }

    throw error;
  }

  return undefined;
};

const runAppliedFilesRepositorySuite = (input: AppliedFilesRepositorySuiteInput): void => {
  describe(`${input.name}: the AppliedFilesCommandRepository contract`, () => {
    it('should delete the files it names and write every file and lock', () => {
      // Arrange
      const { projectFolderPath, repository, state } = input.repositoryOf({
        files: {
          'biome.json': 'old\n',
          'gone.json': 'old\n',
        },
      });

      const at = (path: string): AbsolutePath => AbsolutePath.join(projectFolderPath, path);

      // Act
      repository.write({
        deletedFilePaths: [
          at('gone.json'),
        ],
        files: [
          {
            filePath: at('biome.json'),
            text: 'new\n',
          },
          {
            filePath: at('src/sandbox.ts'),
            text: 'export {};\n',
          },
        ],
        locks: [
          {
            lock,
            unitFolderPath: at(''),
          },
          {
            lock: {},
            unitFolderPath: at('src'),
          },
        ],
      });

      // Assert
      expect({
        files: {
          'biome.json': state.textOf('biome.json'),
          'gone.json': state.textOf('gone.json'),
          'src/sandbox.ts': state.textOf('src/sandbox.ts'),
        },
        locks: {
          '': state.lockOf(''),
          src: state.lockOf('src'),
        },
      }).toStrictEqual({
        files: {
          'biome.json': 'new\n',
          'gone.json': undefined,
          'src/sandbox.ts': 'export {};\n',
        },
        locks: {
          '': lock,
          src: {},
        },
      });
    });

    it('should put back what it wrote, and fail naming the file, when a file cannot be written', () => {
      // Arrange
      const { projectFolderPath, repository, state } = input.repositoryOf({
        files: {
          'biome.json': 'old\n',
          'gone.json': 'kept\n',
        },
        unwritable: 'locked/file.txt',
      });

      const at = (path: string): AbsolutePath => AbsolutePath.join(projectFolderPath, path);

      // Act
      const failure = failureOf(() => {
        repository.write({
          deletedFilePaths: [
            at('gone.json'),
          ],
          files: [
            {
              filePath: at('biome.json'),
              text: 'new\n',
            },
            {
              filePath: at('new/file.txt'),
              text: 'new\n',
            },
            {
              filePath: at('locked/file.txt'),
              text: 'refused\n',
            },
          ],
          locks: [
            {
              lock,
              unitFolderPath: at(''),
            },
          ],
        });
      });

      // Assert
      expect({
        failure,
        files: {
          'biome.json': state.textOf('biome.json'),
          'gone.json': state.textOf('gone.json'),
          'new/file.txt': state.textOf('new/file.txt'),
        },
        lock: state.lockOf(''),
      }).toStrictEqual({
        failure: {
          code: ApplyFailure.NotWritten,
          filePath: at('locked/file.txt'),
        },
        files: {
          'biome.json': 'old\n',
          'gone.json': 'kept\n',
          'new/file.txt': undefined,
        },
        lock: undefined,
      });
    });
  });
};

export { runAppliedFilesRepositorySuite };
