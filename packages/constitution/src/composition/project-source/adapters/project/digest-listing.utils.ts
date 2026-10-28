import type { BlockListing, UnitEntry } from '#/features/project';
import { UnitEntryKind } from '#/features/project';
import type { DigestEntry, DigestListing } from '#/features/session';
import { DigestEntryKind } from '#/features/session';

const digestEntryOf = (entry: UnitEntry): DigestEntry =>
  entry.kind === UnitEntryKind.Own
    ? {
        block: entry.block,
        kind: DigestEntryKind.Own,
      }
    : {
        files: entry.files,
        id: entry.id,
        kind: DigestEntryKind.Added,
        layer: entry.layer,
      };

const digestListingOf = (listing: BlockListing): DigestListing => ({
  overrides: listing.overrides,
  repository: listing.repository,
  units: listing.units.map((unit) => ({
    ...unit,
    entries: unit.entries.map(digestEntryOf),
  })),
});

export { digestListingOf };
