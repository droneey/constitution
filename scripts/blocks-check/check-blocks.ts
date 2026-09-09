import type { FileTree } from './file-tree';
import { loadConstitution } from './load-constitution';
import type { Finding } from './models';
import { RULES } from './rules';

const compare = (left: string, right: string): number => {
  if (left === right) {
    return 0;
  }

  return left < right ? -1 : 1;
};

const byPath = (left: Finding, right: Finding): number =>
  compare(left.path, right.path) || compare(left.message, right.message);

const checkBlocks = (tree: FileTree): readonly Finding[] => {
  const { constitution, findings } = loadConstitution(tree);

  return [
    ...findings,
    ...RULES.flatMap((rule) => rule(constitution)),
  ].toSorted(byPath);
};

export { checkBlocks };
