import type { Axis, Layer, LoweredLevel } from '#/kernel/constants';
import type { BlockId, BlockSource, RuleSlug, UnitPath } from '#/kernel/value-objects';

interface DigestFiles {
  readonly axis: Axis;
  readonly chapters: readonly string[];
  readonly seams: readonly BlockId[];
}

interface DigestBlock {
  readonly files: readonly DigestFiles[];
  readonly id: BlockId;
  readonly layer: Layer;
  readonly source: BlockSource;
  readonly summary?: string;
}

enum DigestEntryKind {
  /** a block the member makes active and the repository does not */
  Own = 'own',
  /** a block both make active, with what the member reads of it beyond the repository */
  Added = 'added',
}

type DigestEntry =
  | {
      readonly block: DigestBlock;
      readonly kind: DigestEntryKind.Own;
    }
  | {
      readonly files: readonly DigestFiles[];
      readonly id: BlockId;
      readonly kind: DigestEntryKind.Added;
      readonly layer: Layer;
    };

interface DigestUnit {
  readonly entries: readonly DigestEntry[];
  readonly leftOutAxes: readonly Axis[];
  readonly leftOutBlocks: readonly BlockId[];
  readonly unit: UnitPath;
}

interface DigestOverride {
  readonly level: LoweredLevel;
  readonly rule: RuleSlug;
  readonly unit: UnitPath;
  readonly until?: Temporal.PlainDate;
}

/** The blocks a session's digest lists, each list in the block set's order; the overrides print before them. */
interface DigestListing {
  readonly overrides: readonly DigestOverride[];
  readonly repository: readonly DigestBlock[];
  readonly units: readonly DigestUnit[];
}

export type { DigestBlock, DigestEntry, DigestFiles, DigestListing, DigestOverride, DigestUnit };
export { DigestEntryKind };
