import { describe, expect, it } from 'bun:test';

import { createSha256TextHasher } from '../sha256-text-hasher.adapter';

describe('createSha256TextHasher', () => {
  it.each([
    {
      hash: 'ba7816bf8f01cfea',
      text: 'abc',
    },
    {
      hash: 'a52d159f262b2c6d',
      text: 'abd',
    },
    {
      hash: '4a99557e4033c353',
      text: 'é',
    },
  ])('should give the first 16 hexadecimal digits of the SHA-256 of $text', ({ hash, text }) => {
    // Act
    const given = createSha256TextHasher().hashOf(text);

    // Assert
    expect(given).toBe(hash);
  });
});
