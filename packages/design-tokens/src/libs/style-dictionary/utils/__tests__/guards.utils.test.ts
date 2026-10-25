import { describe, expect, it } from 'bun:test';

import { isConfigOfMode } from '../guards.utils';

describe('isConfigOfMode', () => {
  it.each([
    {
      name: 'a function',
      raw: () => ({}),
      isOne: true,
    },
    {
      name: 'a list of configurations',
      raw: [
        {},
      ],
      isOne: false,
    },
    {
      name: 'a configuration',
      raw: {
        platforms: {},
      },
      isOne: false,
    },
    {
      name: 'no default export',
      raw: undefined,
      isOne: false,
    },
  ])('should tell whether $name is a configuration of a mode: $isOne', ({ isOne, raw }) => {
    // Act
    const answer = isConfigOfMode(raw);

    // Assert
    expect(answer).toBe(isOne);
  });
});
