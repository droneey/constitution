import type { ActiveBlock, BlockModel, MustRule, ProjectUnit } from '#/kernel/entities';
import { ProjectWarning, WarningCode } from '#/kernel/entities';

import type { BlockListing } from './block-listing.entity';

interface Resolution {
  readonly active: readonly ActiveBlock[];
  readonly listing: BlockListing;
  readonly model: BlockModel;
  readonly mustsBesideCore: readonly MustRule[];
  readonly units: readonly ProjectUnit[];
  readonly warnings: readonly ProjectWarning[];
}

const codes: readonly WarningCode[] = Object.values(WarningCode);

const listedOnce = (warnings: readonly ProjectWarning[]): readonly ProjectWarning[] => {
  const given = new Map(
    warnings.map((warning) => [
      `${warning.kind}\n${JSON.stringify(warning.details)}`,
      warning,
    ]),
  );

  return codes.flatMap((code) =>
    [
      ...given.values(),
    ].filter((warning) => ProjectWarning.codeOf(warning) === code),
  );
};

const activeInAnyUnitCountOf = (resolution: Resolution): number =>
  resolution.model.blocks.filter((block) =>
    resolution.units.some((unit) => unit.blocks.has(block.id)),
  ).length;

const create = (input: Resolution): Resolution => ({
  active: input.active,
  listing: input.listing,
  model: input.model,
  mustsBesideCore: input.mustsBesideCore,
  units: input.units,
  warnings: listedOnce(input.warnings),
});

const Resolution = {
  activeInAnyUnitCountOf,
  create,
} as const;

export { Resolution };
