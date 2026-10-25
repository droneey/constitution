import { describe, expect, it } from 'bun:test';

import { orderFindings } from '../order-findings.utils';

describe('orderFindings', () => {
  it('should order findings by path, then by code, and keep the given order when the paths and codes are equal', () => {
    // Arrange
    const findings = [
      {
        code: 'b-code',
        details: {
          id: 'a',
        },
        path: 'x.md',
      },
      {
        code: 'a-code',
        details: {
          id: 'z',
        },
        path: 'x.md',
      },
      {
        code: 'z-code',
        details: {
          id: 'z',
        },
        path: 'a.md',
      },
      {
        code: 'a-code',
        details: {
          id: 'y',
        },
        path: 'x.md',
      },
    ];

    // Act
    const sorted = orderFindings(findings);

    // Assert
    expect(sorted).toStrictEqual([
      {
        code: 'z-code',
        details: {
          id: 'z',
        },
        path: 'a.md',
      },
      {
        code: 'a-code',
        details: {
          id: 'z',
        },
        path: 'x.md',
      },
      {
        code: 'a-code',
        details: {
          id: 'y',
        },
        path: 'x.md',
      },
      {
        code: 'b-code',
        details: {
          id: 'a',
        },
        path: 'x.md',
      },
    ]);
  });
});
