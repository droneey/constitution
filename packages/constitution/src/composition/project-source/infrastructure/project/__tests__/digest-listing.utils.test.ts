import { describe, expect, it } from 'bun:test';

import type { BlockListing } from '#/features/project';
import { UnitEntryKind } from '#/features/project';
import { DigestEntryKind } from '#/features/session';
import { Axis, Layer, Level } from '#/kernel/constants';
import { BlockId, BlockSource, RuleSlug, repositoryUnit, UnitPath } from '#/kernel/value-objects';

import { digestListingOf } from '../digest-listing.utils';

const files = [
  {
    axis: Axis.Foundation,
    chapters: [
      'tokens',
    ],
    seams: [
      BlockId.create('ui'),
    ],
  },
];
const block = {
  files,
  id: BlockId.create('design-system'),
  layer: Layer.Domain,
  source: BlockSource.create(undefined),
  summary: 'The tokens of a look.',
};
const override: BlockListing['overrides'][number] = {
  level: Level.May,
  rule: RuleSlug.create('agent-file-restates-no-rule'),
  unit: repositoryUnit,
  until: Temporal.PlainDate.from('2026-12-31'),
};
const docs = UnitPath.create('apps/docs');

describe('digestListingOf', () => {
  it('should give the session the blocks, member entries and overrides the project lists', () => {
    // Arrange
    const listing: BlockListing = {
      overrides: [
        override,
      ],
      repository: [
        block,
      ],
      units: [
        {
          entries: [
            {
              block,
              kind: UnitEntryKind.Own,
            },
            {
              files,
              id: BlockId.create('typescript'),
              kind: UnitEntryKind.Added,
              layer: Layer.Language,
            },
          ],
          leftOutAxes: [
            Axis.Workflow,
          ],
          leftOutBlocks: [
            BlockId.create('lefthook'),
          ],
          unit: docs,
        },
      ],
    };

    // Act
    const digested = digestListingOf(listing);

    // Assert
    expect(digested).toStrictEqual({
      overrides: [
        override,
      ],
      repository: [
        block,
      ],
      units: [
        {
          entries: [
            {
              block,
              kind: DigestEntryKind.Own,
            },
            {
              files,
              id: BlockId.create('typescript'),
              kind: DigestEntryKind.Added,
              layer: Layer.Language,
            },
          ],
          leftOutAxes: [
            Axis.Workflow,
          ],
          leftOutBlocks: [
            BlockId.create('lefthook'),
          ],
          unit: docs,
        },
      ],
    });
  });
});
