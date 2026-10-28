import { PROJECT } from '#/__tests__/project-place.fixtures';
import { AbsolutePath } from '#/kernel/value-objects';

import type { AppliedFiles, Lock } from '../domain/entities';
import { ApplyError, ApplyFailure } from '../domain/errors';
import { createFakeAppliedFilesRepository } from './applied-files-repository.fake';
import { runAppliedFilesRepositorySuite } from './applied-files-repository.suite';

const projectFolderPath = AbsolutePath.create(PROJECT);

const pathOf = (filePath: AbsolutePath): string => filePath.slice(projectFolderPath.length + 1);

const filesAfter = (input: {
  files: Readonly<Record<string, string>>;
  written: readonly AppliedFiles[];
}): ReadonlyMap<string, string> => {
  const files = new Map(Object.entries(input.files));

  for (const applied of input.written) {
    for (const filePath of applied.deletedFilePaths) {
      files.delete(pathOf(filePath));
    }

    for (const file of applied.files) {
      files.set(pathOf(file.filePath), file.text);
    }
  }

  return files;
};

const locksAfter = (written: readonly AppliedFiles[]): ReadonlyMap<string, Lock> =>
  new Map(
    written.flatMap((applied) =>
      applied.locks.map((unitLock) => [
        pathOf(unitLock.unitFolderPath),
        unitLock.lock,
      ]),
    ),
  );

runAppliedFilesRepositorySuite({
  name: 'createFakeAppliedFilesRepository',
  repositoryOf: (world) => {
    const { repository, written } = createFakeAppliedFilesRepository(
      world.unwritable === undefined
        ? undefined
        : new ApplyError({
            code: ApplyFailure.NotWritten,
            details: {
              filePath: AbsolutePath.join(projectFolderPath, world.unwritable),
            },
          }),
    );

    return {
      projectFolderPath,
      repository,
      state: {
        lockOf: (unitPath) => locksAfter(written()).get(unitPath),
        textOf: (filePath) =>
          filesAfter({
            files: world.files,
            written: written(),
          }).get(filePath),
      },
    };
  },
});
