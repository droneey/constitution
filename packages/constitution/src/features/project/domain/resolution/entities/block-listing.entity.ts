import type { Axis, Layer } from '#/kernel/constants';
import type { BlockId, BlockSource, UnitPath } from '#/kernel/value-objects';

interface UnitBlock {
  readonly id: BlockId;
  readonly source: BlockSource;
}

interface ListedBlock extends UnitBlock {
  readonly layer: Layer;
}

interface UnitListing {
  readonly leftOutAxes: readonly Axis[];
  readonly leftOutBlocks: readonly BlockId[];
  readonly own: readonly UnitBlock[];
  readonly unit: UnitPath;
}

interface BlockListing {
  readonly repository: readonly ListedBlock[];
  readonly units: readonly UnitListing[];
}

export type { BlockListing, ListedBlock, UnitBlock, UnitListing };
