import { describe, expect, it } from 'bun:test';

import { checksumOf } from '../checksum.utils';

const encoder = new TextEncoder();

describe('checksumOf', () => {
  it.each([
    {
      checksum: '4294967295',
      condition: 'the bytes are none',
      text: '',
    },
    {
      checksum: '3287646509',
      condition: 'the bytes are a word',
      text: 'hello',
    },
    {
      checksum: '1664553091',
      condition: 'their length takes two bytes',
      text: 'a'.repeat(300),
    },
    {
      checksum: '573700510',
      condition: 'their length takes three bytes',
      text: 'b'.repeat(70_000),
    },
  ])('should give what POSIX cksum prints when $condition', ({ checksum, text }) => {
    // Arrange
    const bytes = encoder.encode(text);

    // Act
    const given = checksumOf(bytes);

    // Assert
    expect(given).toBe(checksum);
  });
});
