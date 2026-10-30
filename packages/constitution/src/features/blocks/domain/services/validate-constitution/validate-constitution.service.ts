import type { BlockModel } from '#/kernel/entities';

import { Block, BlockGraph, Constitution, SimilarRules } from '../../entities';
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

interface ValidateConstitutionInput {
  readonly constitution: Constitution;
  readonly findings: readonly BlockFinding[];
  readonly isPack: boolean;
}

// Why: a block that did not load would otherwise be reported as missing by every check that names
// it.
const validateConstitution = (input: ValidateConstitutionInput): Validation => {
  const { constitution, findings } = input;
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

  if (input.isPack) {
    return {
      advice: [],
      findings: ownOf(packChecks.flatMap((check) => check(checked))),
      model: checked.model,
      stage: ValidationStage.Checked,
    };
  }

  return {
    advice: SimilarRules.among({
      graph: checked.graph,
      rules: constitution.rules,
    }),
    findings: releaseChecks.flatMap((check) => check(checked)),
    model: checked.model,
    stage: ValidationStage.Checked,
  };
};

export type { Validation };
export { ValidationStage, validateConstitution };
