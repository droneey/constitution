import { BLOCKS_FOLDER } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';

import type {
  BindingsParser,
  FileTree,
  FileTrees,
  FrontMatterParser,
  ManifestParser,
} from '../../../contracts';
import type { SimilarRules } from '../../../entities';
import { Block, BlockGraph } from '../../../entities';
import type { BlockFinding } from './block-finding.types';
import type { Check } from './check.types';
import {
  abstractBlocksCheck,
  bindingsCheck,
  blockFormCheck,
  budgetCheck,
  configurationLanguagesCheck,
  coreChaptersCheck,
  corePartCheck,
  cyclesCheck,
  decisionsCheck,
  frontMatterCheck,
  linksCheck,
  pluginCheck,
  presetsCheck,
  referencesCheck,
  requirementsCheck,
  requiresCheck,
  rulesCheck,
  seamsCheck,
  templatesCheck,
  termsCheck,
} from './checks';
import { adviseConstitution } from './steps/advise-constitution';
import type { Base } from './steps/load-constitution';
import { loadConstitution } from './steps/load-constitution';
import { orderFindings } from './steps/order-findings';

const checks: readonly Check<BlockFinding>[] = [
  frontMatterCheck,
  requiresCheck,
  configurationLanguagesCheck,
  seamsCheck,
  cyclesCheck,
  abstractBlocksCheck,
  termsCheck,
  rulesCheck,
  requirementsCheck,
  presetsCheck,
  bindingsCheck,
  templatesCheck,
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
  readonly advice: readonly SimilarRules[];
  readonly findings: readonly BlockFinding[];
}

interface Parsers {
  readonly bindingsParser: BindingsParser;
  readonly frontMatterParser: FrontMatterParser;
  readonly manifestParser: ManifestParser;
}

// The checks run on a sound structure only: a block that did not load would
// otherwise be reported as missing by every check that names it.
const validate = (
  input: Parsers & {
    base?: Base;
    repository: FileTree;
    tree: FileTree;
  },
): Validation => {
  const { constitution, findings } = loadConstitution(input);
  const graph = BlockGraph.create(constitution.blocks);
  // A pack ships no plugin, and what its base holds is the base's to report.
  const pack = input.base !== undefined;
  const baseFiles = new Set(
    constitution.blocks
      .filter(Block.isBase)
      .flatMap(Block.filesOf)
      .map((file) => file.path),
  );

  const ownOf = (all: readonly BlockFinding[]): readonly BlockFinding[] =>
    all.filter((finding) => !baseFiles.has(finding.path));

  if (findings.length > 0) {
    return {
      advice: [],
      findings: orderFindings(ownOf(findings)),
    };
  }

  return {
    advice: pack
      ? []
      : adviseConstitution({
          graph,
          constitution,
        }),
    findings: orderFindings(
      ownOf(
        (pack ? checks.filter((check) => check !== pluginCheck) : checks).flatMap((check) =>
          check({
            graph,
            constitution,
          }),
        ),
      ),
    ),
  };
};

interface CheckBlocksInput extends Parsers {
  /** the installed Constitution a pack extends */
  readonly base?: string;
  readonly files: ProjectFiles;
  readonly folder: string;
  readonly trees: FileTrees;
}

/**
 * undefined when the folder holds no blocks.
 *
 * @throws {@link TreeError} when git cannot list the files of a tree, or a file it lists cannot be read
 */
const checkBlocks = (input: CheckBlocksInput): Validation | undefined => {
  const { folder, trees } = input;

  if (!input.files.isFolder(`${folder}/${BLOCKS_FOLDER}`)) {
    return undefined;
  }

  return validate({
    bindingsParser: input.bindingsParser,
    frontMatterParser: input.frontMatterParser,
    manifestParser: input.manifestParser,
    ...(input.base === undefined
      ? {}
      : {
          base: {
            folder: input.base,
            tree: trees.installed(input.base),
          },
        }),
    repository: trees.repository(folder),
    tree: trees.tracked(folder),
  });
};

export type { CheckBlocksInput, Validation };
export { checkBlocks };
