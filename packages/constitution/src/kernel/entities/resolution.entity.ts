import type { Layer } from '../constants';
import type { BlockId } from '../value-objects';
import type { ActiveBlock } from './active-block.entity';
import type { BlockListing } from './block-listing.entity';
import type { BlockModel } from './block-model.entity';
import type { MustRule } from './must-rule.entity';
import type { ProjectUnit } from './project-unit.entity';
import type { ProjectWarning } from './project-warning.entity';

interface ResolvedBlock {
  readonly id: BlockId;
  readonly layer: Layer;
}

interface Resolution {
  readonly active: readonly ActiveBlock[];
  /** every block of the block set */
  readonly blocks: readonly ResolvedBlock[];
  readonly check?: string;
  readonly listing: BlockListing;
  readonly model: BlockModel;
  /** the MUST rules of the active blocks, core's aside */
  readonly musts: readonly MustRule[];
  readonly units: readonly ProjectUnit[];
  readonly warnings: readonly ProjectWarning[];
}

const Resolution = {
  /** how many blocks of the block set some unit makes active */
  activeCountOf: (resolution: Resolution): number =>
    resolution.blocks.filter((block) => resolution.units.some((unit) => unit.blocks.has(block.id)))
      .length,
  /** check is undefined when the project names none */
  create: (
    input: Omit<Resolution, 'check'> & {
      readonly check: string | undefined;
    },
  ): Resolution => ({
    active: input.active,
    blocks: input.blocks,
    ...(input.check === undefined
      ? {}
      : {
          check: input.check,
        }),
    listing: input.listing,
    model: input.model,
    musts: input.musts,
    units: input.units,
    warnings: input.warnings,
  }),
} as const;

export { Resolution };
