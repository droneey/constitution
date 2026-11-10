import { AbsolutePath } from '#/kernel/value-objects';

import { createFakeWorkingTree } from './working-tree.fake';
import { RemoteMainLine, runWorkingTreeSuite } from './working-tree.suite';

const REPOSITORY_FOLDER_PATH = '/work/project';
const MAIN_CHECKOUT_FOLDER_PATH = '/work/main';

runWorkingTreeSuite({
  name: 'createFakeWorkingTree',
  treeOf: (world) => ({
    elsewhere: AbsolutePath.create('/work/elsewhere'),
    mainCheckoutFolderPath: AbsolutePath.create(
      world.isWorktree ? MAIN_CHECKOUT_FOLDER_PATH : REPOSITORY_FOLDER_PATH,
    ),
    repositoryFolderPath: AbsolutePath.create(REPOSITORY_FOLDER_PATH),
    tree: createFakeWorkingTree({
      changed: world.untracked,
      ignored: world.ignored,
      isHeadOnMainLine: world.mainLine === RemoteMainLine.HoldsHead,
      ...(world.isWorktree
        ? {
            mainCheckout: MAIN_CHECKOUT_FOLDER_PATH,
          }
        : {}),
      repositoryFolderPath: REPOSITORY_FOLDER_PATH,
    }),
  }),
});
