import { describe, expect, it } from 'bun:test';

import { aBlock } from '../wording.utils';

describe('aBlock', () => {
  it('should put the right article before the layer', () => {
    // Act
    const phrases = [
      aBlock('domain'),
      aBlock('implementation'),
    ];

    // Assert
    expect(phrases).toStrictEqual([
      'a domain block',
      'an implementation block',
    ]);
  });
});
