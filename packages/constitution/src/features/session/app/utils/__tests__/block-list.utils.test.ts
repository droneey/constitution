import { describe, expect, it } from 'bun:test';

import { Axis, Layer } from '#/kernel/constants';
import { BlockId, BlockSource, PackPath, UnitPath } from '#/kernel/value-objects';

import type { DigestBlock, DigestListing, DigestUnitBlock } from '../../../domain/entities';
import { blockListLines } from '../block-list.utils';
import {
  addsMessage,
  LAYER_TITLES,
  leavesOutMessage,
  leftOutAxisMessage,
  MAP_HEADING,
  mapLineMessage,
  memberLineMessage,
  PACKS_TITLE,
  packedNameMessage,
} from '../digest.messages';

const unitBlockOf = (input: { id: string; pack?: string }): DigestUnitBlock => ({
  id: BlockId.create(input.id),
  source: BlockSource.create(input.pack === undefined ? undefined : PackPath.create(input.pack)),
});

const listedOf = (input: { id: string; layer: Layer; pack?: string }): DigestBlock => ({
  ...unitBlockOf(input),
  layer: input.layer,
});

describe('blockListLines', () => {
  it('should name the blocks by layer, a pack apart, then what each member adds and leaves out', () => {
    // Arrange
    const listing: DigestListing = {
      repository: [
        listedOf({
          id: 'ui',
          layer: Layer.Domain,
        }),
        listedOf({
          id: 'docs',
          layer: Layer.Domain,
        }),
        listedOf({
          id: 'browser',
          layer: Layer.Platform,
        }),
        listedOf({
          id: 'typescript',
          layer: Layer.Language,
        }),
        listedOf({
          id: 'react',
          layer: Layer.Implementation,
        }),
        listedOf({
          id: 'lint',
          layer: Layer.Implementation,
          pack: './rules',
        }),
      ],
      units: [
        {
          leftOutAxes: [
            Axis.Workflow,
          ],
          leftOutBlocks: [
            BlockId.create('browser'),
          ],
          own: [
            unitBlockOf({
              id: 'api',
            }),
            unitBlockOf({
              id: 'style',
              pack: './rules',
            }),
          ],
          unit: UnitPath.create('apps/web'),
        },
        {
          leftOutAxes: [],
          leftOutBlocks: [],
          own: [],
          unit: UnitPath.create('apps/same'),
        },
        {
          leftOutAxes: [],
          leftOutBlocks: [
            BlockId.create('ui'),
          ],
          own: [],
          unit: UnitPath.create('apps/less'),
        },
        {
          leftOutAxes: [],
          leftOutBlocks: [],
          own: [
            unitBlockOf({
              id: 'auth',
            }),
          ],
          unit: UnitPath.create('apps/more'),
        },
      ],
    };

    // Act
    const lines = blockListLines(listing);

    // Assert
    expect(lines).toStrictEqual([
      MAP_HEADING,
      mapLineMessage({
        names: [
          'ui',
          'docs',
        ],
        title: LAYER_TITLES[Layer.Domain],
      }),
      mapLineMessage({
        names: [
          'browser',
        ],
        title: LAYER_TITLES[Layer.Platform],
      }),
      mapLineMessage({
        names: [
          'typescript',
        ],
        title: LAYER_TITLES[Layer.Language],
      }),
      mapLineMessage({
        names: [
          'react',
        ],
        title: LAYER_TITLES[Layer.Implementation],
      }),
      mapLineMessage({
        names: [
          packedNameMessage({
            id: BlockId.create('lint'),
            pack: PackPath.create('./rules'),
          }),
        ],
        title: PACKS_TITLE,
      }),
      memberLineMessage({
        changes: [
          addsMessage([
            'api',
            packedNameMessage({
              id: BlockId.create('style'),
              pack: PackPath.create('./rules'),
            }),
          ]),
          leavesOutMessage([
            'browser',
            leftOutAxisMessage(Axis.Workflow),
          ]),
        ],
        unit: UnitPath.create('apps/web'),
      }),
      memberLineMessage({
        changes: [
          leavesOutMessage([
            'ui',
          ]),
        ],
        unit: UnitPath.create('apps/less'),
      }),
      memberLineMessage({
        changes: [
          addsMessage([
            'auth',
          ]),
        ],
        unit: UnitPath.create('apps/more'),
      }),
    ]);
  });

  it('should give no map when no block is active', () => {
    // Arrange
    const listing: DigestListing = {
      repository: [],
      units: [],
    };

    // Act
    const lines = blockListLines(listing);

    // Assert
    expect(lines).toStrictEqual([]);
  });
});
