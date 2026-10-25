import { describe, expect, it } from 'bun:test';

import type { ProjectWarning } from '#/kernel/entities';
import { WarningCode, WarningKind } from '#/kernel/entities';

import { createWarningLog } from '../warning-log.utils';

const unreadable: ProjectWarning = {
  code: WarningCode.Pack,
  details: {
    file: 'rules/domains/ui/ui.md',
  },
  kind: WarningKind.FileUnreadable,
};

describe('createWarningLog', () => {
  it('should keep a warning once when its code, kind and details are given again', () => {
    // Arrange
    const log = createWarningLog();

    log.add(unreadable);

    // Act
    log.add({
      code: WarningCode.Pack,
      details: {
        file: 'rules/domains/ui/ui.md',
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
      condition: 'only its code differs',
      other: {
        code: WarningCode.Constitution,
        details: {
          file: 'rules/domains/ui/ui.md',
        },
        kind: WarningKind.FileUnreadable,
      },
    },
    {
      condition: 'only its kind differs',
      other: {
        code: WarningCode.Pack,
        details: {
          file: 'rules/domains/ui/ui.md',
        },
        kind: WarningKind.FrontMatterMissing,
      },
    },
    {
      condition: 'only its details differ',
      other: {
        code: WarningCode.Pack,
        details: {
          file: 'rules/domains/api/api.md',
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
      code: WarningCode.Constitution,
      details: {
        file: 'blocks/domains/ui/ui.md',
      },
      kind: WarningKind.FileUnreadable,
    });
    log.add(unreadable);
    log.add({
      code: WarningCode.Constitution,
      details: {
        file: 'blocks/domains/api/api.md',
      },
      kind: WarningKind.FileUnreadable,
    });
    log.add({
      code: WarningCode.Unknown,
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
        code: WarningCode.Unknown,
        details: {
          name: 'forms',
        },
        kind: WarningKind.NameUnknown,
      },
      unreadable,
      {
        code: WarningCode.Constitution,
        details: {
          file: 'blocks/domains/ui/ui.md',
        },
        kind: WarningKind.FileUnreadable,
      },
      {
        code: WarningCode.Constitution,
        details: {
          file: 'blocks/domains/api/api.md',
        },
        kind: WarningKind.FileUnreadable,
      },
    ]);
  });
});
