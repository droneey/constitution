import { describe, expect, it } from 'bun:test';

import { isPlainName } from '../session-names.utils';

describe('isPlainName', () => {
  it.each([
    {
      condition: 'it holds letters, digits, a dash and an underscore',
      isPlain: true,
      name: 'Session_1-a',
    },
    {
      condition: 'it is empty',
      isPlain: false,
      name: '',
    },
    {
      condition: 'it climbs to a parent folder',
      isPlain: false,
      name: '../session',
    },
    {
      condition: 'a plain name is followed by a slash',
      isPlain: false,
      name: 'session/',
    },
    {
      condition: 'a slash comes before a plain name',
      isPlain: false,
      name: '/session',
    },
  ])('should say $isPlain when $condition', ({ isPlain, name }) => {
    // Arrange
    const given = name;

    // Act
    const answer = isPlainName(given);

    // Assert
    expect(answer).toBe(isPlain);
  });
});
