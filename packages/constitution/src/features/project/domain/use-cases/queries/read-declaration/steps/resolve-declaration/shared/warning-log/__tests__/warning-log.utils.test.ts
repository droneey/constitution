import { describe, expect, it } from 'bun:test';

import { WarningCode } from '#/kernel/entities';

import { createWarningLog } from '../warning-log.utils';

describe('createWarningLog', () => {
  it('should keep a warning once when its code and message are given again', () => {
    // Arrange
    const log = createWarningLog();

    log.add({
      code: WarningCode.Pack,
      message: 'rules is not installed',
    });
    log.add({
      code: WarningCode.Constitution,
      message: 'rules is not installed',
    });

    // Act
    log.add({
      code: WarningCode.Pack,
      message: 'rules is not installed',
    });

    // Assert
    expect(log.list()).toStrictEqual([
      {
        code: WarningCode.Pack,
        message: 'rules is not installed',
      },
      {
        code: WarningCode.Constitution,
        message: 'rules is not installed',
      },
    ]);
  });

  it('should list the warnings by code in declared order, each code in given order, when codes are mixed', () => {
    // Arrange
    const log = createWarningLog();

    log.add({
      code: WarningCode.Constitution,
      message: 'first constitution',
    });
    log.add({
      code: WarningCode.Pack,
      message: 'first pack',
    });
    log.add({
      code: WarningCode.Constitution,
      message: 'second constitution',
    });
    log.add({
      code: WarningCode.Missing,
      message: 'missing',
    });

    // Act
    const warnings = log.list();

    // Assert
    expect(warnings).toStrictEqual([
      {
        code: WarningCode.Missing,
        message: 'missing',
      },
      {
        code: WarningCode.Pack,
        message: 'first pack',
      },
      {
        code: WarningCode.Constitution,
        message: 'first constitution',
      },
      {
        code: WarningCode.Constitution,
        message: 'second constitution',
      },
    ]);
  });
});
