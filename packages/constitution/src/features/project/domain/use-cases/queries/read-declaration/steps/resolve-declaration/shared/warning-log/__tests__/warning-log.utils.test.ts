import { describe, expect, it } from 'bun:test';

import type { ProjectWarning } from '#/kernel/entities';
import { WarningKind } from '#/kernel/entities';
import { SourceKind } from '#/kernel/value-objects';

import { createWarningLog } from '../warning-log.utils';

const unreadable: ProjectWarning = {
  details: {
    file: 'rules/domains/ui/ui.md',
    source: SourceKind.Pack,
  },
  kind: WarningKind.FileUnreadable,
};

describe('createWarningLog', () => {
  it('should keep a warning once when its kind and details are given again', () => {
    // Arrange
    const log = createWarningLog();

    log.add(unreadable);

    // Act
    log.add({
      details: {
        file: 'rules/domains/ui/ui.md',
        source: SourceKind.Pack,
      },
      kind: WarningKind.FileUnreadable,
    });

    // Assert
    expect(log.list()).toStrictEqual([
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
    // Arrange
    const log = createWarningLog();

    log.add(unreadable);

    // Act
    log.add(other);

    // Assert
    expect(log.list()).toStrictEqual([
      unreadable,
      other,
    ]);
  });

  it('should list the warnings by code in declared order, each code in given order, when codes are mixed', () => {
    // Arrange
    const log = createWarningLog();

    log.add({
      details: {
        file: 'blocks/domains/ui/ui.md',
        source: SourceKind.Release,
      },
      kind: WarningKind.FileUnreadable,
    });
    log.add(unreadable);
    log.add({
      details: {
        file: 'blocks/domains/api/api.md',
        source: SourceKind.Release,
      },
      kind: WarningKind.FileUnreadable,
    });
    log.add({
      details: {
        name: 'forms',
      },
      kind: WarningKind.NameUnknown,
    });

    // Act
    const warnings = log.list();

    // Assert
    expect(warnings).toStrictEqual([
      {
        details: {
          name: 'forms',
        },
        kind: WarningKind.NameUnknown,
      },
      unreadable,
      {
        details: {
          file: 'blocks/domains/ui/ui.md',
          source: SourceKind.Release,
        },
        kind: WarningKind.FileUnreadable,
      },
      {
        details: {
          file: 'blocks/domains/api/api.md',
          source: SourceKind.Release,
        },
        kind: WarningKind.FileUnreadable,
      },
    ]);
  });
});
