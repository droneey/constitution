import { describe, expect, it } from 'bun:test';

import type { ProjectWarning } from '#/kernel/entities';
import { BlockModel, WarningKind } from '#/kernel/entities';
import { SourceKind } from '#/kernel/value-objects';

import { Resolution } from '../resolution.entity';

const warnedOf = (warnings: readonly ProjectWarning[]): Resolution =>
  Resolution.create({
    core: [],
    active: [],
    listing: {
      repository: [],
      units: [],
    },
    lowerings: new Map(),
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
