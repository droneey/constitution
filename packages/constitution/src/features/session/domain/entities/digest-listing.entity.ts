import type { Axis, Layer } from '#/kernel/constants';
import type { BlockId, BlockSource, UnitPath } from '#/kernel/value-objects';

interface DigestUnitBlock {
  readonly id: BlockId;
  readonly source: BlockSource;
}

interface DigestBlock extends DigestUnitBlock {
  readonly layer: Layer;
}

interface DigestUnit {
  readonly leftOutAxes: readonly Axis[];
  readonly leftOutBlocks: readonly BlockId[];
  readonly own: readonly DigestUnitBlock[];
  readonly unit: UnitPath;
}

interface DigestListing {
  readonly repository: readonly DigestBlock[];
  readonly units: readonly DigestUnit[];
}

export type { DigestBlock, DigestListing, DigestUnit, DigestUnitBlock };
