import { createFakeFileTree } from './file-tree.fake';
import { runFileTreeSuite } from './file-tree.suite';

runFileTreeSuite({
  name: 'createFakeFileTree',
  treeOf: createFakeFileTree,
});
