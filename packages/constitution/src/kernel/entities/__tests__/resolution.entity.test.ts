import { describe, expect, it } from 'bun:test';

import { Layer } from '../../constants';
import { BlockId, coreBlockId, repositoryUnit, UnitPath } from '../../value-objects';
import { BlockListing } from '../block-listing.entity';
import { BlockModel } from '../block-model.entity';
import { ProjectUnit } from '../project-unit.entity';
import { Resolution } from '../resolution.entity';

const ui = BlockId.create('ui');
const lint = BlockId.create('lint');

// A unit of the folder that follows the blocks.
const unitOf = (input: { blocks: readonly BlockId[]; path: UnitPath }): ProjectUnit =>
  ProjectUnit.create({
    axes: [],
    blocks: new Set(input.blocks),
    languages: new Set(),
    loweredRules: new Set(),
    packs: [],
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
      listing: BlockListing.create({
        overrides: [],
        repository: [],
        units: [],
      }),
      model: BlockModel.create({
        blocks: [],
        roles: [],
        rules: [],
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
