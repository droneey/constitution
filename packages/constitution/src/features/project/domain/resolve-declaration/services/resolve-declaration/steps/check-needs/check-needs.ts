import { Layer } from '#/kernel/constants';
import type { ProjectWarning } from '#/kernel/entities';
import { WarningKind } from '#/kernel/entities';

import { ProjectModel } from '../../../../../block-set/entities';
import { LAYER_KEYS } from '../../../../../project-config/entities';
import { ResolvedUnit } from '../../../../../resolution/entities';

const requiresWarningsOf = (input: {
  model: ProjectModel;
  unit: ResolvedUnit;
}): readonly ProjectWarning[] => {
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

        const children = ProjectModel.childrenOf(model, required);

        return [
          {
            details: {
              block: block.id,
              ...(children.length === 0
                ? {}
                : {
                    children,
                  }),
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

interface CheckNeedsInput {
  readonly model: ProjectModel;
  readonly units: readonly ResolvedUnit[];
}

const checkNeeds = (input: CheckNeedsInput): readonly ProjectWarning[] =>
  input.units.flatMap((unit) =>
    requiresWarningsOf({
      model: input.model,
      unit,
    }),
  );

export { checkNeeds };
