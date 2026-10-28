import { Layer, Level } from '#/kernel/constants';
import type { ProjectWarning } from '#/kernel/entities';
import { Met, WarningKind } from '#/kernel/entities';

import type { BlockSetAnswer } from '../../../../../../../entities';
import {
  AppliedOverrides,
  LAYER_KEYS,
  ProjectModel,
  ResolvedUnit,
} from '../../../../../../../entities';

interface NeedsInput {
  readonly model: ProjectModel;
  readonly unit: ResolvedUnit;
}

const requiresWarningsOf = (input: NeedsInput): readonly ProjectWarning[] => {
  const { model, unit } = input;

  return model.blocks
    .filter((block) => ResolvedUnit.isActive(unit, block.id))
    .flatMap((block) =>
      block.requires.flatMap((required): readonly ProjectWarning[] => {
        const need = model.byId.get(required);

        if (
          need === undefined ||
          // Stryker disable next-line ConditionalExpression: core is active in every unit, so the test after it passes it by too; it types the layer for LAYER_KEYS
          need.layer === Layer.Core ||
          ResolvedUnit.isActive(unit, required)
        ) {
          return [];
        }

        return [
          {
            details: {
              block: block.id,
              ...(need.isAbstract
                ? {
                    heirs: ProjectModel.heirsOf(model, required),
                  }
                : {}),
              key: LAYER_KEYS[need.layer],
              required,
              unit: unit.path,
            },
            kind: WarningKind.BlockNeeded,
          },
        ];
      }),
    );
};

const isUnmet = (input: {
  answer: BlockSetAnswer;
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

interface AnswersInput extends NeedsInput {
  readonly answers: readonly BlockSetAnswer[];
  readonly applied: AppliedOverrides;
}

const answersWarningsOf = (input: AnswersInput): readonly ProjectWarning[] =>
  input.answers
    .filter((answer) =>
      isUnmet({
        ...input,
        answer,
      }),
    )
    .map((answer) => ({
      details: {
        block: answer.block,
        requirement: answer.requirement,
        unit: input.unit.path,
      },
      kind: WarningKind.RequirementNotMet,
    }));

interface CheckNeedsInput {
  readonly answers: readonly BlockSetAnswer[];
  readonly applied: AppliedOverrides;
  readonly model: ProjectModel;
  readonly units: readonly ResolvedUnit[];
}

const checkNeeds = (input: CheckNeedsInput): readonly ProjectWarning[] => [
  ...input.units.flatMap((unit) =>
    requiresWarningsOf({
      model: input.model,
      unit,
    }),
  ),
  ...input.units.flatMap((unit) =>
    answersWarningsOf({
      ...input,
      unit,
    }),
  ),
];

export { checkNeeds };
