import { PROJECT } from '#/__tests__/project-place.fixtures';
import { AbsolutePath } from '#/kernel/value-objects';

import { LockReadStatus } from '../domain/lock/entities';
import { createFakeLockQueries } from './lock-repository.fake';
import { runLockQueriesSuite } from './lock-repository.suite';

const projectFolderPath = AbsolutePath.create(PROJECT);

const folderOf = (unitPath: string): AbsolutePath => AbsolutePath.join(projectFolderPath, unitPath);

runLockQueriesSuite({
  name: 'createFakeLockQueries',
  repositoryOf: (world) => ({
    folderOf,
    lockQueries: createFakeLockQueries(
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
