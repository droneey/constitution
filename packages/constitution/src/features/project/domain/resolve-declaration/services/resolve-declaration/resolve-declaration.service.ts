import { ProjectUnit } from '#/kernel/entities';

import type { BlockCards, BlockSetSource } from '../../../block-set/entities';
import { ProjectModel } from '../../../block-set/entities';
import type { ProjectConfig } from '../../../project-config/entities';
import { UnreadMember } from '../../../project-config/entities';
import { Resolution } from '../../../resolution/entities';
import { activateBlocks } from './steps/activate-blocks';
import { applyOverrides } from './steps/apply-overrides';
import { checkNeeds } from './steps/check-needs';
import { listBlocks } from './steps/list-blocks';
import { readBlockSet } from './steps/read-block-set';
import { resolveUnits } from './steps/resolve-units';

interface ResolveDeclarationInput {
  readonly cards: BlockCards;
  readonly config: ProjectConfig;
  readonly sources: readonly BlockSetSource[];
  readonly today: Temporal.PlainDate;
}

const resolveDeclaration = (input: ResolveDeclarationInput): Resolution => {
  const read = readBlockSet({
    cards: input.cards,
    sources: input.sources,
  });
  const { blockSet } = read;
  const model = ProjectModel.create(blockSet);
  const resolved = resolveUnits({
    config: input.config,
    model,
  });
  const { units } = resolved;
  const overrides = applyOverrides({
    config: input.config,
    model,
    today: input.today,
  });
  const { applied } = overrides;
  const activated = activateBlocks({
    applied,
    model,
    rules: blockSet.rules,
    units,
  });

  return Resolution.create({
    active: activated.active,
    listing: listBlocks({
      applied,
      model,
      units,
    }),
    model: read.model,
    mustsBesideCore: activated.mustsBesideCore,
    units: units.map((unit) =>
      ProjectUnit.create({
        axes: [
          ...unit.axes,
        ],
        blocks: unit.blocks,
        languages: ProjectModel.languagesOf(model, unit.blocks),
        loweredRules: applied.loweredIn.get(unit.path) ?? new Set(),
        name: unit.name,
        packs: unit.packs,
        path: unit.path,
      }),
    ),
    warnings: [
      ...read.warnings,
      ...resolved.warnings,
      ...overrides.warnings,
      ...checkNeeds({
        answers: blockSet.answers,
        applied,
        model,
        units,
      }),
      ...input.config.unread.map(UnreadMember.warningOf),
    ],
  });
};

export { resolveDeclaration };
