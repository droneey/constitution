import type { Axis, Layer, LoweredLevel } from '../constants';
import type { BlockId, BlockSource, RuleSlug, UnitPath } from '../value-objects';

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
  // a block the member makes active and the repository does not
  Own = 'own',
  // a block both make active, with what the member reads of it beyond the repository
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

/** The block list a session's digest closes with: core's aside, each list in the catalogue's order. */
interface BlockListing {
  readonly overrides: readonly ListedOverride[];
  readonly repository: readonly ListedBlock[];
  readonly units: readonly UnitListing[];
}

const BlockListing = {
  create: (input: BlockListing): BlockListing => ({
    overrides: input.overrides,
    repository: input.repository,
    units: input.units,
  }),
} as const;

export type { ListedBlock, ListedFiles, ListedOverride, UnitEntry, UnitListing };
export { BlockListing, UnitEntryKind };
