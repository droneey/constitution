import { describe, expect, it } from 'bun:test';

import { isConfigList } from '../guards.utils';

describe('isConfigList', () => {
  it.each([
    {
      raw: [
        {
          source: [
            'tokens.json',
          ],
        },
        {},
      ],
      isOne: true,
    },
    {
      raw: [],
      isOne: true,
    },
    {
      raw: {
        source: [
          'tokens.json',
        ],
      },
      isOne: false,
    },
    {
      raw: [
        {},
        [],
      ],
      isOne: false,
    },
    {
      // a default export left empty, as a module can
      raw: [
        JSON.parse('null'),
      ],
      isOne: false,
    },
    {
      raw: [
        'style-dictionary.config.ts',
      ],
      isOne: false,
    },
  ])('should tell whether $raw is a list of configurations: $isOne', ({ isOne, raw }) => {
    // Act
    const answer = isConfigList(raw);

    // Assert
    expect(answer).toBe(isOne);
  });
});
