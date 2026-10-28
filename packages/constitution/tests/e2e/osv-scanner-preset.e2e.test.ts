import { describe, expect, it } from 'bun:test';

import { allowlist, imageLicences, verdictOn } from './osv-scanner-preset.fixtures';

describe('the osv-scanner licence allowlist', () => {
  it('should hold only SPDX ids when osv-scanner reads it', () => {
    // Arrange
    const licences = allowlist;

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
      ...allowlist,
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

  it('should check no licence when it scans an image', () => {
    // Act
    const licences = imageLicences;

    // Assert
    expect(licences).toStrictEqual([]);
  });
});
