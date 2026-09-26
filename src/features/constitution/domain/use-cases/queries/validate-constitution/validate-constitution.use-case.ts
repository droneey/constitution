import type { Finding } from '#/kernel';
import { compareFindings } from '#/kernel';

import type {
  FileTree,
  FrontMatterParser,
  ManifestParser,
} from '../../../contracts';
import { byIdOf } from '../../../utils';
import { adviseConstitution } from '../advise-constitution';
import { loadConstitution } from '../load-constitution';
import type { Check } from './check.types';
import {
  abstractBlocksCheck,
  budgetCheck,
  cyclesCheck,
  decisionsCheck,
  digestsCheck,
  frontMatterCheck,
  linksCheck,
  ownedWordsCheck,
  pluginCheck,
  referencesCheck,
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
  referencesCheck,
  budgetCheck,
  linksCheck,
  pluginCheck,
  decisionsCheck,
  digestsCheck,
];

interface Validation {
  advice: readonly string[];
  findings: readonly Finding[];
}

// The checks run on a sound structure only: a block that did not load would
// otherwise be reported as missing by every check that names it.
const validateConstitution = (input: {
  frontMatterParser: FrontMatterParser;
  manifestParser: ManifestParser;
  tree: FileTree;
}): Validation => {
  const { constitution, findings } = loadConstitution(input);
  const byId = byIdOf(constitution.blocks);

  if (findings.length > 0) {
    return {
      advice: [],
      findings: findings.toSorted(compareFindings),
    };
  }

  return {
    advice: adviseConstitution({
      byId,
      constitution,
    }),
    findings: CHECKS.flatMap((check) =>
      check({
        byId,
        constitution,
      }),
    ).toSorted(compareFindings),
  };
};

export type { Validation };
export { validateConstitution };
