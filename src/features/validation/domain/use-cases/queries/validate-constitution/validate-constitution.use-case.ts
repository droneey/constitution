import type { FileTree } from '#/features/constitution';
import { loadConstitution } from '#/features/constitution';
import type { Finding } from '#/kernel';

import type { Check } from './check.types';
import {
  abstractBlocksCheck,
  budgetCheck,
  cyclesCheck,
  frontMatterCheck,
  linksCheck,
  ownedWordsCheck,
  pluginCheck,
  requirementsCheck,
  requiresCheck,
  rulesCheck,
  seamsCheck,
} from './checks';

const CHECKS: readonly Check[] = [
  frontMatterCheck,
  requiresCheck,
  seamsCheck,
  cyclesCheck,
  abstractBlocksCheck,
  ownedWordsCheck,
  rulesCheck,
  requirementsCheck,
  budgetCheck,
  linksCheck,
  pluginCheck,
];

const compare = (left: string, right: string): number => {
  if (left === right) {
    return 0;
  }

  return left < right ? -1 : 1;
};

const byPath = (left: Finding, right: Finding): number =>
  compare(left.path, right.path) || compare(left.message, right.message);

const validateConstitution = (input: {
  tree: FileTree;
}): readonly Finding[] => {
  const { constitution, findings } = loadConstitution({
    tree: input.tree,
  });

  return [
    ...findings,
    ...CHECKS.flatMap((check) => check(constitution)),
  ].toSorted(byPath);
};

export { validateConstitution };
