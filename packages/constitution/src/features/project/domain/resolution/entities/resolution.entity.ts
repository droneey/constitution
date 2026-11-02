import type {
  ActiveBlock,
  BlockModel,
  CoreFiles,
  Lowering,
  MustRule,
  ProjectUnit,
} from '#/kernel/entities';
import { ProjectWarning, WarningCode } from '#/kernel/entities';
import type { RuleSlug } from '#/kernel/value-objects';

import type { BlockListing } from './block-listing.entity';

interface Resolution {
  readonly active: readonly ActiveBlock[];
  readonly core: readonly CoreFiles[];
  readonly listing: BlockListing;
  readonly lowerings: ReadonlyMap<RuleSlug, readonly Lowering[]>;
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

const create = (input: Resolution): Resolution => ({
  active: input.active,
  core: input.core,
  listing: input.listing,
  lowerings: input.lowerings,
  model: input.model,
  mustsBesideCore: input.mustsBesideCore,
  units: input.units,
  warnings: listedOnce(input.warnings),
});

const Resolution = {
  create,
} as const;

export { Resolution };
