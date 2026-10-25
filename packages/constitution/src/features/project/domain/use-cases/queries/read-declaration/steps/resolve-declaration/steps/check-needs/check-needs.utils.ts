import { Layer, Level } from '#/kernel/constants';
import { Met, WarningKind } from '#/kernel/entities';

import type { CatalogueAnswer } from '../../../../../../../entities';
import { AppliedOverrides, ProjectModel, ResolvedUnit } from '../../../../../../../entities';
import { keyOfLayer } from '../../shared/layer-keys';
import type { WarningLog } from '../../shared/warning-log';

interface WarnOfRequiresInput {
  readonly log: WarningLog;
  readonly model: ProjectModel;
  readonly unit: ResolvedUnit;
}

// Each unit warns of what its own blocks need and it does not list.
const warnOfRequires = (input: WarnOfRequiresInput): void => {
  const { log, model, unit } = input;

  for (const block of model.blocks) {
    if (!ResolvedUnit.isActive(unit, block.id)) {
      continue;
    }

    for (const required of block.requires) {
      const need = model.byId.get(required);

      if (
        need === undefined ||
        // Stryker disable next-line ConditionalExpression: core is active in every unit, so the test after it passes it by too
        need.layer === Layer.Core ||
        ResolvedUnit.isActive(unit, required)
      ) {
        continue;
      }

      log.add({
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

interface WarnOfAnswersInput {
  readonly answers: readonly CatalogueAnswer[];
  readonly applied: AppliedOverrides;
  readonly log: WarningLog;
  readonly model: ProjectModel;
  readonly unit: ResolvedUnit;
}

// Each unit warns of the requirements its own blocks leave unmet.
const warnOfAnswers = (input: WarnOfAnswersInput): void => {
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
