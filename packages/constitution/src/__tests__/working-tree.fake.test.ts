import { createFakeWorkingTree } from './working-tree.fake';
import { runWorkingTreeSuite } from './working-tree.suite';

runWorkingTreeSuite({
  name: 'createFakeWorkingTree',
  treeOf: (world) => ({
    elsewhere: '/work/elsewhere',
    project: '/work/project',
    tree: createFakeWorkingTree({
      changed: world.untracked,
      project: '/work/project',
      tracked: world.committed,
    }),
  }),
});
