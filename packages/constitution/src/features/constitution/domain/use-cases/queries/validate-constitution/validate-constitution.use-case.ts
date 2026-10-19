import type { Finding } from '#/kernel/types';
import { compareFindings } from '#/kernel/utils';

import { BASE_PREFIX } from '../../../constants';
import type {
  BindingsParser,
  FileTree,
  FrontMatterParser,
  ManifestParser,
  VocabularyParser,
} from '../../../contracts';
import { byIdOf } from '../../../utils';
import { adviseConstitution } from '../advise-constitution';
import { loadConstitution } from '../load-constitution';
import type { Check } from './check.types';
import {
  abstractBlocksCheck,
  bindingsCheck,
  blockFormCheck,
  budgetCheck,
  coreChaptersCheck,
  corePartCheck,
  cyclesCheck,
  decisionsCheck,
  frontMatterCheck,
  linksCheck,
  ownedWordsCheck,
  pluginCheck,
  presetsCheck,
  referencesCheck,
  requirementsCheck,
  requiresCheck,
  rulesCheck,
  seamsCheck,
  vocabularyCheck,
} from './checks';

const CHECKS: readonly Check[] = [
  frontMatterCheck,
  requiresCheck,
  seamsCheck,
  cyclesCheck,
  abstractBlocksCheck,
  ownedWordsCheck,
  vocabularyCheck,
  rulesCheck,
  requirementsCheck,
  presetsCheck,
  bindingsCheck,
  referencesCheck,
  budgetCheck,
  linksCheck,
  pluginCheck,
  decisionsCheck,
  corePartCheck,
  coreChaptersCheck,
  blockFormCheck,
];

interface Validation {
  advice: readonly string[];
  findings: readonly Finding[];
}

// The checks run on a sound structure only: a block that did not load would
// otherwise be reported as missing by every check that names it.
const validateConstitution = (input: {
  base?: FileTree;
  bindingsParser: BindingsParser;
  frontMatterParser: FrontMatterParser;
  manifestParser: ManifestParser;
  repository: FileTree;
  tree: FileTree;
  vocabularyParser: VocabularyParser;
}): Validation => {
  const { constitution, findings } = loadConstitution(input);
  const byId = byIdOf(constitution.blocks);
  // A pack ships no plugin, and what its base holds is the base's to report.
  const pack = input.base !== undefined;
  const ownOf = (all: readonly Finding[]): readonly Finding[] =>
    pack
      ? all.filter(
          (finding) => finding.path === BASE_PREFIX || !finding.path.startsWith(BASE_PREFIX),
        )
      : all;

  if (findings.length > 0) {
    return {
      advice: [],
      findings: ownOf(findings).toSorted(compareFindings),
    };
  }

  return {
    advice: pack
      ? []
      : adviseConstitution({
          byId,
          constitution,
        }),
    findings: ownOf(
      (pack ? CHECKS.filter((check) => check !== pluginCheck) : CHECKS).flatMap((check) =>
        check({
          byId,
          constitution,
        }),
      ),
    ).toSorted(compareFindings),
  };
};

export type { Validation };
export { validateConstitution };
