import { AbsolutePath } from '#/kernel/value-objects';

import { createFakeWorkingTree } from './working-tree.fake';
import { runWorkingTreeSuite } from './working-tree.suite';

runWorkingTreeSuite({
  name: 'createFakeWorkingTree',
  treeOf: (world) => ({
    elsewhere: AbsolutePath.create('/work/elsewhere'),
    repositoryFolderPath: AbsolutePath.create('/work/project'),
    tree: createFakeWorkingTree({
      changed: world.untracked,
      repositoryFolderPath: '/work/project',
    }),
  }),
});
