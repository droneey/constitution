import type { ActiveBlock, BlockModel, MustRule, ProjectUnit } from '#/kernel/entities';
import { ProjectWarning, WarningCode } from '#/kernel/entities';

import type { BlockListing } from './block-listing.entity';

interface Resolution {
  readonly active: readonly ActiveBlock[];
  readonly listing: BlockListing;
  readonly model: BlockModel;
  /** the MUST rules of the active blocks, core's aside */
  readonly musts: readonly MustRule[];
  readonly units: readonly ProjectUnit[];
  /** each once, grouped by code in the order WarningCode declares, each group in the order given */
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

/** How many blocks of the model some unit makes active. */
const activeCountOf = (resolution: Resolution): number =>
  resolution.model.blocks.filter((block) =>
    resolution.units.some((unit) => unit.blocks.has(block.id)),
  ).length;

const create = (input: Resolution): Resolution => ({
  active: input.active,
  listing: input.listing,
  model: input.model,
  musts: input.musts,
  units: input.units,
  warnings: listedOnce(input.warnings),
});

const Resolution = {
  activeCountOf,
  create,
} as const;

export { Resolution };
