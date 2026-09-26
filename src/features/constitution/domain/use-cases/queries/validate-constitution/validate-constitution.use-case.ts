import type { Finding } from '#/kernel';
import { compareFindings } from '#/kernel';

import type {
  FileTree,
  FrontMatterParser,
  ManifestParser,
} from '../../../contracts';
import { loadConstitution } from '../load-constitution/load-constitution.use-case';
import type { Check } from './check.types';
import {
  abstractBlocksCheck,
  budgetCheck,
  cyclesCheck,
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
import { byIdOf } from './closure.utils';

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
];

// The checks run on a sound structure only: a block that did not load would
// otherwise be reported as missing by every check that names it.
const validateConstitution = (input: {
  frontMatterParser: FrontMatterParser;
  manifestParser: ManifestParser;
  tree: FileTree;
}): readonly Finding[] => {
  const { constitution, findings } = loadConstitution(input);
  const byId = byIdOf(constitution.blocks);

  return (
    findings.length > 0
      ? findings
      : CHECKS.flatMap((check) =>
          check({
            byId,
            constitution,
          }),
        )
  ).toSorted(compareFindings);
};

export { validateConstitution };
