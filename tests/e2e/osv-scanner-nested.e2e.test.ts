import { describe, expect, it } from 'bun:test';

import { lockfilesAudited } from './osv-scanner-nested.fixtures';

describe('the audit script', () => {
  it("should scan the project's lockfiles when it is nested in a folder another repository ignores", () => {
    // Arrange
    const expected = [
      'bun.lock',
      'uv.lock',
    ];

    // Act
    const audited = lockfilesAudited();

    // Assert
    expect(audited).toStrictEqual(expected);
  });
});
