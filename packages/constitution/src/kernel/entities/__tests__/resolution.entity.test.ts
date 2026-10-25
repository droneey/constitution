import { describe, expect, it } from 'bun:test';

import { Layer } from '../../constants';
import { BlockId, coreBlockId, repositoryUnit, UnitPath } from '../../value-objects';
import { BlockListing } from '../block-listing.entity';
import { ProjectUnit } from '../project-unit.entity';
import { Resolution } from '../resolution.entity';

const ui = BlockId.create('ui');
const lint = BlockId.create('lint');

// A unit of the folder that follows the blocks.
const unitOf = (input: { blocks: readonly BlockId[]; path: UnitPath }): ProjectUnit =>
  ProjectUnit.create({
    axes: [],
    blocks: new Set(input.blocks),
    loweredRules: new Set(),
    path: input.path,
  });

describe('Resolution.activeCountOf', () => {
  it('should count each block some unit makes active once when a block is active in two units and one in none', () => {
    // Arrange
    const resolution = Resolution.create({
      active: [],
      blocks: [
        {
          id: coreBlockId,
          layer: Layer.Core,
        },
        {
          id: ui,
          layer: Layer.Domain,
        },
        {
          id: lint,
          layer: Layer.Implementation,
        },
      ],
      check: undefined,
      listing: BlockListing.create({
        overrides: [],
        repository: [],
        units: [],
      }),
      musts: [],
      units: [
        unitOf({
          blocks: [
            coreBlockId,
          ],
          path: repositoryUnit,
        }),
        unitOf({
          blocks: [
            coreBlockId,
            ui,
          ],
          path: UnitPath.create('apps/web'),
        }),
      ],
      warnings: [],
    });

    // Act
    const count = Resolution.activeCountOf(resolution);

    // Assert
    expect(count).toBe(2);
  });
});
