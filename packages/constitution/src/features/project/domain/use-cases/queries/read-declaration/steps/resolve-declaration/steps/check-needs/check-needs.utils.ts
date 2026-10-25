import { Level } from '#/kernel/constants';
import { Met, WarningCode, WarningKind } from '#/kernel/entities';

import type { CatalogueAnswer } from '../../../../../../../entities';
import { AppliedOverrides, ProjectModel, ResolvedUnit } from '../../../../../../../entities';
import { keyOfLayer } from '../../shared/layer-keys';
import type { WarningLog } from '../../shared/warning-log';

// Each unit warns of what its own blocks need and it does not list.
const warnOfRequires = (input: {
  log: WarningLog;
  model: ProjectModel;
  unit: ResolvedUnit;
}): void => {
  const { log, model, unit } = input;

  for (const block of model.blocks) {
    if (!ResolvedUnit.isActive(unit, block.id)) {
      continue;
    }

    for (const required of block.requires) {
      const need = model.byId.get(required);

      if (ResolvedUnit.isActive(unit, required) || need === undefined) {
        continue;
      }

      log.add({
        code: WarningCode.Missing,
        details: {
          block: block.id,
          ...(need.isAbstract
            ? {
                heirs: ProjectModel.heirsOf(model, required),
              }
            : {}),
          key: keyOfLayer(need.layer),
          required,
          unit: unit.path,
        },
        kind: WarningKind.BlockNeeded,
      });
    }
  }
};

// A requirement a library does not meet matters where the MUST rule it names is active and kept.
const isUnmet = (input: {
  answer: CatalogueAnswer;
  applied: AppliedOverrides;
  model: ProjectModel;
  unit: ResolvedUnit;
}): boolean => {
  const { answer, unit } = input;
  const rule = input.model.rules.get(answer.requirement);

  return (
    answer.met === Met.No &&
    ResolvedUnit.isActive(unit, answer.block) &&
    rule !== undefined &&
    rule.level === Level.Must &&
    ResolvedUnit.isActiveRule(unit, rule) &&
    !AppliedOverrides.isLowered(input.applied, {
      rule: answer.requirement,
      unit: unit.path,
    })
  );
};

// Each unit warns of the requirements its own blocks leave unmet.
const warnOfAnswers = (input: {
  answers: readonly CatalogueAnswer[];
  applied: AppliedOverrides;
  log: WarningLog;
  model: ProjectModel;
  unit: ResolvedUnit;
}): void => {
  for (const answer of input.answers) {
    if (
      !isUnmet({
        ...input,
        answer,
      })
    ) {
      continue;
    }

    input.log.add({
      code: WarningCode.NotMet,
      details: {
        block: answer.block,
        requirement: answer.requirement,
        unit: input.unit.path,
      },
      kind: WarningKind.RequirementNotMet,
    });
  }
};

export { warnOfAnswers, warnOfRequires };
