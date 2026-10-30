import { describe, expect, it } from 'bun:test';

import { Layer } from '#/kernel/constants';
import type { ModelBlock, ProjectWarning } from '#/kernel/entities';
import { BlockModel, ProjectUnit, WarningKind } from '#/kernel/entities';
import { BlockId, coreBlockId, repositoryUnit, SourceKind, UnitPath } from '#/kernel/value-objects';

import { BlockListing } from '../../block-listing/block-listing.entity';
import { Resolution } from '../resolution.entity';

const ui = BlockId.create('ui');

const blockOf = (id: BlockId, layer: Layer): ModelBlock => ({
  governs: [],
  id,
  isAbstract: false,
  languages: [],
  layer,
  requires: [],
});

const unitOf = (input: { blocks: readonly BlockId[]; path: UnitPath }): ProjectUnit =>
  ProjectUnit.create({
    axes: [],
    blocks: new Set(input.blocks),
    languages: new Set(),
    loweredRules: new Set(),
    packs: [],
    path: input.path,
  });

const warnedOf = (warnings: readonly ProjectWarning[]): Resolution =>
  Resolution.create({
    active: [],
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
    mustsBesideCore: [],
    units: [],
    warnings,
  });

const unreadable: ProjectWarning = {
  details: {
    file: 'rules/domains/ui/ui.md',
    source: SourceKind.Pack,
  },
  kind: WarningKind.FileUnreadable,
};

describe('Resolution.create', () => {
  it('should keep a warning once when its kind and details are given again', () => {
    // Act
    const resolution = warnedOf([
      unreadable,
      {
        details: {
          file: 'rules/domains/ui/ui.md',
          source: SourceKind.Pack,
        },
        kind: WarningKind.FileUnreadable,
      },
    ]);

    // Assert
    expect(resolution.warnings).toStrictEqual([
      unreadable,
    ]);
  });

  it.each<{
    condition: string;
    other: ProjectWarning;
  }>([
    {
      condition: 'only its kind differs',
      other: {
        details: {
          file: 'rules/domains/ui/ui.md',
          source: SourceKind.Pack,
        },
        kind: WarningKind.FrontMatterMissing,
      },
    },
    {
      condition: 'only its details differ',
      other: {
        details: {
          file: 'rules/domains/api/api.md',
          source: SourceKind.Pack,
        },
        kind: WarningKind.FileUnreadable,
      },
    },
  ])('should keep both warnings when $condition', ({ other }) => {
    // Act
    const resolution = warnedOf([
      unreadable,
      other,
    ]);

    // Assert
    expect(resolution.warnings).toStrictEqual([
      unreadable,
      other,
    ]);
  });

  it('should list the warnings by code in declared order, each code in given order, when codes are mixed', () => {
    // Arrange
    const releaseUi: ProjectWarning = {
      details: {
        file: 'blocks/domains/ui/ui.md',
        source: SourceKind.Release,
      },
      kind: WarningKind.FileUnreadable,
    };
    const releaseApi: ProjectWarning = {
      details: {
        file: 'blocks/domains/api/api.md',
        source: SourceKind.Release,
      },
      kind: WarningKind.FileUnreadable,
    };
    const nameUnknown: ProjectWarning = {
      details: {
        name: 'forms',
      },
      kind: WarningKind.NameUnknown,
    };

    // Act
    const resolution = warnedOf([
      releaseUi,
      unreadable,
      releaseApi,
      nameUnknown,
    ]);

    // Assert
    expect(resolution.warnings).toStrictEqual([
      nameUnknown,
      unreadable,
      releaseUi,
      releaseApi,
    ]);
  });
});

describe('Resolution.activeInAnyUnitCountOf', () => {
  it('should count each block some unit makes active once when a block is active in two units and one in none', () => {
    // Arrange
    const resolution = Resolution.create({
      active: [],
      listing: BlockListing.create({
        overrides: [],
        repository: [],
        units: [],
      }),
      model: BlockModel.create({
        blocks: [
          blockOf(coreBlockId, Layer.Core),
          blockOf(ui, Layer.Domain),
          blockOf(BlockId.create('lint'), Layer.Implementation),
        ],
        roles: [],
        rules: [],
      }),
      mustsBesideCore: [],
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
    const count = Resolution.activeInAnyUnitCountOf(resolution);

    // Assert
    expect(count).toBe(2);
  });
});
