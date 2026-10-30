import type { Axis, Layer, LoweredLevel } from '#/kernel/constants';
import type { BlockId, BlockSource, RuleSlug, UnitPath } from '#/kernel/value-objects';

interface ListedFiles {
  readonly axis: Axis;
  readonly chapters: readonly string[];
  readonly seams: readonly BlockId[];
}

interface ListedBlock {
  readonly files: readonly ListedFiles[];
  readonly id: BlockId;
  readonly layer: Layer;
  readonly source: BlockSource;
  readonly summary?: string;
}

enum UnitEntryKind {
  Own = 'own',
  Added = 'added',
}

type UnitEntry =
  | {
      readonly block: ListedBlock;
      readonly kind: UnitEntryKind.Own;
    }
  | {
      readonly files: readonly ListedFiles[];
      readonly id: BlockId;
      readonly kind: UnitEntryKind.Added;
      readonly layer: Layer;
    };

interface UnitListing {
  readonly entries: readonly UnitEntry[];
  readonly leftOutAxes: readonly Axis[];
  readonly leftOutBlocks: readonly BlockId[];
  readonly unit: UnitPath;
}

interface ListedOverride {
  readonly level: LoweredLevel;
  readonly rule: RuleSlug;
  readonly unit: UnitPath;
  readonly until?: Temporal.PlainDate;
}

interface BlockListing {
  readonly overrides: readonly ListedOverride[];
  readonly repository: readonly ListedBlock[];
  readonly units: readonly UnitListing[];
}

const create = (input: BlockListing): BlockListing => ({
  overrides: input.overrides,
  repository: input.repository,
  units: input.units,
});

const BlockListing = {
  create,
} as const;

export type { ListedBlock, ListedFiles, ListedOverride, UnitEntry, UnitListing };
export { BlockListing, UnitEntryKind };
