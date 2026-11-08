import type { Level } from '#/kernel/constants';
import type { BlockModel } from '#/kernel/entities';

import { Block } from '../../../block/entities';
import { BlockGraph, SimilarRules } from '../../../block-graph/entities';
import { Constitution } from '../../../constitution/entities';
import type { BlockFinding } from './block-finding.types';
import type { Check, CheckInput } from './check.types';
import {
  abstractBlocksCheck,
  blockFormCheck,
  budgetCheck,
  coreChaptersCheck,
  cyclesCheck,
  decisionsCheck,
  frontMatterCheck,
  hooksCheck,
  linksCheck,
  marketplaceCheck,
  namesCheck,
  pluginCheck,
  referencesCheck,
  requirementsCheck,
  requiresCheck,
  rulesCheck,
  seamsCheck,
  termsCheck,
  wordingCheck,
} from './checks';
import type { Severity } from './held-rules';
import { isAdvice } from './held-rules';

const packChecks: readonly Check<BlockFinding>[] = [
  frontMatterCheck,
  requiresCheck,
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
  coreChaptersCheck,
  blockFormCheck,
  wordingCheck,
  namesCheck,
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
      readonly advised: readonly BlockFinding[];
      readonly findings: readonly BlockFinding[];
      readonly model: BlockModel;
      readonly stage: ValidationStage.Checked;
    };

interface ValidateConstitutionInput {
  readonly constitution: Constitution;
  readonly findings: readonly BlockFinding[];
  readonly isPack: boolean;
  readonly lowered?: ReadonlyMap<string, Level>;
}

const splitBySeverity = (
  all: readonly BlockFinding[],
  severity: Severity,
): {
  readonly advised: readonly BlockFinding[];
  readonly findings: readonly BlockFinding[];
} => ({
  advised: all.filter((finding) => isAdvice(finding, severity)),
  findings: all.filter((finding) => !isAdvice(finding, severity)),
});

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

  const severity: Severity = {
    isPack: input.isPack,
    lowered: input.lowered ?? new Map(),
  };

  if (input.isPack) {
    return {
      advice: [],
      ...splitBySeverity(ownOf(packChecks.flatMap((check) => check(checked))), severity),
      model: checked.model,
      stage: ValidationStage.Checked,
    };
  }

  return {
    advice: SimilarRules.among({
      graph: checked.graph,
      rules: constitution.rules,
    }),
    ...splitBySeverity(
      releaseChecks.flatMap((check) => check(checked)),
      severity,
    ),
    model: checked.model,
    stage: ValidationStage.Checked,
  };
};

export type { Validation };
export { ValidationStage, validateConstitution };
