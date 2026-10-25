import { describe, expect, it } from 'bun:test';

import { orderFindings } from '../order-findings.utils';

describe('orderFindings', () => {
  it('should order findings by path, then by code, then by message when the paths and codes are equal', () => {
    // Arrange
    const findings = [
      {
        code: 'b-code',
        message: 'a',
        path: 'x.md',
      },
      {
        code: 'a-code',
        message: 'z',
        path: 'x.md',
      },
      {
        code: 'z-code',
        message: 'z',
        path: 'a.md',
      },
      {
        code: 'a-code',
        message: 'y',
        path: 'x.md',
      },
    ];

    // Act
    const sorted = orderFindings(findings);

    // Assert
    expect(sorted).toStrictEqual([
      {
        code: 'z-code',
        message: 'z',
        path: 'a.md',
      },
      {
        code: 'a-code',
        message: 'y',
        path: 'x.md',
      },
      {
        code: 'a-code',
        message: 'z',
        path: 'x.md',
      },
      {
        code: 'b-code',
        message: 'a',
        path: 'x.md',
      },
    ]);
  });
});
