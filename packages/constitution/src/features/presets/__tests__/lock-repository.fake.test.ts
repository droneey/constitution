import { PROJECT } from '#/__tests__/project-place.fixtures';
import { AbsolutePath } from '#/kernel/value-objects';

import { LockReadStatus } from '../domain/entities';
import { createFakeLockRepository } from './lock-repository.fake';
import { runLockRepositorySuite } from './lock-repository.suite';

const projectFolderPath = AbsolutePath.create(PROJECT);

const folderOf = (unitPath: string): AbsolutePath => AbsolutePath.join(projectFolderPath, unitPath);

runLockRepositorySuite({
  name: 'createFakeLockRepository',
  repositoryOf: (world) => ({
    folderOf,
    repository: createFakeLockRepository(
      Object.fromEntries([
        ...Object.entries(world.locks).map(([unitPath, lock]) => [
          folderOf(unitPath),
          {
            lock,
            status: LockReadStatus.Read,
          },
        ]),
        ...world.unparsed.map((unitPath) => [
          folderOf(unitPath),
          {
            status: LockReadStatus.Unparsed,
          },
        ]),
      ]),
    ),
  }),
});
