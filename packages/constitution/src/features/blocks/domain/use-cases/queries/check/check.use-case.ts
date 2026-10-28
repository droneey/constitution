import { BLOCKS_FOLDER_NAME } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import type { BlockModel } from '#/kernel/entities';
import { AbsolutePath } from '#/kernel/value-objects';

import type { FileTree, FileTrees, FrontMatterParser, ManifestParser } from '../../../contracts';
import type { SimilarRules } from '../../../entities';
import { Block, BlockGraph, Constitution } from '../../../entities';
import type { BlockFinding } from './block-finding.types';
import type { Check, CheckInput } from './check.types';
import {
  abstractBlocksCheck,
  blockFormCheck,
  budgetCheck,
  configurationLanguagesCheck,
  coreChaptersCheck,
  corePartCheck,
  cyclesCheck,
  decisionsCheck,
  frontMatterCheck,
  hooksCheck,
  linksCheck,
  marketplaceCheck,
  pluginCheck,
  referencesCheck,
  requirementsCheck,
  requiresCheck,
  rulesCheck,
  seamsCheck,
  termsCheck,
} from './checks';
import { adviseConstitution } from './steps/advise-constitution';
import type { BaseTree } from './steps/load-constitution';
import { loadConstitution } from './steps/load-constitution';

const packChecks: readonly Check<BlockFinding>[] = [
  frontMatterCheck,
  requiresCheck,
  configurationLanguagesCheck,
  seamsCheck,
  cyclesCheck,
  abstractBlocksCheck,
  termsCheck,
  rulesCheck,
  requirementsCheck,
  referencesCheck,
  budgetCheck,
  linksCheck,
  decisionsCheck,
  corePartCheck,
  coreChaptersCheck,
  blockFormCheck,
];

const releaseChecks: readonly Check<BlockFinding>[] = [
  ...packChecks,
  pluginCheck,
  marketplaceCheck,
  hooksCheck,
];

enum ValidationStage {
  Unloaded = 'unloaded',
  Checked = 'checked',
}

type Validation =
  | {
      readonly findings: readonly BlockFinding[];
      readonly stage: ValidationStage.Unloaded;
    }
  | {
      readonly advice: readonly SimilarRules[];
      readonly findings: readonly BlockFinding[];
      readonly model: BlockModel;
      readonly stage: ValidationStage.Checked;
    };

interface Parsers {
  readonly frontMatterParser: FrontMatterParser;
  readonly manifestParser: ManifestParser;
}

// Why: a block that did not load would otherwise be reported as missing by every check that names
// it.
/**
 * @throws {TreeError} when git cannot list the files of a tree, or a file it lists cannot be read
 */
const validate = (
  input: Parsers & {
    base?: BaseTree;
    repository: FileTree;
    tree: FileTree;
  },
): Validation => {
  const { constitution, findings } = loadConstitution(input);
  const checked: CheckInput = {
    constitution,
    graph: BlockGraph.create(constitution.blocks),
    model: Constitution.modelOf(constitution),
  };
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
      findings: ownOf(findings),
      stage: ValidationStage.Unloaded,
    };
  }

  if (input.base !== undefined) {
    return {
      advice: [],
      findings: ownOf(packChecks.flatMap((check) => check(checked))),
      model: checked.model,
      stage: ValidationStage.Checked,
    };
  }

  return {
    advice: adviseConstitution(checked),
    findings: releaseChecks.flatMap((check) => check(checked)),
    model: checked.model,
    stage: ValidationStage.Checked,
  };
};

interface PackBase {
  readonly folder: string;
  readonly folderPath: AbsolutePath;
}

interface CheckBlocksInput extends Parsers {
  readonly base?: PackBase;
  readonly files: ProjectFiles;
  readonly folderPath: AbsolutePath;
  readonly trees: FileTrees;
}

/**
 * @throws {TreeError} when git cannot list the files of a tree, or a file it lists cannot be
 * read
 */
const checkBlocks = (input: CheckBlocksInput): Validation | undefined => {
  const { folderPath, trees } = input;

  if (!input.files.isFolder(AbsolutePath.join(folderPath, BLOCKS_FOLDER_NAME))) {
    return undefined;
  }

  return validate({
    frontMatterParser: input.frontMatterParser,
    manifestParser: input.manifestParser,
    ...(input.base === undefined
      ? {}
      : {
          base: {
            folder: input.base.folder,
            tree: trees.installed(input.base.folderPath),
          },
        }),
    repository: trees.repository(folderPath),
    tree: trees.tracked(folderPath),
  });
};

export type { CheckBlocksInput, PackBase, Validation };
export { checkBlocks, ValidationStage };
