import { describe, expect, it } from 'bun:test';

import { ALLOWLIST, verdictOn } from './osv-scanner-preset.fixtures';

describe('the osv-scanner licence allowlist', () => {
  it('should hold only SPDX ids when osv-scanner reads it', () => {
    // Arrange
    const licences = ALLOWLIST;

    // Act
    const verdict = verdictOn(licences);

    // Assert
    expect(verdict).toStrictEqual({
      accepted: true,
      refused: [],
    });
  });

  it('should name the id osv-scanner refuses when the list holds one that is not SPDX', () => {
    // Arrange
    const licences = [
      ...ALLOWLIST,
      'Permissive',
    ];

    // Act
    const verdict = verdictOn(licences);

    // Assert
    expect(verdict).toStrictEqual({
      accepted: false,
      refused: [
        'Permissive',
      ],
    });
  });
});
